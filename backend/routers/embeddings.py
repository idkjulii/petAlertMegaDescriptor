# backend/routers/embeddings.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import os, psycopg
from typing import Optional
from services.embeddings import image_bytes_to_vec
from supabase import create_client, Client

router = APIRouter(prefix="/embeddings", tags=["embeddings"])

def get_conn():
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL no configurada")
    return psycopg.connect(dsn, autocommit=True)

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
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("""
            update public.reports
               set embedding = %s
             where id = %s::uuid
        """, (vec, report_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "report_id no encontrado")
    return {"status": "ok", "report_id": report_id, "dims": 512}

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

    base_sql = """
        select r.id,
               (1 - (r.embedding <#> %(qvec)s)) as score_clip,
               r.species, r.color, r.photos, r.labels
         from public.reports r
    """
    where = ["r.embedding is not null"]
    params = {"qvec": qvec, "qvec2": qvec, "top_k": top_k}

    if lat is not None and lng is not None and max_km and max_km > 0:
        base_sql += """
          join public.reports_with_coords rc on rc.id = r.id
        """
        # Haversine en SQL (aprox) para filtrar por radio
        where.append("""
          ( 6371 * acos(
              cos(radians(%(lat)s)) * cos(radians(rc.latitude))
              * cos(radians(rc.longitude) - radians(%(lng)s))
              + sin(radians(%(lat)s)) * sin(radians(rc.latitude))
            ) ) <= %(max_km)s
        """)
        params.update({"lat": lat, "lng": lng, "max_km": max_km})

    sql = f"""
      {base_sql}
      {" where " + " and ".join(where) if where else ""}
      order by r.embedding <#> %(qvec2)s
      limit %(top_k)s
    """

    results = []
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(sql, params)
        for rid, sim, species, color, photos, labels in cur.fetchall():
            results.append({
                "report_id": rid,
                "score_clip": float(sim) if sim is not None else None,
                "species": species,
                "color": color,
                "photo": (photos or [None])[0] if isinstance(photos, list) else None,
                "labels": labels
            })
        if results:
            top1 = results[0]
            cur.execute("""
                insert into public.matches
                    (lost_report_id, found_report_id, similarity_score, matched_by, status)
                values (%s::uuid, %s::uuid, %s, 'auto_clip', 'pending')
            """, (lost_id if lost_id else None, top1["report_id"],
                  round(top1["score_clip"], 4) if top1["score_clip"] is not None else None))
    return {"results": results}
