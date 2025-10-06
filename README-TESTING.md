# 🧪 Guía de Testing - Pet Finder App

Esta guía te ayudará a probar todas las funcionalidades de la aplicación Pet Finder paso a paso.

## 🚀 Scripts de Desarrollo

```bash
# Limpiar caché y iniciar
npm run clean

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en web
npm run web
```

## 📋 Configuración Inicial

### 1. Configurar Variables de Entorno
1. Abre el archivo `.env` en la raíz del proyecto
2. Completa las siguientes variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   EXPO_PUBLIC_HUGGINGFACE_API_KEY=tu_api_key_de_huggingface
   EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_clave_publica_mercadopago
   EXPO_PUBLIC_MERCADOPAGO_ACCESS_TOKEN=tu_token_acceso_mercadopago
   ```

### 2. Configurar Supabase
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Configura las siguientes tablas:
   - `profiles` (usuarios)
   - `pets` (mascotas)
   - `reports` (reportes)
   - `conversations` (conversaciones)
   - `messages` (mensajes)
3. Configura los buckets de almacenamiento:
   - `avatars`
   - `pet-photos`
   - `report-photos`

## 🧪 Casos de Prueba

### 🔐 Autenticación

#### 1. Registro de Usuario
**Objetivo**: Verificar que un usuario puede registrarse correctamente

**Pasos**:
1. Abrir la aplicación
2. Debería mostrar pantalla de login
3. Tocar "Regístrate aquí"
4. Completar formulario:
   - Nombre completo: "Juan Pérez"
   - Email: "juan@test.com"
   - Contraseña: "123456"
   - Confirmar contraseña: "123456"
5. Tocar "Crear Cuenta"
6. ✅ **Resultado esperado**: Mensaje de éxito y redirección a login

**Validaciones**:
- [ ] Validación de campos requeridos
- [ ] Validación de formato de email
- [ ] Validación de coincidencia de contraseñas
- [ ] Indicador de fortaleza de contraseña
- [ ] Manejo de errores

#### 2. Inicio de Sesión
**Objetivo**: Verificar que un usuario puede iniciar sesión

**Pasos**:
1. En pantalla de login
2. Ingresar credenciales:
   - Email: "juan@test.com"
   - Contraseña: "123456"
3. Tocar "Iniciar Sesión"
4. ✅ **Resultado esperado**: Mensaje de bienvenida y redirección a tabs

**Validaciones**:
- [ ] Validación de campos
- [ ] Manejo de credenciales incorrectas
- [ ] Estados de carga
- [ ] Redirección automática

### 🏠 Pantalla Principal (Tabs)

#### 3. Navegación por Tabs
**Objetivo**: Verificar navegación entre tabs

**Pasos**:
1. Después del login, debería mostrar la pantalla principal con mapa
2. Probar navegación entre tabs:
   - Inicio (home icon)
   - Reportes (file-document icon)
   - Mascotas (paw icon)
   - Mensajes (message icon)
   - Perfil (account icon)
3. ✅ **Resultado esperado**: Navegación fluida entre todas las tabs

**Validaciones**:
- [ ] Iconos correctos en cada tab
- [ ] Títulos correctos en headers
- [ ] Transiciones suaves
- [ ] Estado activo visual

#### 4. Mapa Principal
**Objetivo**: Verificar funcionalidad del mapa

**Pasos**:
1. En tab "Inicio"
2. Verificar elementos del mapa:
   - Ubicación del usuario
   - Marcadores de reportes (si existen)
   - Controles de zoom
   - Controles de ubicación
3. ✅ **Resultado esperado**: Mapa funcional con ubicación

**Validaciones**:
- [ ] Solicitud de permisos de ubicación
- [ ] Visualización de ubicación actual
- [ ] Controles de mapa funcionando
- [ ] Información de reportes cercanos

#### 5. FAB (Floating Action Button)
**Objetivo**: Verificar botón flotante de acciones

**Pasos**:
1. En tab "Inicio"
2. Tocar el botón "+" (FAB)
3. Verificar opciones:
   - "Búsqueda IA"
   - "Encontré una mascota"
   - "Perdí mi mascota"
4. Probar cada opción
5. ✅ **Resultado esperado**: Navegación correcta a cada pantalla

**Validaciones**:
- [ ] Animación de apertura/cierre
- [ ] Navegación a cada opción
- [ ] Colores correctos de botones
- [ ] Iconos apropiados

### 📝 Reportes

#### 6. Reportar Mascota Perdida
**Objetivo**: Verificar creación de reporte de mascota perdida

**Pasos**:
1. Tocar FAB → "Perdí mi mascota"
2. Completar formulario:
   - Nombre: "Max"
   - Especie: Seleccionar "Perro 🐕"
   - Raza: "Labrador"
   - Color: "Dorado"
   - Tamaño: "Grande"
   - Descripción: "Perro dorado muy amigable"
   - Señas particulares: "Collar azul"
   - Recompensa: "500"
3. Agregar fotos (usar cámara o galería)
4. Verificar ubicación automática
5. Tocar "Crear Reporte"
6. ✅ **Resultado esperado**: Reporte creado exitosamente

**Validaciones**:
- [ ] Validación de campos requeridos
- [ ] Selección de especie con chips
- [ ] Selección de tamaño con chips
- [ ] Funcionalidad de cámara/galería
- [ ] Límite de 5 fotos
- [ ] Obtención automática de ubicación
- [ ] Subida de fotos
- [ ] Creación en base de datos

#### 7. Reportar Mascota Encontrada
**Objetivo**: Verificar creación de reporte de mascota encontrada

**Pasos**:
1. Tocar FAB → "Encontré una mascota"
2. Completar formulario:
   - Especie: "Gato 🐈"
   - Raza: "Persa"
   - Color: "Blanco"
   - Tamaño: "Pequeño"
   - Descripción: "Gato blanco perdido en el parque"
   - Dónde la encontraste: "Parque Central"
   - Cuándo: Fecha actual
3. Agregar fotos
4. Verificar ubicación
5. Tocar "Crear Reporte"
6. ✅ **Resultado esperado**: Reporte creado exitosamente

**Validaciones**:
- [ ] Campos específicos para encontrados
- [ ] Sin campo de recompensa
- [ ] Fecha automática
- [ ] Diferente color de UI (verde)
- [ ] Creación correcta en BD

### 🗺️ Mapas y Ubicación

#### 8. Permisos de Ubicación
**Objetivo**: Verificar manejo de permisos

**Pasos**:
1. Al abrir la app por primera vez
2. Verificar solicitud de permisos
3. Probar escenarios:
   - Aceptar permisos
   - Denegar permisos
   - Cambiar permisos en configuración
4. ✅ **Resultado esperado**: Manejo correcto de todos los casos

**Validaciones**:
- [ ] Solicitud clara de permisos
- [ ] Mensajes informativos
- [ ] Fallback cuando se deniegan permisos
- [ ] Actualización de permisos en tiempo real

#### 9. Marcadores en Mapa
**Objetivo**: Verificar visualización de reportes en mapa

**Pasos**:
1. Crear varios reportes (perdidos y encontrados)
2. En mapa principal, verificar:
   - Marcadores aparecen en ubicaciones correctas
   - Diferentes colores para perdidos (rojo) vs encontrados (verde)
   - Callouts informativos al tocar marcadores
   - Fotos en marcadores
3. ✅ **Resultado esperado**: Marcadores correctos y funcionales

**Validaciones**:
- [ ] Colores correctos por tipo
- [ ] Información correcta en callouts
- [ ] Navegación desde callouts
- [ ] Performance con muchos marcadores

### 💬 Mensajería

#### 10. Chat entre Usuarios
**Objetivo**: Verificar sistema de mensajería

**Pasos**:
1. Desde un reporte, tocar "Contactar"
2. Verificar creación de conversación
3. Enviar mensajes:
   - Texto
   - Fotos (si está implementado)
4. Verificar en tiempo real
5. ✅ **Resultado esperado**: Chat funcional

**Validaciones**:
- [ ] Creación automática de conversación
- [ ] Envío de mensajes
- [ ] Recepción en tiempo real
- [ ] Historial de conversación
- [ ] Navegación entre chats

### 👤 Perfil de Usuario

#### 11. Gestión de Perfil
**Objetivo**: Verificar funcionalidad del perfil

**Pasos**:
1. Ir a tab "Perfil"
2. Verificar información mostrada:
   - Nombre
   - Email
   - Fecha de registro
   - Estadísticas (reportes, etc.)
3. Probar edición de perfil
4. ✅ **Resultado esperado**: Perfil completo y editable

**Validaciones**:
- [ ] Información correcta del usuario
- [ ] Estadísticas precisas
- [ ] Edición de datos
- [ ] Subida de avatar
- [ ] Logout funcional

### 🔍 Búsqueda IA (Si está implementada)

#### 12. Búsqueda por IA
**Objetivo**: Verificar búsqueda inteligente

**Pasos**:
1. Tocar FAB → "Búsqueda IA"
2. Subir foto de mascota
3. Verificar resultados de búsqueda
4. ✅ **Resultado esperado**: Resultados relevantes

**Validaciones**:
- [ ] Subida de imagen
- [ ] Procesamiento por IA
- [ ] Resultados relevantes
- [ ] Performance aceptable

## 🐛 Casos de Error

### 13. Manejo de Errores de Red
**Objetivo**: Verificar comportamiento sin conexión

**Pasos**:
1. Desactivar WiFi/datos
2. Intentar operaciones que requieren red:
   - Login
   - Crear reporte
   - Cargar mapa
3. ✅ **Resultado esperado**: Mensajes de error claros

### 14. Datos Inválidos
**Objetivo**: Verificar validaciones

**Pasos**:
1. Intentar crear reporte sin datos requeridos
2. Intentar login con credenciales incorrectas
3. Intentar subir archivos no válidos
4. ✅ **Resultado esperado**: Validaciones apropiadas

## 📱 Testing en Diferentes Dispositivos

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 🔧 Herramientas de Debug

### 1. Logs de Consola
- Revisar console.log en Metro bundler
- Usar React Native Debugger
- Verificar logs de Supabase

### 2. Network Inspector
- Verificar peticiones a Supabase
- Monitorear subida de archivos
- Revisar headers y respuestas

### 3. Performance
- Usar Flipper para profiling
- Verificar memory leaks
- Monitorear renderizado

## ✅ Checklist Final

### Funcionalidades Core
- [ ] Autenticación (login/registro)
- [ ] Navegación por tabs
- [ ] Mapa con ubicación
- [ ] Creación de reportes
- [ ] Visualización de reportes
- [ ] Gestión de fotos
- [ ] Mensajería básica
- [ ] Perfil de usuario

### UX/UI
- [ ] Diseño responsive
- [ ] Animaciones suaves
- [ ] Estados de carga
- [ ] Manejo de errores
- [ ] Accesibilidad básica

### Performance
- [ ] Carga rápida
- [ ] Navegación fluida
- [ ] Optimización de imágenes
- [ ] Gestión de memoria

## 📞 Soporte

Si encuentras problemas durante las pruebas:

1. Revisar logs en Metro bundler
2. Verificar configuración de Supabase
3. Comprobar variables de entorno
4. Revisar permisos del dispositivo
5. Limpiar caché con `npm run clean`

---

**¡Happy Testing! 🧪🐾**

