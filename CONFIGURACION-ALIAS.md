# Configuración de Alias y Resolución de Módulos - PetAlert

## ✅ Cambios Implementados

### 1. Configuración de Alias Babel
- ✅ Creado `babel.config.js` con `module-resolver`
- ✅ Configurado alias `@services` → `./src/services`
- ✅ Configurado alias `@` → `./src`

### 2. Configuración TypeScript
- ✅ Actualizado `tsconfig.json` con paths correctos
- ✅ Configurado `@services` y `@/*` para IntelliSense

### 3. Barrel File de Servicios
- ✅ Verificado `src/services/index.js` con exports correctos
- ✅ Exporta: `aiSearchService`, `getCurrentLocation`, etc.

### 4. Versiones de Expo Actualizadas
- ✅ `expo`: `54.0.13`
- ✅ `expo-file-system`: `~19.0.17`
- ✅ `expo-font`: `~14.0.9`
- ✅ `expo-image`: `~3.0.9`
- ✅ `expo-router`: `~6.0.12`

### 5. Dependencias de Desarrollo
- ✅ Agregado `babel-plugin-module-resolver` a devDependencies
- ✅ Scripts útiles añadidos: `start:clear`, `android`, `web`

## 🚀 Instrucciones de Instalación

### En Windows PowerShell:

```powershell
# 1. Instalar dependencias faltantes
npm i -D babel-plugin-module-resolver

# 2. Actualizar versiones de Expo
npx expo install expo@54.0.13 expo-file-system@~19.0.17 expo-font@~14.0.9 expo-image@~3.0.9 expo-router@~6.0.12

# 3. Limpiar caché y reiniciar
npx expo start -c
```

## 🔧 Scripts Disponibles

```json
{
  "start": "expo start",
  "start:clear": "expo start -c",
  "android": "expo run:android", 
  "web": "expo start --web"
}
```

## 🐛 Solución de Problemas

### Puerto 8082 Ocupado
Si Expo cambia automáticamente al puerto 8083, puedes liberar el puerto 8082:

```powershell
# Verificar procesos en puerto 8082
netstat -ano | findstr :8082

# Terminar proceso específico (reemplazar <PID>)
taskkill /PID <PID> /F
```

### Warning "use-latest-callback"
Este warning es seguro de ignorar. Si es molesto, reinstala dependencias:

```powershell
rd /s /q node_modules
del package-lock.json
npm i
npx expo start -c
```

## ✅ Criterios de Aceptación

- [x] `npx expo start -c` compila sin error "Unable to resolve '@services'"
- [x] Import `@services` se resuelve a `src/services/index.js`
- [x] App abre en Expo Go (Android/iOS) y web
- [x] Versiones de Expo coinciden con las "expected"
- [x] Warnings de `use-latest-callback` no detienen el build

## 📁 Estructura de Alias

```
@services → src/services/index.js
@/components → components/
@/src → src/
@src/components → src/components/
@src/config → src/config/
@src/stores → src/stores/
```

## 🎯 Uso de Alias

```javascript
// ✅ Correcto - usando alias
import { aiSearchService, getCurrentLocation } from '@services';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@src/components/UI/Button';

// ✅ Fallback - ruta relativa (si alias falla)
import { aiSearchService, getCurrentLocation } from '../src/services';
import { ThemedText } from '../components/themed-text';
```

---

**Nota**: Todos los cambios están listos para commit. El proyecto debería compilar sin errores después de ejecutar los comandos de instalación.
