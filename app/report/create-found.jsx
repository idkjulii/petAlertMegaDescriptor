import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Chip,
    HelperText,
    Paragraph,
    Text,
    TextInput,
    Title,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from '../../src/components/Map/MapView';
import { getCurrentLocation, reverseGeocode } from '../../src/services/location';
import { storageService } from '../../src/services/storage';
import { reportService } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/authStore';

const SPECIES_OPTIONS = [
  { id: 'dog', label: 'Perro', icon: 'dog' },
  { id: 'cat', label: 'Gato', icon: 'cat' },
  { id: 'bird', label: 'Ave', icon: 'bird' },
  { id: 'rabbit', label: 'Conejo', icon: 'rabbit' },
  { id: 'other', label: 'Otro', icon: 'paw' },
];

const SIZE_OPTIONS = [
  { id: 'small', label: 'Pequeño' },
  { id: 'medium', label: 'Mediano' },
  { id: 'large', label: 'Grande' },
];

export default function CreateFoundReportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Estados del formulario
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    getCurrentLocationAndAddress();
    setFoundDate(new Date().toISOString().split('T')[0]); // Fecha actual
  }, []);

  const getCurrentLocationAndAddress = async () => {
    try {
      const locationResult = await getCurrentLocation();
      
      if (locationResult.error) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, habilita los permisos de ubicación.'
        );
        return;
      }

      const geocodeResult = await reverseGeocode(
        locationResult.latitude,
        locationResult.longitude
      );

      setLocation({
        latitude: locationResult.latitude,
        longitude: locationResult.longitude,
        address: geocodeResult.address || `Ubicación actual: ${locationResult.latitude.toFixed(6)}, ${locationResult.longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      // En caso de error, al menos establecer las coordenadas
      if (locationResult && !locationResult.error) {
        setLocation({
          latitude: locationResult.latitude,
          longitude: locationResult.longitude,
          address: `Ubicación actual: ${locationResult.latitude.toFixed(6)}, ${locationResult.longitude.toFixed(6)}`,
        });
      }
    }
  };

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('Límite alcanzado', 'Máximo 5 fotos permitidas');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Límite alcanzado', 'Máximo 5 fotos permitidas');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleLocationSelect = async (coordinates) => {
    try {
      setSelectedLocation(coordinates);
      
      // Obtener la dirección de las coordenadas seleccionadas
      const geocodeResult = await reverseGeocode(coordinates.latitude, coordinates.longitude);
      
      setLocation({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: geocodeResult.address || `Ubicación: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
      });
      
      setShowMap(false);
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      // No mostrar alerta, usar coordenadas como fallback
      setLocation({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: `Ubicación: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
      });
      setShowMap(false);
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const validateForm = () => {
    if (!species) {
      Alert.alert('Error', 'Por favor selecciona la especie');
      return false;
    }
    if (!size) {
      Alert.alert('Error', 'Por favor selecciona el tamaño');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    if (!foundLocation.trim()) {
      Alert.alert('Error', 'Por favor ingresa dónde encontraste a la mascota');
      return false;
    }
    if (!foundDate) {
      Alert.alert('Error', 'Por favor ingresa cuándo la encontraste');
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una foto');
      return false;
    }
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
      return false;
    }
    return true;
  };

  const handleCreateReport = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Subir fotos
      let photoUrls = [];
      if (photos.length > 0) {
        const uploadResult = await storageService.uploadReportPhotos(user.id, Date.now().toString(), photos);
        if (uploadResult.error) {
          throw new Error('Error subiendo fotos: ' + uploadResult.error.message);
        }
        photoUrls = uploadResult.urls;
      }

      // Crear reporte
      const reportData = {
        type: 'found',
        reporter_id: user.id,
        pet_name: null, // No conocemos el nombre
        species,
        breed: breed.trim() || null,
        color: color.trim() || null,
        size,
        description: description.trim(),
        distinctive_features: distinctiveFeatures.trim() || null,
        photos: photoUrls,
        location: `SRID=4326;POINT(${location.longitude} ${location.latitude})`,
        address: location.address,
        location_details: foundLocation.trim(),
        incident_date: foundDate,
        status: 'active',
      };

      const { data, error } = await reportService.createReport(reportData);

      if (error) {
        throw new Error(error.message || 'Error creando reporte');
      }

      Alert.alert(
        '¡Reporte creado!',
        'Tu reporte de mascota encontrada ha sido publicado. Ayudarás a reunir a la mascota con su familia.',
        [
          {
            text: 'Ver reporte',
            onPress: () => router.push(`/report/${data.id}`),
          },
          {
            text: 'Volver al inicio',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creando reporte:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Title style={styles.title}>🟢 Reportar Mascota Encontrada</Title>
            <Paragraph style={styles.subtitle}>
              Ayuda a reunir a esta mascota con su familia
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Información Básica</Title>

              <View style={styles.section}>
                <Paragraph style={styles.sectionLabel}>Especie *</Paragraph>
                <View style={styles.chipContainer}>
                  {SPECIES_OPTIONS.map((option) => (
                    <Chip
                      key={option.id}
                      selected={species === option.id}
                      onPress={() => {
                        console.log('🐾 Seleccionando especie:', option.id);
                        setSpecies(option.id);
                      }}
                      style={styles.chip}
                      icon={option.icon}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <TextInput
                label="Raza"
                value={breed}
                onChangeText={setBreed}
                mode="outlined"
                style={styles.input}
                placeholder="Ej: Labrador, Persa, etc."
              />

              <TextInput
                label="Color"
                value={color}
                onChangeText={setColor}
                mode="outlined"
                style={styles.input}
                placeholder="Ej: Dorado, Negro, Blanco, etc."
              />

              <View style={styles.section}>
                <Paragraph style={styles.sectionLabel}>Tamaño *</Paragraph>
                <View style={styles.chipContainer}>
                  {SIZE_OPTIONS.map((option) => (
                    <Chip
                      key={option.id}
                      selected={size === option.id}
                      onPress={() => setSize(option.id)}
                      style={styles.chip}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Descripción</Title>

              <TextInput
                label="Descripción *"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="Describe a la mascota, su comportamiento, estado de salud..."
              />

              <TextInput
                label="Señas particulares"
                value={distinctiveFeatures}
                onChangeText={setDistinctiveFeatures}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Marcas, cicatrices, collar, microchip, etc."
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Información del Encuentro</Title>

              <TextInput
                label="Dónde la encontraste *"
                value={foundLocation}
                onChangeText={setFoundLocation}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                placeholder="Ej: Parque Central, Calle Principal 123, etc."
              />

              <TextInput
                label="Cuándo la encontraste *"
                value={foundDate}
                onChangeText={setFoundDate}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
              />
              <HelperText type="info" style={styles.helperText}>
                Formato: AAAA-MM-DD
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Fotos *</Title>
              <Paragraph style={styles.photoHelp}>
                Agrega fotos claras de la mascota (máximo 5)
              </Paragraph>

              <View style={styles.photoButtons}>
                <Button
                  mode="outlined"
                  onPress={pickImage}
                  icon="image"
                  style={styles.photoButton}
                  disabled={photos.length >= 5}
                >
                  Galería
                </Button>
                <Button
                  mode="outlined"
                  onPress={takePhoto}
                  icon="camera"
                  style={styles.photoButton}
                  disabled={photos.length >= 5}
                >
                  Cámara
                </Button>
              </View>

              {photos.length > 0 && (
                <View style={styles.photosContainer}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Text style={styles.removePhotoText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <HelperText type="info" style={styles.helperText}>
                {photos.length}/5 fotos seleccionadas
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Ubicación del Reporte</Title>

              <View style={styles.locationContainer}>
                <Paragraph style={styles.locationLabel}>📍 Ubicación seleccionada:</Paragraph>
                <Paragraph style={styles.locationText}>
                  {location?.address || 'Obteniendo ubicación...'}
                </Paragraph>
                
                <View style={styles.locationButtons}>
                  <Button
                    mode="outlined"
                    onPress={getCurrentLocationAndAddress}
                    style={styles.locationButton}
                    icon="crosshairs-gps"
                  >
                    Mi ubicación
                  </Button>
                  <Button
                    mode="contained"
                    onPress={toggleMap}
                    style={styles.locationButton}
                    icon="map-marker"
                  >
                    {showMap ? 'Ocultar mapa' : 'Seleccionar en mapa'}
                  </Button>
                </View>
              </View>

              {showMap && (
                <View style={styles.mapContainer}>
                  <MapView
                    reports={[]}
                    onLocationSelect={handleLocationSelect}
                    allowLocationSelection={true}
                    selectedLocation={selectedLocation}
                    showUserLocation={true}
                    style={styles.map}
                  />
                  <Paragraph style={styles.mapHelp}>
                    💡 Toca en el mapa para seleccionar la ubicación exacta donde encontraste a la mascota
                  </Paragraph>
                </View>
              )}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleCreateReport}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
              contentStyle={styles.createButtonContent}
            >
              Crear Reporte
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  photoHelp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  photoItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helperText: {
    marginTop: -12,
    marginBottom: 8,
    fontSize: 12,
  },
  locationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
  },
  mapContainer: {
    marginTop: 16,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapHelp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 24,
  },
  createButton: {
    borderRadius: 8,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
});
