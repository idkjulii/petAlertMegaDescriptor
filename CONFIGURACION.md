# Pet Finder App - Configuración

## Problemas Solucionados

### 1. Error de InternalBytecode.js
- **Problema**: Error de Metro bundler al intentar leer un archivo inexistente
- **Solución**: Limpiar la caché con `npx expo start -c`

### 2. Error de carga de reportes
- **Problema**: No se pueden cargar reportes debido a configuración faltante de Supabase
- **Solución**: Configurar las credenciales de Supabase

## Configuración de Supabase

### Paso 1: Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anónima

### Paso 2: Configurar variables de entorno
Edita el archivo `src/config/env.js` y reemplaza los valores por defecto:

```javascript
export const config = {
  supabase: {
    url: 'https://tu-proyecto-id.supabase.co', // Tu URL real
    anonKey: 'tu-clave-anonima-real', // Tu clave anónima real
  },
  // ... resto de la configuración
};
```

### Paso 3: Crear tablas en Supabase
Ejecuta estos comandos SQL en el editor SQL de Supabase:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  location GEOGRAPHY(POINT),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabla de mascotas
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  size TEXT,
  age INTEGER,
  description TEXT,
  is_lost BOOLEAN DEFAULT FALSE,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  photos TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, participant_1, participant_2)
);

-- Tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para obtener reportes cercanos (opcional)
CREATE OR REPLACE FUNCTION nearby_reports(
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    ST_Distance(
      ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
      ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')')
    ) AS distance_meters
  FROM reports r
  WHERE r.status = 'active'
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
      ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')'),
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para mascotas
CREATE POLICY "Users can view all pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para reportes
CREATE POLICY "Users can view all reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = reporter_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = reporter_id);

-- Políticas para conversaciones
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Políticas para mensajes
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
```

### Paso 4: Configurar Storage
En Supabase, ve a Storage y crea estos buckets:
- `avatars` (público)
- `pet-photos` (público)  
- `report-photos` (público)

### Paso 5: Reiniciar la aplicación
```bash
npx expo start -c
```

## Solución de Problemas

### Error de configuración
Si ves el mensaje "Configuración de Supabase no válida":
1. Verifica que las credenciales en `src/config/env.js` sean correctas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Verifica que las tablas estén creadas correctamente

### Error de función nearby_reports
Si la función RPC no existe, la aplicación usará automáticamente una consulta alternativa que funciona sin la función personalizada.

### Error de permisos de ubicación
La aplicación requiere permisos de ubicación para mostrar reportes cercanos. Asegúrate de permitir el acceso cuando se solicite.

## Funcionalidades Implementadas

✅ Manejo robusto de errores
✅ Configuración centralizada
✅ Función de respaldo para reportes cercanos
✅ Mensajes de error específicos
✅ Limpieza de caché de Metro
✅ Validación de configuración





