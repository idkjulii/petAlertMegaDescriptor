from fastapi import APIRouter, HTTPException, File, UploadFile, Query
from typing import List, Dict, Any, Optional
import os, math, traceback
from google.cloud import vision
from supabase import create_client, Client

router = APIRouter(prefix="/ai-search", tags=["ai-search"])

def _sb() -> Client:
    url = os.getenv("SUPABASE_URL"); key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def _coords(loc: Optional[dict]) -> Optional[tuple]:
    """Extrae coordenadas de un objeto de ubicación GeoJSON."""
    if isinstance(loc, dict) and "coordinates" in loc:
        lon, lat = loc["coordinates"]
        return (lat, lon)
    return None

def haversine_km(lat1, lon1, lat2, lon2):
    """Calcula distancia entre dos puntos usando fórmula de Haversine."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def label_set(labels_json) -> set:
    """Convierte etiquetas JSON a un conjunto de strings."""
    if not labels_json:
        return set()
    items = labels_json.get("labels") if isinstance(labels_json, dict) else None
    if not isinstance(items, list):
        return set()
    return {(it.get("label") or it.get("description") or "").lower() for it in items if it}

def color_set(colors_json) -> set:
    """Convierte colores JSON a un conjunto de strings."""
    if not colors_json:
        return set()
    if isinstance(colors_json, list):
        return set(color.lower() for color in colors_json if color)
    return set()

def calculate_visual_similarity(analysis_labels, candidate_labels):
    """Calcula similitud visual entre dos conjuntos de etiquetas."""
    if not analysis_labels or not candidate_labels:
        return 0
    
    set1 = label_set(analysis_labels)
    set2 = label_set(candidate_labels)
    
    if not set1 or not set2:
        return 0
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    if union == 0:
        return 0
    
    return (intersection / union) * 100

def calculate_color_similarity(analysis_colors, candidate_colors):
    """Calcula similitud de colores entre dos conjuntos."""
    if not analysis_colors or not candidate_colors:
        return 0
    
    set1 = color_set(analysis_colors)
    set2 = color_set(candidate_colors)
    
    if not set1 or not set2:
        return 0
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    if union == 0:
        return 0
    
    return (intersection / union) * 100

def calculate_location_score(distance_km, max_distance_km=50):
    """Calcula puntuación de ubicación basada en distancia."""
    if distance_km <= 0:
        return 100
    if distance_km >= max_distance_km:
        return 0
    
    # Puntuación decrece linealmente con la distancia
    return max(0, 100 - (distance_km / max_distance_km) * 100)

def calculate_time_score(created_at):
    """Calcula puntuación basada en la antigüedad del reporte."""
    from datetime import datetime, timezone
    
    try:
        if isinstance(created_at, str):
            report_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        else:
            report_date = created_at
        
        now = datetime.now(timezone.utc)
        days_old = (now - report_date).days
        
        # Reportes más recientes tienen mayor puntuación
        if days_old <= 1:
            return 100
        elif days_old <= 7:
            return 80
        elif days_old <= 30:
            return 60
        else:
            return 40
    except:
        return 50  # Puntuación neutral si hay error

@router.post("/")
async def ai_search(
    file: UploadFile = File(...),
    user_lat: float = Query(...),
    user_lng: float = Query(...),
    radius_km: float = Query(10.0),
    search_type: str = Query("both")
):
    """
    Busca coincidencias de mascotas usando IA.
    
    Args:
        file: Imagen de la mascota a buscar
        user_lat: Latitud del usuario
        user_lng: Longitud del usuario
        radius_km: Radio de búsqueda en kilómetros
        search_type: Tipo de búsqueda ('lost', 'found', 'both')
    """
    try:
        # Validar tipo de búsqueda
        if search_type not in ['lost', 'found', 'both']:
            raise HTTPException(400, "search_type debe ser 'lost', 'found' o 'both'")
        
        # Leer y analizar la imagen
        content = await file.read()
        if not content:
            raise HTTPException(400, "Archivo vacío o no leído")
        
        # Configurar cliente de Google Vision
        vision_client = vision.ImageAnnotatorClient()
        image = vision.Image(content=content)
        
        # Análisis de etiquetas
        label_resp = vision_client.label_detection(image=image)
        if label_resp.error.message:
            raise HTTPException(502, f"Vision label_detection: {label_resp.error.message}")
        
        labels = []
        for lb in label_resp.label_annotations:
            labels.append({
                "label": lb.description,
                "score": round(lb.score * 100, 2),
                "original_label": lb.description
            })
        
        # Análisis de colores dominantes
        prop_resp = vision_client.image_properties(image=image)
        colors = []
        if not prop_resp.error.message:
            try:
                color_data = prop_resp.image_properties_annotation.dominant_colors.colors
                for c in color_data[:3]:  # Top 3 colores
                    r, g, b = int(c.color.red), int(c.color.green), int(c.color.blue)
                    colors.append(f"#{r:02X}{g:02X}{b:02X}")
            except Exception:
                colors = []
        
        # Determinar especie detectada
        detected_species = None
        for label in labels:
            label_text = label["label"].lower()
            if "dog" in label_text or "perro" in label_text:
                detected_species = "dog"
                break
            elif "cat" in label_text or "gato" in label_text:
                detected_species = "cat"
                break
            elif "bird" in label_text or "pájaro" in label_text or "ave" in label_text:
                detected_species = "bird"
                break
            elif "rabbit" in label_text or "conejo" in label_text:
                detected_species = "rabbit"
                break
        
        # Si no se detectó especie, usar "other"
        if not detected_species:
            detected_species = "other"
        
        # Preparar datos de análisis
        analysis_data = {
            "labels": labels,
            "colors": colors,
            "species": detected_species,
            "file_name": file.filename,
            "file_size": len(content)
        }
        
        # Buscar candidatos en la base de datos
        sb = _sb()
        
        # Construir consulta según tipo de búsqueda
        query = sb.table("reports").select("*").eq("status", "active")
        
        if search_type != "both":
            query = query.eq("type", search_type)
        
        # Filtrar por especie si se detectó
        if detected_species and detected_species != "other":
            query = query.eq("species", detected_species)
        
        candidates = query.execute().data
        
        # Filtrar por distancia y calcular puntuaciones
        results = []
        for candidate in candidates:
            candidate_coords = _coords(candidate.get("location"))
            if not candidate_coords:
                continue
            
            cand_lat, cand_lng = candidate_coords
            distance_km = haversine_km(user_lat, user_lng, cand_lat, cand_lng)
            
            if distance_km > radius_km:
                continue
            
            # Calcular puntuaciones
            visual_score = calculate_visual_similarity(
                {"labels": labels}, 
                candidate.get("labels", {})
            )
            
            color_score = calculate_color_similarity(
                colors, 
                candidate.get("colors", [])
            )
            
            location_score = calculate_location_score(distance_km, radius_km)
            time_score = calculate_time_score(candidate.get("created_at"))
            
            # Puntuación total ponderada
            total_score = (
                visual_score * 0.4 +      # 40% similitud visual
                color_score * 0.3 +       # 30% similitud de colores
                location_score * 0.2 +    # 20% proximidad geográfica
                time_score * 0.1          # 10% relevancia temporal
            )
            
            # Solo incluir resultados con puntuación mínima
            if total_score >= 30:  # Umbral mínimo de relevancia
                results.append({
                    "candidate": {
                        "id": candidate["id"],
                        "pet_name": candidate.get("pet_name"),
                        "species": candidate.get("species"),
                        "breed": candidate.get("breed"),
                        "color": candidate.get("color"),
                        "size": candidate.get("size"),
                        "description": candidate.get("description"),
                        "location": candidate.get("location"),
                        "photos": candidate.get("photos", []),
                        "labels": candidate.get("labels"),
                        "reporter_id": candidate.get("reporter_id"),
                        "created_at": candidate.get("created_at"),
                    },
                    "distance_km": round(distance_km, 2),
                    "visual_similarity": round(visual_score, 1),
                    "color_similarity": round(color_score, 1),
                    "location_score": round(location_score, 1),
                    "time_score": round(time_score, 1),
                    "total_score": round(total_score, 1),
                    "match_confidence": "Alta" if total_score >= 70 else "Media" if total_score >= 50 else "Baja"
                })
        
        # Ordenar por puntuación total
        results.sort(key=lambda x: x["total_score"], reverse=True)
        
        # Limitar resultados a los mejores 20
        top_results = results[:20]
        
        return {
            "analysis": analysis_data,
            "matches": top_results,
            "search_metadata": {
                "total_candidates": len(candidates),
                "filtered_results": len(results),
                "returned_results": len(top_results),
                "search_type": search_type,
                "radius_km": radius_km,
                "user_location": {"lat": user_lat, "lng": user_lng},
                "detected_species": detected_species,
                "analysis_confidence": "Alta" if len(labels) >= 5 else "Media" if len(labels) >= 3 else "Baja"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Error en búsqueda IA: {str(e)}")

@router.get("/health")
async def ai_search_health():
    """Verifica el estado del servicio de búsqueda IA."""
    try:
        # Verificar conexión a Supabase
        sb = _sb()
        test_query = sb.table("reports").select("id").limit(1).execute()
        
        # Verificar Google Vision (simulación)
        vision_status = "configurado"
        
        return {
            "status": "ok",
            "message": "Servicio de búsqueda IA funcionando",
            "supabase": "conectado" if test_query.data is not None else "error",
            "google_vision": vision_status,
            "endpoints": {
                "ai_search": "/ai-search/",
                "health": "/ai-search/health"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error en servicio IA: {str(e)}",
            "supabase": "error",
            "google_vision": "error"
        }

@router.post("/similarity")
async def calculate_similarity(
    labels1: List[Dict[str, Any]] = None,
    labels2: List[Dict[str, Any]] = None,
    colors1: List[str] = None,
    colors2: List[str] = None
):
    """
    Calcula similitud entre dos conjuntos de etiquetas y colores.
    Útil para testing y debugging.
    """
    try:
        visual_similarity = calculate_visual_similarity(
            {"labels": labels1 or []}, 
            {"labels": labels2 or []}
        )
        
        color_similarity = calculate_color_similarity(
            colors1 or [], 
            colors2 or []
        )
        
        return {
            "visual_similarity": round(visual_similarity, 1),
            "color_similarity": round(color_similarity, 1),
            "combined_score": round((visual_similarity + color_similarity) / 2, 1),
            "inputs": {
                "labels1": labels1,
                "labels2": labels2,
                "colors1": colors1,
                "colors2": colors2
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Error calculando similitud: {str(e)}")

