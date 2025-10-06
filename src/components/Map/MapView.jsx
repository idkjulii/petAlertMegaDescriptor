import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import MapView, { Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { getCurrentLocation } from '../../services/location';
import ReportMarker from './ReportMarker';

const CustomMapView = ({ 
  reports = [],
  onReportPress,
  showUserLocation = true,
  showRadius = false,
  radiusMeters = 5000,
  initialRegion = null,
  style,
}) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(initialRegion);

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
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        onRegionChangeComplete={setRegion}
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

        {reports.map((report) => {
          const latitude = report.latitude || report.location?.coordinates?.[1];
          const longitude = report.longitude || report.location?.coordinates?.[0];

          if (!latitude || !longitude) return null;

          return (
            <ReportMarker
              key={report.id}
              report={report}
              coordinate={{ latitude, longitude }}
              onPress={() => onReportPress && onReportPress(report)}
            />
          );
        })}
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

