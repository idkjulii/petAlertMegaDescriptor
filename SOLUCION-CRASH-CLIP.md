# 🚨 SOLUCIÓN AL CRASH DE "Buscar Coincidencias (CLIP)"

## Problema Identificado
La aplicación se cierra cuando presionas "Buscar Coincidencias (CLIP)" porque:

1. **Backend no está ejecutándose** - El servidor Python no está corriendo
2. **URLs incorrectas** - Las IPs hardcodeadas no coinciden con tu red
3. **Manejo de errores insuficiente** - La app se cierra en lugar de mostrar errores

## ✅ Solución Paso a Paso

### 1. Encontrar tu IP Local
```bash
# En Windows (PowerShell o CMD):
ipconfig

# Busca la línea "Dirección IPv4" de tu adaptador WiFi/Ethernet
# Ejemplo: 192.168.1.100
```

### 2. Actualizar la Configuración de Red
Edita el archivo `src/config/network.js` y cambia la IP:

```javascript
export const NETWORK_CONFIG = {
  // Cambia esta IP por la IP de tu computadora
  BACKEND_IP: '192.168.1.100', // ← Cambia esta IP
  BACKEND_PORT: 8003,
  // ... resto del código
};
```

### 3. Iniciar el Backend
Ejecuta el script que creé:

```bash
# Opción 1: Usar el script automático
start-backend.bat

# Opción 2: Manualmente
cd backend
python main.py
```

Deberías ver algo como:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8003
```

### 4. Verificar que Funciona
Abre tu navegador y ve a: `http://TU_IP:8003/health`

Deberías ver:
```json
{
  "status": "ok",
  "message": "PetAlert Vision API activa",
  "supabase": "conectado",
  "google_vision": "configurado"
}
```

### 5. Probar en Expo Go
1. Asegúrate de que tu teléfono esté en la **misma red WiFi** que tu computadora
2. Abre la app en Expo Go
3. Ve a la pantalla de búsqueda IA
4. Selecciona una imagen
5. Presiona "Buscar Coincidencias (CLIP)"

## 🔧 Cambios Realizados

### Archivos Modificados:
- ✅ `src/services/searchImage.js` - Corregida URL y mejor manejo de errores
- ✅ `app/ai-search.jsx` - Mejor manejo de errores de conexión
- ✅ `src/lib/api.js` - Usa configuración centralizada
- ✅ `src/config/network.js` - Nueva configuración de red
- ✅ `start-backend.bat` - Script para iniciar backend fácilmente

### Mejoras Implementadas:
- ✅ **Manejo de errores robusto** - La app ya no se cierra, muestra errores claros
- ✅ **Configuración centralizada** - Fácil cambio de IP en un solo lugar
- ✅ **Timeouts** - Evita que la app se cuelgue
- ✅ **Mensajes informativos** - Te dice exactamente qué verificar

## 🚨 Si Aún No Funciona

### Verificar Conexión de Red:
```bash
# Desde tu teléfono, abre el navegador y ve a:
http://TU_IP:8003/health

# Si no carga, verifica:
1. Misma red WiFi
2. Firewall de Windows deshabilitado o puerto 8003 permitido
3. IP correcta en network.js
```

### Verificar Backend:
```bash
cd backend
python -c "from services.embeddings import image_bytes_to_vec; print('OK')"
```

### Logs del Backend:
Cuando ejecutes `python main.py`, deberías ver logs como:
```
OK: Variables de Supabase cargadas desde ...
INFO:     Started server process
```

## 📱 Configuración de Expo Go

Si usas Expo Go, asegúrate de que:
1. Tu computadora y teléfono estén en la misma red WiFi
2. El puerto 8003 esté abierto en tu firewall
3. La IP en `network.js` sea correcta

## 🎯 Resultado Esperado

Después de seguir estos pasos:
- ✅ La app NO se cerrará
- ✅ Verás mensajes de error claros si hay problemas
- ✅ La búsqueda CLIP funcionará correctamente
- ✅ Podrás cambiar la IP fácilmente cuando cambies de red
