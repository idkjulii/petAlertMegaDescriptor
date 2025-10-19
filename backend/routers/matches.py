from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import os, math
from supabase import create_client, Client

router = APIRouter(prefix="/reports", tags=["reports"])

def _sb() -> Client:
    url = os.getenv("SUPABASE_URL"); key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def _coords(loc: Optional[dict]) -> Optional[tuple]:
    # GeoJSON {"type":"Point","coordinates":[lon,lat]}
    if isinstance(loc, dict) and "coordinates" in loc:
        lon, lat = loc["coordinates"]; return (lat, lon)
    return None

def haversine_km(lat1, lon1, lat2, lon2):
    R=6371.0
    dlat=math.radians(lat2-lat1); dlon=math.radians(lon2-lon1)
    a=math.sin(dlat/2)**2+math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return 2*R*math.asin(math.sqrt(a))

def label_set(labels_json) -> set:
    if not labels_json: return set()
    items = labels_json.get("labels") if isinstance(labels_json, dict) else None
    if not isinstance(items, list): return set()
    return {(it.get("label") or it.get("description") or "").lower() for it in items if it}

@router.get("/auto-match")
def auto_match(report_id: str = Query(...), radius_km: float = 10.0, top_k: int = 5):
    sb = _sb()
    base = sb.table("reports").select("*").eq("id", report_id).single().execute().data
    if not base: raise HTTPException(404, "Reporte base no encontrado")

    base_pt = _coords(base.get("location"))
    if not base_pt: raise HTTPException(400, "El reporte base no tiene location válido (GeoJSON Point)")
    base_lat, base_lon = base_pt
    base_labels = label_set(base.get("labels"))
    target_type = "found" if base.get("type") == "lost" else "lost"

    candidates = sb.table("reports").select("*") \
        .eq("type", target_type).eq("status", "active").eq("species", base.get("species")).execute().data

    results: List[Dict[str, Any]] = []
    lat_pad = radius_km/111.0; lon_pad = radius_km/111.0

    for c in candidates:
        pt = _coords(c.get("location"))
        if not pt: continue
        lat, lon = pt
        if not (base_lat-lat_pad <= lat <= base_lat+lat_pad and base_lon-lon_pad <= lon <= base_lon+lon_pad):
            continue
        d = haversine_km(base_lat, base_lon, lat, lon)
        if d > radius_km: continue

        overlap = len(base_labels & label_set(c.get("labels")))
        score = overlap*10 - d*0.2
        results.append({
            "candidate": {
                "id": c["id"], "pet_name": c.get("pet_name"), "species": c.get("species"),
                "color": c.get("color"), "location": c.get("location"),
                "photo": (c.get("photos") or [None])[0] if isinstance(c.get("photos"), list) else None,
                "labels": c.get("labels"),
            },
            "distance_km": round(d,2),
            "label_overlap": overlap,
            "score": round(score,3)
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"report_id": report_id, "radius_km": radius_km, "total_candidates": len(results), "top_k": results[:top_k]}