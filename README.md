# 🐾 Pet Finder App

Una aplicación móvil para ayudar a encontrar mascotas perdidas usando React Native y Expo.

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd PetFinderApp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
**⚠️ IMPORTANTE**: Antes de ejecutar la aplicación, debes configurar Supabase:

1. Lee la guía completa en [CONFIGURACION-SUPABASE.md](./CONFIGURACION-SUPABASE.md)
2. Crea un archivo `.env` en la raíz del proyecto:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```

### 4. Iniciar el servidor de desarrollo
```bash
npm start
```

### 5. Ejecutar en tu dispositivo
- Instala la app [Expo Go](https://expo.dev/go) en tu teléfono
- Escanea el código QR que aparece en la terminal o navegador
- La app se cargará en tu dispositivo

## 📱 Características

- 🔐 **Autenticación de usuarios** con Supabase
- 📍 **Reportes basados en ubicación** de mascotas perdidas/encontradas
- 🗺️ **Mapa interactivo** con marcadores personalizados
- 💬 **Mensajería en tiempo real** entre usuarios
- 📸 **Subida de fotos** para reportes
- 🔔 **Notificaciones** de reportes cercanos
- 📱 **Multiplataforma** (iOS & Android)

## 🏗️ Estructura del Proyecto

```
PetFinderApp/
├── app/                    # Páginas de Expo Router
│   ├── (auth)/            # Pantallas de autenticación
│   │   ├── login.jsx      # Inicio de sesión
│   │   └── register.jsx   # Registro
│   ├── (tabs)/            # Pestañas principales
│   │   ├── index.jsx      # Pantalla principal (mapa)
│   │   ├── reports.jsx    # Mis reportes
│   │   ├── pets.jsx       # Mis mascotas
│   │   ├── messages.jsx   # Mensajes
│   │   └── profile.jsx    # Perfil
│   ├── report/            # Crear reportes
│   └── _layout.jsx        # Layout raíz
├── src/                   # Código fuente
│   ├── components/        # Componentes reutilizables
│   │   ├── Map/          # Componentes del mapa
│   │   └── UI/           # Componentes de interfaz
│   ├── services/         # Servicios de API
│   │   ├── supabase.js   # Cliente de Supabase
│   │   └── location.js   # Servicios de ubicación
│   ├── stores/           # Gestión de estado
│   │   └── authStore.js  # Store de autenticación
│   └── config/           # Configuración
│       └── env.js        # Variables de entorno
├── assets/               # Imágenes y archivos estáticos
└── components/           # Componentes de plantilla de Expo
```

## 🛠️ Stack Tecnológico

- **Framework**: React Native con Expo
- **Navegación**: Expo Router
- **Base de datos**: Supabase (PostgreSQL)
- **Mapas**: React Native Maps
- **UI**: React Native Paper
- **Estado**: Zustand
- **Ubicación**: Expo Location
- **Imágenes**: Expo Image Picker

## 🔧 Desarrollo

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Simulador iOS o Emulador Android (opcional)
- Dispositivo físico con la app Expo Go

### Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS
- `npm run web` - Ejecutar en web
- `npm run clean` - Limpiar caché y reiniciar
- `npm run lint` - Ejecutar ESLint

### Variables de Entorno

Crea un archivo `.env` en el directorio raíz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
EXPO_PUBLIC_APP_NAME=Pet Finder
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu-clave-de-google-maps
```

## 🐛 Solución de Problemas

### Error "Configuración de Supabase no válida"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Asegúrate de que las variables empiecen con `EXPO_PUBLIC_`
- Reinicia la aplicación después de crear el archivo `.env`

### Error de conexión a la base de datos
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Verifica tu conexión a internet

### Error de ubicación
- Verifica que la aplicación tenga permisos de ubicación
- En el simulador, ve a Device > Location y configura una ubicación

### Error de Metro/Bundle
- Ejecuta `npm run clean` para limpiar la caché
- Reinicia el servidor de desarrollo

## 📖 Documentación Adicional

- [Configuración de Supabase](./CONFIGURACION-SUPABASE.md) - Guía completa para configurar la base de datos
- [Guía de Testing](./README-TESTING.md) - Información sobre pruebas

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Expo](https://expo.dev) por el framework de desarrollo
- [Supabase](https://supabase.com) por la plataforma de backend
- [React Native Paper](https://reactnativepaper.com) por los componentes de UI
- La comunidad de React Native por el apoyo y recursos