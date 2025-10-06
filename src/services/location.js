import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        granted: false,
        error: 'Permiso de ubicación denegado',
      };
    }
    
    return { granted: true, error: null };
  } catch (error) {
    console.error('Error solicitando permisos de ubicación:', error);
    return { granted: false, error };
  }
};

export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error verificando permisos de ubicación:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const permission = await requestLocationPermission();
      if (!permission.granted) {
        throw new Error('Permiso de ubicación denegado');
      }
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      error: null,
    };
  } catch (error) {
    console.error('Error obteniendo ubicación actual:', error);
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      error,
    };
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      const formattedAddress = formatAddress(address);
      
      return {
        address: formattedAddress,
        details: address,
        error: null,
      };
    }
    
    return {
      address: null,
      details: null,
      error: new Error('No se encontró dirección'),
    };
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    return {
      address: null,
      details: null,
      error,
    };
  }
};

export const formatAddress = (addressObject) => {
  const parts = [];
  
  if (addressObject.street) parts.push(addressObject.street);
  if (addressObject.streetNumber) parts.push(addressObject.streetNumber);
  if (addressObject.city) parts.push(addressObject.city);
  if (addressObject.region) parts.push(addressObject.region);
  if (addressObject.country) parts.push(addressObject.country);
  
  return parts.join(', ');
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const getMapRegion = (latitude, longitude, latitudeDelta = 0.05, longitudeDelta = 0.05) => {
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export default {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  reverseGeocode,
  formatAddress,
  calculateDistance,
  formatDistance,
  getMapRegion,
};

