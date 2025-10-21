// Wrapper robusto para ImagePicker que maneja errores de API
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const ImagePickerService = {
  // Solicitar permisos de galería
  async requestGalleryPermissions() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de galería:', error);
      return false;
    }
  },

  // Solicitar permisos de cámara
  async requestCameraPermissions() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de cámara:', error);
      return false;
    }
  },

  // Seleccionar imagen de galería
  async pickImageFromGallery() {
    try {
      const hasPermission = await this.requestGalleryPermissions();
      if (!hasPermission) {
        Alert.alert('Permisos necesarios', 'Necesitas permitir el acceso a la galería para seleccionar fotos');
        return null;
      }

      // Usar la API correcta según la versión
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', // Usar string en lugar de MediaType.Images
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      return null;
    }
  },

  // Tomar foto con cámara
  async takePhotoWithCamera() {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permisos necesarios', 'Necesitas permitir el acceso a la cámara para tomar fotos');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
      return null;
    }
  }
};
