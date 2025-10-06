import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { Text } from 'react-native-paper';

const ReportMarker = ({ report, coordinate, onPress }) => {
  const isLost = report.type === 'lost';
  const markerColor = isLost ? '#FF3B30' : '#34C759';
  const primaryPhoto = report.photos?.[0];

  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerImageContainer, { borderColor: markerColor }]}>
          {primaryPhoto ? (
            <Image
              source={{ uri: primaryPhoto }}
              style={styles.markerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.markerPlaceholder, { backgroundColor: markerColor }]}>
              <Text style={styles.markerEmoji}>
                {report.species === 'dog' ? '🐕' : report.species === 'cat' ? '🐈' : '🐾'}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.markerPointer, { borderTopColor: markerColor }]} />
      </View>

      <Callout tooltip onPress={onPress}>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutContent}>
            <Text style={styles.calloutTitle} numberOfLines={1}>
              {report.pet_name || `${isLost ? 'Perdido' : 'Encontrado'}`}
            </Text>
            <Text style={styles.calloutType}>
              {isLost ? '🔴 Mascota Perdida' : '🟢 Mascota Encontrada'}
            </Text>
            {report.breed && (
              <Text style={styles.calloutBreed} numberOfLines={1}>
                {report.breed}
              </Text>
            )}
            {report.distance_meters && (
              <Text style={styles.calloutDistance}>
                📍 {formatDistance(report.distance_meters)}
              </Text>
            )}
          </View>
          <View style={styles.calloutArrow} />
        </View>
      </Callout>
    </Marker>
  );
};

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m de distancia`;
  }
  return `${(meters / 1000).toFixed(1)}km de distancia`;
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerEmoji: {
    fontSize: 24,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  calloutBreed: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 4,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    alignSelf: 'center',
    marginTop: -1,
  },
});

export default ReportMarker;

