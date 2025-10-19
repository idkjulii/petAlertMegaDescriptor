from pathlib import Path
from dotenv import load_dotenv
import os

# Carga .env desde la carpeta backend (donde está este archivo)
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

# Log mínimo para confirmar
if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_KEY"):
    print("WARNING: No se encontraron variables de Supabase en .env")
else:
    print("OK: Variables de Supabase cargadas desde", ENV_PATH)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import vision
from supabase import create_client, Client
import io, traceback, asyncio
from typing import List, Dict, Any

# Importar los routers
from routers import reports_labels as reports_labels_router
from routers import matches as matches_router
from routers import ai_search as ai_search_router
from routers import embeddings_supabase as embeddings_router

# =========================
# Configuración base
# =========================
BASE_DIR = Path(__file__).parent                 # carpeta: .../backend

# Configuración de Google Cloud Vision
GOOGLE_KEY_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "google-vision-key.json")
cred_path = BASE_DIR / GOOGLE_KEY_PATH

if not cred_path.exists():
    raise RuntimeError(f"ERROR: Credencial no encontrada: {cred_path}")

# Exporta la var para los SDKs de Google
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(cred_path)

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Variables de Supabase no encontradas en .env")
    supabase_client = None
else:
    supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Orígenes permitidos (para el front). En .env podés setear:
# ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

# =========================
# App FastAPI
# =========================
app = FastAPI(title="PetAlert Vision API", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],  # WARNING: en prod, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(reports_labels_router.router)
app.include_router(matches_router.router)
app.include_router(ai_search_router.router)
app.include_router(embeddings_router.router)

# Cliente de Google Cloud Vision
vision_client = vision.ImageAnnotatorClient()

# =========================
# Helpers
# =========================
def tr_es(text: str) -> str:
    """
    Placeholder para traducción.
    Por ahora devuelve el mismo texto.
    Más adelante se puede reemplazar por OpenAI o Google Translate API.
    """
    return text

def _read_bytes(upload: UploadFile) -> bytes:
    """Lee el contenido de un archivo subido."""
    content = upload.file.read() if hasattr(upload, "file") else None
    if not content:
        content = upload.filename and upload.read()
    return content or b""

def _dominant_colors(props_response) -> List[str]:
    """Devuelve hasta 3 colores dominantes en formato hex (si está disponible)."""
    try:
        colors = props_response.image_properties_annotation.dominant_colors.colors
        top = []
        for c in colors[:3]:
            r, g, b = int(c.color.red), int(c.color.green), int(c.color.blue)
            top.append(f"#{r:02X}{g:02X}{b:02X}")
        return top
    except Exception:
        return []

async def _save_to_supabase(data: Dict[str, Any]) -> bool:
    """
    Guarda datos en Supabase si está configurado.
    Retorna True si se guardó exitosamente, False en caso contrario.
    """
    if not supabase_client:
        return False
    
    try:
        # Aquí puedes agregar la lógica para guardar en Supabase
        # Por ejemplo, guardar análisis de imágenes en una tabla
        result = supabase_client.table("image_analyses").insert(data).execute()
        return True
    except Exception as e:
        print(f"Error guardando en Supabase: {e}")
        return False

# =========================
# Endpoints
# =========================
@app.get("/health")
async def health():
    """Endpoint de salud para verificar que la API está funcionando."""
    supabase_status = "conectado" if supabase_client else "no configurado"
    return {
        "status": "ok", 
        "message": "PetAlert Vision API activa",
        "supabase": supabase_status,
        "google_vision": "configurado"
    }

@app.get("/version")
async def version():
    """Endpoint para obtener información de la versión."""
    return {
        "version": app.version, 
        "allowed_origins": ALLOWED_ORIGINS or ["*"],
        "features": ["google_vision", "supabase" if supabase_client else "no_supabase"]
    }

@app.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analiza una imagen usando Google Cloud Vision API.
    Detecta etiquetas y colores dominantes.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Archivo vacío o no leído.")

        image = vision.Image(content=content)

        # Detección de etiquetas
        label_resp = vision_client.label_detection(image=image)
        if label_resp.error.message:
            raise HTTPException(status_code=502, detail=f"Vision label_detection: {label_resp.error.message}")

        labels = []
        for lb in label_resp.label_annotations:
            # Usar la función placeholder tr_es() en lugar de googletrans
            name_es = tr_es(lb.description)
            labels.append({
                "label": name_es, 
                "score": round(lb.score * 100, 2),
                "original_label": lb.description
            })

        # Propiedades de imagen (colores dominantes)
        prop_resp = vision_client.image_properties(image=image)
        colors = []
        if not prop_resp.error.message:
            colors = _dominant_colors(prop_resp)

        # Preparar datos para Supabase
        analysis_data = {
            "labels": labels,
            "colors": colors,
            "file_name": file.filename,
            "file_size": len(content),
            "created_at": "now()"
        }

        # Intentar guardar en Supabase
        saved_to_supabase = await _save_to_supabase(analysis_data)

        return {
            "labels": labels,
            "colors": colors,
            "supabase_saved": saved_to_supabase,
            "debug": {
                "raw_top_labels_en": [lb.description for lb in label_resp.label_annotations[:5]],
                "total_labels_detected": len(label_resp.label_annotations)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error analizando la imagen: {e}")

@app.post("/caption")
async def caption_image(file: UploadFile = File(...)):
    """
    Genera una frase corta en español usando los labels y colores dominantes.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Archivo vacío o no leído.")

        image = vision.Image(content=content)

        # Obtener etiquetas
        label_resp = vision_client.label_detection(image=image)
        if label_resp.error.message:
            raise HTTPException(status_code=502, detail=f"Vision label_detection: {label_resp.error.message}")

        top = [lb.description for lb in label_resp.label_annotations[:5]]
        top_es = [tr_es(t) for t in top]  # Usar función placeholder

        # Colores dominantes
        prop_resp = vision_client.image_properties(image=image)
        colors = _dominant_colors(prop_resp) if not prop_resp.error.message else []

        # Construir descripción
        if top_es:
            sujeto = top_es[0]
            extras = ", ".join([t for t in top_es[1:3] if t and t.lower() != sujeto.lower()])
            base = f"Parece {('un ' if not sujeto.lower().startswith(('una','un','el','la')) else '')}{sujeto}"
            if extras:
                base += f", con rasgos de {extras}"
            base += "."
        else:
            base = "No pude identificar elementos suficientes para una descripción."

        if colors:
            base += f" Colores dominantes: {', '.join(colors)}."

        return {
            "caption": base,
            "debug": {
                "labels_top_es": top_es,
                "colors": colors,
                "original_labels_en": top
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generando caption: {e}")

# =========================
# Endpoint adicional para Supabase
# =========================
@app.get("/supabase/status")
async def supabase_status():
    """Verifica el estado de la conexión con Supabase."""
    if not supabase_client:
        return {"status": "no_configurado", "message": "Variables de Supabase no encontradas"}
    
    try:
        # Intentar una consulta simple para verificar la conexión
        result = supabase_client.table("image_analyses").select("id").limit(1).execute()
        return {"status": "conectado", "message": "Conexión exitosa con Supabase"}
    except Exception as e:
        return {"status": "error", "message": f"Error conectando con Supabase: {e}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)