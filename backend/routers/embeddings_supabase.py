# backend/routers/embeddings_supabase.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import os
from typing import Optional
from services.embeddings import image_bytes_to_vec
from supabase import create_client, Client

router = APIRouter(prefix="/embeddings", tags=["embeddings"])

def get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL o SUPABASE_SERVICE_KEY no configuradas")
    return create_client(url, key)

@router.post("/index/{report_id}")
async def index_report_embedding(report_id: str, file: UploadFile = File(...)):
    try:
        vec = image_bytes_to_vec(await file.read())
    except Exception as e:
        raise HTTPException(400, f"No se pudo procesar la imagen: {e}")
    
    sb = get_supabase()
    try:
        # Convertir vector numpy a lista para Supabase
        vec_list = vec.tolist()
        
        # Usar SQL directo para insertar el vector correctamente
        result = sb.rpc('update_report_embedding', {
            'report_id': report_id,
            'embedding_vector': vec_list
        }).execute()
        
        if not result.data:
            raise HTTPException(404, "report_id no encontrado")
            
        return {"status": "ok", "report_id": report_id, "dims": 512}
    except Exception as e:
        raise HTTPException(500, f"Error actualizando embedding: {e}")

@router.post("/search_image")
async def search_image(
    file: UploadFile = File(...),
    top_k: int = Query(10, ge=1, le=50),
    lost_id: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    max_km: Optional[float] = Query(None, description="Radio máximo en km")
):
    try:
        qvec = image_bytes_to_vec(await file.read())
    except Exception as e:
        raise HTTPException(400, f"No se pudo procesar la imagen: {e}")

    sb = get_supabase()
    
    # Construir query base
    query = sb.table("reports").select("id, species, color, photos, labels, embedding")
    
    # Filtrar por embedding no nulo
    query = query.not_.is_("embedding", "null")
    
    # Aplicar filtro geográfico si se proporciona
    if lat is not None and lng is not None and max_km and max_km > 0:
        # Para Supabase, necesitaríamos usar una función RPC o filtrar después
        # Por ahora, obtenemos todos y filtramos después
        pass
    
    try:
        result = query.execute()
        reports = result.data
        
        # Calcular similitud para cada reporte
        results = []
        import numpy as np
        
        for report in reports:
            if not report.get("embedding"):
                continue
                
            # Convertir embedding de Supabase a numpy array
            report_vec = report["embedding"]
            if isinstance(report_vec, list):
                # Asegurar que todos los elementos son números
                try:
                    report_vec = np.array([float(x) for x in report_vec], dtype=np.float32)
                except (ValueError, TypeError):
                    continue
            else:
                continue
            
            # Calcular similitud coseno
            try:
                similarity = np.dot(qvec, report_vec) / (np.linalg.norm(qvec) * np.linalg.norm(report_vec))
            except:
                continue
            
            # Aplicar filtro geográfico si es necesario
            if lat is not None and lng is not None and max_km and max_km > 0:
                # Aquí necesitarías las coordenadas del reporte
                # Por ahora, saltamos el filtro geográfico
                pass
            
            results.append({
                "report_id": report["id"],
                "score_clip": float(similarity),
                "species": report.get("species"),
                "color": report.get("color"),
                "photo": (report.get("photos") or [None])[0] if isinstance(report.get("photos"), list) else None,
                "labels": report.get("labels")
            })
        
        # Ordenar por similitud y tomar top_k
        results.sort(key=lambda x: x["score_clip"], reverse=True)
        results = results[:top_k]
        
        # Guardar top-1 en matches si hay resultados
        if results and lost_id:
            top1 = results[0]
            try:
                sb.table("matches").insert({
                    "lost_report_id": lost_id,
                    "found_report_id": top1["report_id"],
                    "similarity_score": round(top1["score_clip"], 4),
                    "matched_by": "auto_clip",
                    "status": "pending"
                }).execute()
            except Exception as e:
                print(f"Error guardando match: {e}")
        
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(500, f"Error en búsqueda: {e}")
