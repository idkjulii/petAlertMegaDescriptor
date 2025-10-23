import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { getCurrentLocation } from '../../services/location';

const CustomMapView = ({ 
  reports = [],
  onReportPress,
  onLocationSelect,
  showUserLocation = true,
  showRadius = false,
  radiusMeters = 5000,
  initialRegion = null,
  style,
  allowLocationSelection = false,
  selectedLocation = null,
  onMarkerPress,
}) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    if (!reports || reports.length === 0 || !mapRef.current) return;

    const coordinates = reports
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        latitude: r.latitude,
        longitude: r.longitude,
      }));

    if (coordinates.length === 0) return;

    // Solo loggear en modo debug
    if (__DEV__) {
      console.log('📍 Ajustando mapa a coordenadas:', coordinates);
    }
    
    // Esperar un poco más para que el mapa esté completamente renderizado
    const timer = setTimeout(() => {
      if (mapRef.current) {
        try {
          if (coordinates.length === 1) {
            // Si solo hay un marcador, hacer zoom directo a esa ubicación
            mapRef.current.animateToRegion({
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
              latitudeDelta: 0.01,  // Zoom cercano
              longitudeDelta: 0.01,
            }, 1000);
          } else {
            // Si hay múltiples marcadores, ajustar para mostrar todos
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          }
        } catch (error) {
          console.error('Error ajustando región del mapa:', error);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [reports]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      
      if (location.error || !location.latitude || !location.longitude) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, verifica los permisos.',
        );
        setLoading(false);
        return;
      }

      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (!region) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setLoading(false);
    }
  };

  const handleMapPress = (event) => {
    if (allowLocationSelection && onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationSelect({ latitude, longitude });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {showRadius && userLocation && (
          <Circle
            center={userLocation}
            radius={radiusMeters}
            strokeColor="rgba(0, 122, 255, 0.3)"
            fillColor="rgba(0, 122, 255, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Marcador de prueba simple */}
        <Marker
          coordinate={{
            latitude: -27.4692117,
            longitude: -58.8306333,
          }}
          pinColor="red"
          title="PRUEBA"
          description="Si ves esto, los marcadores funcionan"
          titleStyle={{ color: 'white' }}
          descriptionStyle={{ color: 'white' }}
        />

        {/* Marcadores de reportes - usando marcadores nativos simples */}
        {reports.map((report, index) => {
          let latitude, longitude;
          
          if (report.latitude && report.longitude) {
            latitude = report.latitude;
            longitude = report.longitude;
          }

          if (!latitude || !longitude) {
            console.log('⚠️ Reporte sin coordenadas válidas');
            return null;
          }

          const isLost = report.type === 'lost';
          const markerColor = isLost ? '#FF3B30' : '#34C759';
          
          // Solo loggear en modo debug o cuando hay cambios significativos
          if (__DEV__ && index === 0) {
            console.log('🗺️ Renderizando marcadores para reportes:', {
              total: reports.length,
              sample: {
                id: report.id,
                type: report.type,
                coordinates: { latitude, longitude }
              }
            });
          }

          return (
            <Marker
              key={report.id}
              coordinate={{ latitude, longitude }}
              pinColor={isLost ? 'red' : 'green'}
              title={report.pet_name || (isLost ? 'Mascota Perdida' : 'Mascota Encontrada')}
              description={report.breed || report.species || 'Ver detalles'}
              titleStyle={{ color: 'white' }}
              descriptionStyle={{ color: 'white' }}
              onPress={() => {
                if (onMarkerPress) {
                  onMarkerPress(report);
                } else if (onReportPress) {
                  onReportPress(report);
                }
              }}
            />
          );
        })}

        {allowLocationSelection && selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            pinColor="#007AFF"
            title="Ubicación seleccionada"
            titleStyle={{ color: 'white' }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default CustomMapView;

