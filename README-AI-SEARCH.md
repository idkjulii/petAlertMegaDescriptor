# 🔍 Búsqueda con IA - PetAlert

## Descripción

La funcionalidad de **Búsqueda con IA** permite a los usuarios encontrar mascotas perdidas o encontradas usando inteligencia artificial. Los usuarios pueden subir una foto de una mascota y el sistema buscará coincidencias en la base de datos usando análisis visual avanzado.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Análisis Visual**: Usa Google Cloud Vision API para detectar características de mascotas
- **Búsqueda Inteligente**: Encuentra coincidencias basadas en similitud visual y colores
- **Filtros Avanzados**: Por tipo de reporte (perdido/encontrado), radio de búsqueda y especie
- **Puntuación de Confianza**: Sistema de scoring que evalúa la relevancia de cada resultado
- **Interfaz Intuitiva**: Diseño moderno y fácil de usar

### 🧠 Algoritmo de IA
El sistema utiliza un algoritmo de puntuación multicriterio:

```
Puntuación Total = 
  Similitud Visual × 0.4 +      // 40% - Etiquetas de Google Vision
  Similitud de Colores × 0.3 +  // 30% - Colores dominantes
  Proximidad Geográfica × 0.2 + // 20% - Distancia del usuario
  Relevancia Temporal × 0.1     // 10% - Antigüedad del reporte
```

## 📱 Cómo Usar

### 1. Acceder a la Búsqueda con IA
- Desde la pantalla principal, toca el botón "+" (FAB)
- Selecciona "Búsqueda IA"

### 2. Configurar la Búsqueda
- **Tipo de Búsqueda**: Elige entre "Mascotas Perdidas", "Mascotas Encontradas" o "Ambas"
- **Radio de Búsqueda**: Selecciona el área geográfica (5km, 10km, 25km, 50km)

### 3. Subir Foto
- Toca "Galería" para seleccionar una foto existente
- Toca "Cámara" para tomar una nueva foto
- La imagen debe ser clara y mostrar bien la mascota

### 4. Analizar con IA
- Toca "Analizar con IA" para procesar la imagen
- El sistema detectará:
  - Especie (perro, gato, ave, etc.)
  - Características visuales
  - Colores dominantes
  - Etiquetas descriptivas

### 5. Buscar Coincidencias
- Toca "Buscar Coincidencias" para encontrar matches
- El sistema mostrará resultados ordenados por relevancia
- Cada resultado incluye:
  - Puntuación de match (0-100%)
  - Distancia del usuario
  - Información detallada de la mascota
  - Nivel de confianza (Alta/Media/Baja)

### 6. Contactar al Reportero
- Toca en cualquier resultado para ver detalles completos
- Usa el sistema de mensajería integrado para contactar al dueño

## 🛠️ Arquitectura Técnica

### Frontend (React Native)
```
app/ai-search.jsx          # Pantalla principal de búsqueda
src/services/aiSearch.js   # Servicio para comunicación con backend
```

### Backend (FastAPI + Python)
```
backend/routers/ai_search.py  # Endpoints de búsqueda con IA
backend/main.py               # Configuración del servidor
```

### APIs Utilizadas
- **Google Cloud Vision API**: Análisis de imágenes
- **Supabase**: Base de datos y almacenamiento
- **FastAPI**: Servidor backend

## 📊 Endpoints Disponibles

### POST `/ai-search/`
Busca coincidencias usando IA.

**Parámetros:**
- `file`: Imagen de la mascota (multipart/form-data)
- `user_lat`: Latitud del usuario
- `user_lng`: Longitud del usuario
- `radius_km`: Radio de búsqueda (default: 10)
- `search_type`: Tipo de búsqueda ('lost', 'found', 'both')

**Respuesta:**
```json
{
  "analysis": {
    "labels": [...],
    "colors": [...],
    "species": "dog",
    "file_name": "photo.jpg"
  },
  "matches": [
    {
      "candidate": {...},
      "distance_km": 2.5,
      "visual_similarity": 85.2,
      "color_similarity": 78.5,
      "total_score": 82.1,
      "match_confidence": "Alta"
    }
  ],
  "search_metadata": {...}
}
```

### GET `/ai-search/health`
Verifica el estado del servicio.

### POST `/ai-search/similarity`
Calcula similitud entre etiquetas y colores (para testing).

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
# Backend
GOOGLE_APPLICATION_CREDENTIALS=backend/google-vision-key.json
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_key

# Frontend
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Dependencias del Backend
```bash
pip install fastapi uvicorn google-cloud-vision supabase python-dotenv
```

### Dependencias del Frontend
```bash
npm install expo-image-picker expo-location
```

## 🚀 Ejecución

### 1. Iniciar Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Iniciar Frontend
```bash
npm start
```

### 3. Probar Funcionalidad
- Abre la app en tu dispositivo
- Ve a la pantalla de búsqueda con IA
- Sube una foto de prueba
- Verifica que el análisis y búsqueda funcionen correctamente

## 🐛 Solución de Problemas

### Error: "No se pudo analizar la imagen"
- Verifica que el backend esté ejecutándose en puerto 8000
- Confirma que las credenciales de Google Cloud Vision estén configuradas
- Revisa que el archivo `google-vision-key.json` esté en la carpeta backend

### Error: "No se pudo realizar la búsqueda"
- Verifica la conexión a Supabase
- Confirma que las variables de entorno estén configuradas
- Revisa los logs del backend para errores específicos

### Error de Permisos de Ubicación
- Asegúrate de que la app tenga permisos de ubicación
- En iOS: Configuración > Privacidad > Servicios de Ubicación
- En Android: Configuración > Aplicaciones > PetAlert > Permisos

## 📈 Métricas y Performance

### Umbrales de Confianza
- **Alta**: ≥ 70% de similitud total
- **Media**: 50-69% de similitud total  
- **Baja**: 30-49% de similitud total

### Límites de Búsqueda
- Radio máximo: 50km
- Resultados máximos: 20
- Tamaño de imagen máximo: 10MB
- Formatos soportados: JPEG, PNG

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- **Búsqueda por Voz**: Describir la mascota verbalmente
- **Notificaciones Push**: Alertas cuando hay nuevos matches
- **Historial de Búsquedas**: Guardar búsquedas anteriores
- **Filtros Avanzados**: Por raza, tamaño, edad
- **Machine Learning**: Mejora continua del algoritmo

### Optimizaciones Técnicas
- **Cache de Análisis**: Evitar re-analizar imágenes similares
- **Búsqueda Offline**: Funcionalidad básica sin conexión
- **Compresión de Imágenes**: Reducir tamaño de archivos
- **Batch Processing**: Procesar múltiples imágenes

## 🤝 Contribuir

Para contribuir a esta funcionalidad:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-mejora-ia`)
3. Implementa tus cambios
4. Prueba exhaustivamente
5. Envía un Pull Request

### Áreas de Contribución
- Mejoras al algoritmo de matching
- Nuevas características de IA
- Optimizaciones de performance
- Mejoras en la UI/UX
- Documentación y testing

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa esta documentación
2. Consulta los logs del backend
3. Verifica la configuración de variables de entorno
4. Abre un issue en el repositorio con detalles específicos

---

**¡Gracias por usar la Búsqueda con IA de PetAlert! 🐾**

