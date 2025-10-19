# 🚀 Inicio Rápido - Búsqueda con IA

## ⚡ Pasos para Ejecutar la Búsqueda con IA

### 1. Iniciar el Backend
```bash
# Abrir terminal en la carpeta backend
cd backend

# Activar entorno virtual
.venv\Scripts\Activate.ps1

# Iniciar servidor
uvicorn main:app --host 127.0.0.1 --port 8003 --reload
```

### 2. Iniciar el Frontend
```bash
# En otra terminal, en la raíz del proyecto
npm start
```

### 3. Usar la Búsqueda con IA

1. **Abrir la app** en tu dispositivo (Expo Go)
2. **Ir a la pantalla principal** (mapa)
3. **Tocar el botón "+"** (FAB flotante)
4. **Seleccionar "Búsqueda IA"**
5. **Configurar la búsqueda:**
   - Tipo: "Buscar mascotas perdidas/encontradas/ambas"
   - Radio: 5km, 10km, 25km, 50km
6. **Subir una foto:**
   - Tocar "Galería" o "Cámara"
   - Seleccionar una foto clara de la mascota
7. **Analizar con IA:**
   - Tocar "Analizar con IA"
   - Esperar el análisis (etiquetas y colores)
8. **Buscar coincidencias:**
   - Tocar "Buscar Coincidencias"
   - Revisar resultados con puntuaciones
9. **Contactar al dueño:**
   - Tocar en cualquier resultado
   - Usar el sistema de mensajería

## 🔧 Configuración Actual

- **Backend URL**: `http://127.0.0.1:8003`
- **Puerto**: 8003
- **Google Vision API**: Configurado ✅
- **Supabase**: Configurado ✅

## 📱 URLs Importantes

- **Backend Health**: http://127.0.0.1:8003/health
- **IA Health**: http://127.0.0.1:8003/ai-search/health
- **Docs API**: http://127.0.0.1:8003/docs

## 🐛 Solución de Problemas

### Error: "No se puede conectar al servidor"
- Verificar que el backend esté ejecutándose en puerto 8003
- Revisar que no haya otros procesos usando el puerto

### Error: "No se pudo analizar la imagen"
- Verificar que Google Vision API esté configurado
- Revisar el archivo `backend/google-vision-key.json`

### Error: "Variables de Supabase no encontradas"
- Verificar que existe el archivo `backend/.env`
- Confirmar que tiene las credenciales correctas

## 🎯 Funcionalidades Disponibles

✅ **Análisis de Imágenes** - Google Vision API  
✅ **Búsqueda Inteligente** - Algoritmo de similitud  
✅ **Filtros Geográficos** - Por ubicación y radio  
✅ **Puntuación de Confianza** - Sistema de scoring  
✅ **Interfaz Intuitiva** - Fácil de usar  
✅ **Integración Completa** - Con sistema existente  

## 📊 Algoritmo de IA

```
Puntuación Total = 
  Similitud Visual × 0.4 +      // 40% - Etiquetas
  Similitud de Colores × 0.3 +  // 30% - Colores dominantes
  Proximidad Geográfica × 0.2 + // 20% - Distancia
  Relevancia Temporal × 0.1     // 10% - Antigüedad
```

## 🚀 ¡Listo para Usar!

La funcionalidad de Búsqueda con IA está completamente implementada y lista para encontrar mascotas perdidas de manera inteligente. 🐾✨

