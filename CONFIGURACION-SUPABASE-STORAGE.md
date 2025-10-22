# Script para verificar configuración de Supabase Storage

## Buckets necesarios para PetFind:

### 1. Bucket para avatares de usuarios
- Nombre: `avatars`
- Público: Sí
- Política: Los usuarios pueden subir su propio avatar

### 2. Bucket para fotos de mascotas
- Nombre: `pet-photos`
- Público: Sí
- Política: Los usuarios pueden subir fotos de sus mascotas

### 3. Bucket para fotos de reportes
- Nombre: `report-photos`
- Público: Sí
- Política: Los usuarios pueden subir fotos de reportes

## SQL para crear los buckets:

```sql
-- Crear bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Crear bucket para fotos de mascotas
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);

-- Crear bucket para fotos de reportes
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true);
```

## Políticas de Storage:

```sql
-- Políticas para avatares
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Políticas para fotos de mascotas
CREATE POLICY "Users can upload pet photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their pet photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their pet photos" ON storage.objects
FOR DELETE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Pet photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos');

-- Políticas para fotos de reportes
CREATE POLICY "Users can upload report photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their report photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their report photos" ON storage.objects
FOR DELETE USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Report photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'report-photos');
```

## Verificar configuración:

```sql
-- Verificar buckets existentes
SELECT * FROM storage.buckets;

-- Verificar políticas de storage
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```
