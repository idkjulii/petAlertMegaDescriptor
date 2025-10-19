# PetAlert Vision Backend

Backend en FastAPI que analiza imágenes con Google Cloud Vision API.

## 🚀 Ejecución

1. Coloca tu clave descargada de Google Cloud como:

backend/google-vision-key.json

2. Instala dependencias:
```bash
pip install -r requirements.txt
```

3. Ejecuta el servidor:
```bash
uvicorn main:app --reload
```

4. Envía una imagen de prueba:
```bash
curl -X POST -F "file=@nina.jpg" http://127.0.0.1:8000/analyze_image
```

## Embeddings CLIP + pgvector

**Instalación**
```bash
cd backend
pip install -r requirements.txt
```

**Ejecutar (dev)**
```bash
uvicorn main:app --reload --port 8010
```

**Variables de entorno**
- `DATABASE_URL` (cadena Postgres de Supabase)

**Migración en Supabase**
1. Copiá el SQL de `migrations/001_add_embeddings.sql` en el SQL Editor de Supabase.
2. Ejecutá la migración.

**Indexar un reporte existente**
```bash
curl -X POST "http://127.0.0.1:8010/embeddings/index/00000000-0000-0000-0000-000000000001" \
  -F "file=@tests/assets/dog.jpg"
```

**Buscar coincidencias (top-10)**
```bash
curl -X POST "http://127.0.0.1:8010/embeddings/search_image?top_k=10" \
  -F "file=@tests/assets/query.jpg"
```

**Respuesta esperada**
```json
{
  "results": [
    {"report_id":"...","score_clip":0.83,"species":"dog","color":"brown","photo":"https://...","labels":{"tags":["Spitz","Snout"]}}
  ]
}
```

**Procesar reportes existentes (backfill)**
```bash
# Generar embeddings para todos los reportes que tengan fotos pero no embedding
cd backend
python -m scripts.backfill_embeddings
```

**Parámetros opcionales para búsqueda geográfica**
```bash
curl -X POST "http://127.0.0.1:8010/embeddings/search_image?top_k=10&lat=-34.6037&lng=-58.3816&max_km=5" \
  -F "file=@tests/assets/query.jpg"
```
