from fastapi import APIRouter, HTTPException, Path, Body
from typing import Any, Dict
import os
from supabase import create_client, Client

router = APIRouter(prefix="/reports", tags=["reports"])

def _sb() -> Client:
    url = os.getenv("SUPABASE_URL"); key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY")
    return create_client(url, key)

@router.post("/{report_id}/labels")
def save_labels(report_id: str = Path(...), payload: Dict[str, Any] = Body(...)):
    if "labels" not in payload or not isinstance(payload["labels"], list):
        raise HTTPException(400, "Se espera {'labels': [...]}")

    sb = _sb()
    res = sb.table("reports").update({"labels": payload}).eq("id", report_id).execute()
    if not res.data:
        raise HTTPException(404, "Reporte no encontrado")
    return {"ok": True, "updated": res.data[0]["id"]}