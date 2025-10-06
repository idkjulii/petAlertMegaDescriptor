# Configuración de Supabase para Pet Finder App

## Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

### 2. Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia la **Project URL**
3. Copia la **anon public** key

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
EXPO_PUBLIC_APP_NAME=Pet Finder
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 4. Configurar la base de datos

Ejecuta los siguientes scripts SQL en el SQL Editor de Supabase:

#### Crear tabla de perfiles:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location GEOGRAPHY(POINT),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

#### Crear tabla de mascotas:
```sql
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  age INTEGER,
  size TEXT,
  description TEXT,
  photos TEXT[],
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Crear tabla de reportes:
```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  pet_name TEXT,
  species TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  age INTEGER,
  size TEXT,
  description TEXT,
  photos TEXT[],
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT),
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Crear tabla de conversaciones:
```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, participant_1, participant_2)
);
```

#### Crear tabla de mensajes:
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Crear políticas RLS (Row Level Security):
```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para pets
CREATE POLICY "Users can view all pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para reports
CREATE POLICY "Users can view all reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = reporter_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = reporter_id);

-- Políticas para conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- Políticas para messages
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);
```

### 5. Configurar autenticación

1. Ve a **Authentication** > **Settings**
2. Configura las URLs de redirección:
   - Site URL: `exp://192.168.0.204:8081` (o tu IP local)
   - Redirect URLs: `exp://192.168.0.204:8081`

### 6. Reiniciar la aplicación

Después de configurar todo:

```bash
# Limpiar caché y reiniciar
npx expo start --clear
```

## Verificación

Una vez configurado correctamente, deberías ver en la consola:
- ✅ Configuración de Supabase válida
- 📍 Ubicación obtenida correctamente
- 🔍 Reportes cargados (aunque estén vacíos inicialmente)

## Solución de problemas

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