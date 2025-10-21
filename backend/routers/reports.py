from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
import os, math
from supabase import create_client, Client

router = APIRouter(prefix="/reports", tags=["reports"])

def _sb() -> Client:
    url = os.getenv("SUPABASE_URL"); key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def _extract_coords(location_data) -> Optional[tuple]:
    """Extrae coordenadas de diferentes formatos de location"""
    if not location_data:
        return None
    
    # Formato PostGIS: "SRID=4326;POINT(lon lat)"
    if isinstance(location_data, str) and "POINT(" in location_data:
        try:
            # Extraer coordenadas del string POINT
            coords_str = location_data.split("POINT(")[1].split(")")[0]
            lon, lat = map(float, coords_str.split())
            return (lat, lon)
        except:
            return None
    
    # Formato GeoJSON: {"type":"Point","coordinates":[lon,lat]}
    if isinstance(location_data, dict) and "coordinates" in location_data:
        try:
            lon, lat = location_data["coordinates"]
            return (lat, lon)
        except:
            return None
    
    return None

def haversine_km(lat1, lon1, lat2, lon2):
    """Calcula distancia en kilómetros entre dos puntos"""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

@router.get("/")
async def get_all_reports():
    """Obtiene todos los reportes activos"""
    try:
        sb = _sb()
        result = sb.table("reports").select("*").eq("status", "active").order("created_at", desc=True).execute()
        return {"reports": result.data, "count": len(result.data)}
    except Exception as e:
        raise HTTPException(500, f"Error obteniendo reportes: {str(e)}")

@router.get("/nearby")
async def get_nearby_reports(
    lat: float = Query(..., description="Latitud"),
    lng: float = Query(..., description="Longitud"),
    radius_km: float = Query(10.0, description="Radio en kilómetros")
):
    """Obtiene reportes cercanos a una ubicación"""
    try:
        sb = _sb()
        result = sb.table("reports").select("*").eq("status", "active").execute()
        
        nearby_reports = []
        for report in result.data:
            coords = _extract_coords(report.get("location"))
            if coords:
                report_lat, report_lon = coords
                distance = haversine_km(lat, lng, report_lat, report_lon)
                if distance <= radius_km:
                    report["distance_km"] = round(distance, 2)
                    nearby_reports.append(report)
        
        # Ordenar por distancia
        nearby_reports.sort(key=lambda x: x["distance_km"])
        
        return {"reports": nearby_reports, "count": len(nearby_reports)}
    except Exception as e:
        raise HTTPException(500, f"Error obteniendo reportes cercanos: {str(e)}")

@router.get("/{report_id}")
async def get_report_by_id(report_id: str):
    """Obtiene un reporte por ID"""
    try:
        sb = _sb()
        result = sb.table("reports").select("*").eq("id", report_id).single().execute()
        
        if not result.data:
            raise HTTPException(404, "Reporte no encontrado")
        
        return {"report": result.data}
    except Exception as e:
        if "404" in str(e):
            raise e
        raise HTTPException(500, f"Error obteniendo reporte: {str(e)}")

@router.post("/")
async def create_report(report_data: Dict[str, Any] = Body(...)):
    """Crea un nuevo reporte"""
    try:
        sb = _sb()
        
        # Validar datos requeridos
        required_fields = ["type", "reporter_id", "species", "description", "location"]
        for field in required_fields:
            if field not in report_data:
                raise HTTPException(400, f"Campo requerido faltante: {field}")
        
        # Crear reporte
        result = sb.table("reports").insert([report_data]).select().single().execute()
        
        if not result.data:
            raise HTTPException(500, "Error creando reporte")
        
        return {"report": result.data, "message": "Reporte creado exitosamente"}
    except Exception as e:
        if "400" in str(e) or "500" in str(e):
            raise e
        raise HTTPException(500, f"Error creando reporte: {str(e)}")

@router.put("/{report_id}")
async def update_report(report_id: str, updates: Dict[str, Any] = Body(...)):
    """Actualiza un reporte existente"""
    try:
        sb = _sb()
        result = sb.table("reports").update(updates).eq("id", report_id).select().single().execute()
        
        if not result.data:
            raise HTTPException(404, "Reporte no encontrado")
        
        return {"report": result.data, "message": "Reporte actualizado exitosamente"}
    except Exception as e:
        if "404" in str(e):
            raise e
        raise HTTPException(500, f"Error actualizando reporte: {str(e)}")

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Elimina un reporte (soft delete cambiando status)"""
    try:
        sb = _sb()
        result = sb.table("reports").update({"status": "deleted"}).eq("id", report_id).select().single().execute()
        
        if not result.data:
            raise HTTPException(404, "Reporte no encontrado")
        
        return {"message": "Reporte eliminado exitosamente"}
    except Exception as e:
        if "404" in str(e):
            raise e
        raise HTTPException(500, f"Error eliminando reporte: {str(e)}")

@router.post("/{report_id}/resolve")
async def resolve_report(report_id: str):
    """Marca un reporte como resuelto"""
    try:
        sb = _sb()
        result = sb.table("reports").update({
            "status": "resolved",
            "resolved_at": "now()"
        }).eq("id", report_id).select().single().execute()
        
        if not result.data:
            raise HTTPException(404, "Reporte no encontrado")
        
        return {"report": result.data, "message": "Reporte marcado como resuelto"}
    except Exception as e:
        if "404" in str(e):
            raise e
        raise HTTPException(500, f"Error resolviendo reporte: {str(e)}")
