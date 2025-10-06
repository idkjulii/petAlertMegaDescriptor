import * as FileSystem from 'expo-file-system/legacy'; // Importa la API legacy
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export const compressImage = async (uri, quality = 0.7) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    throw error;
  }
};

export const imageToBase64 = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error convirtiendo imagen a base64:', error);
    throw error;
  }
};

const generateUniqueFileName = (prefix = 'image') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}_${timestamp}_${random}.jpg`;
};

export const uploadAvatar = async (userId, imageUri) => {
  try {
    const compressedUri = await compressImage(imageUri, 0.6);
    const base64 = await imageToBase64(compressedUri);
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    const fileName = 'avatar.jpg';
    const filePath = `${userId}/${fileName}`;
    
    await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) throw error;
    
    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return {
      path: data.path,
      url: publicData.publicUrl,
      error: null,
    };
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    return { path: null, url: null, error };
  }
};

export const uploadPetPhotos = async (userId, petId, imageUris) => {
  try {
    const uploadedPhotos = [];
    
    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const compressedUri = await compressImage(uri, 0.7);
      const base64 = await imageToBase64(compressedUri);
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      const fileName = `${petId}_${i + 1}.jpg`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (error) {
        console.error(`Error subiendo foto ${i + 1}:`, error);
        continue;
      }
      
      const { data: publicData } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);
      
      uploadedPhotos.push(publicData.publicUrl);
    }
    
    return {
      urls: uploadedPhotos,
      error: uploadedPhotos.length === 0 ? new Error('No se pudo subir ninguna foto') : null,
    };
  } catch (error) {
    console.error('Error subiendo fotos de mascota:', error);
    return { urls: [], error };
  }
};

export const uploadReportPhotos = async (userId, reportId, imageUris) => {
  try {
    const uploadedPhotos = [];
    
    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const compressedUri = await compressImage(uri, 0.7);
      const base64 = await imageToBase64(compressedUri);
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      const fileName = `${reportId}_${i + 1}.jpg`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('report-photos')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (error) {
        console.error(`Error subiendo foto de reporte ${i + 1}:`, error);
        continue;
      }
      
      const { data: publicData } = supabase.storage
        .from('report-photos')
        .getPublicUrl(filePath);
      
      uploadedPhotos.push(publicData.publicUrl);
    }
    
    return {
      urls: uploadedPhotos,
      error: uploadedPhotos.length === 0 ? new Error('No se pudo subir ninguna foto') : null,
    };
  } catch (error) {
    console.error('Error subiendo fotos de reporte:', error);
    return { urls: [], error };
  }
};

export default {
  compressImage,
  imageToBase64,
  uploadAvatar,
  uploadPetPhotos,
  uploadReportPhotos,
};