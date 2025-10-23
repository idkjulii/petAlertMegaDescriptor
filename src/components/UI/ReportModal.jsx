import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    IconButton,
    Modal,
    Text
} from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const ReportModal = ({ 
  visible, 
  report, 
  onClose, 
  onViewDetails,
  onContact 
}) => {
  if (!report) return null;

  const isLost = report.type === 'lost';

  const getSpeciesEmoji = (species) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐈';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={styles.modalContainer}
    >
      <Card style={styles.modalCard}>
        {/* Header con botón de cerrar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.modalTitle}>
              {isLost ? '🔴 Mascota Perdida' : '🟢 Mascota Encontrada'}
            </Text>
            <Chip 
              mode="outlined"
              style={[styles.statusChip, { 
                borderColor: report.status === 'active' ? '#34C759' : '#FF9500' 
              }]}
              textStyle={{ 
                color: report.status === 'active' ? '#34C759' : '#FF9500',
                fontSize: 12
              }}
            >
              {report.status === 'active' ? 'Activo' : 'Resuelto'}
            </Chip>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>

        {/* Imagen principal */}
        {report.photos && report.photos.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: report.photos[0] }}
              style={styles.mainImage}
              contentFit="cover"
            />
          </View>
        )}

        {/* Información del reporte */}
        <Card.Content style={styles.content}>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>
              {report.pet_name || (isLost ? 'Mascota Perdida' : 'Mascota Encontrada')}
            </Text>
            <View style={styles.speciesContainer}>
              <Text style={styles.speciesEmoji}>
                {getSpeciesEmoji(report.species)}
              </Text>
              <Text style={styles.speciesText}>
                {report.breed || report.species || 'Sin información'}
              </Text>
            </View>
          </View>

          {/* Descripción */}
          {report.description && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.description} numberOfLines={3}>
                {report.description}
              </Text>
            </>
          )}

          {/* Información de ubicación y distancia */}
          <View style={styles.locationInfo}>
            <Text style={styles.locationText} numberOfLines={2}>
              📍 {report.location_description || 'Sin descripción de ubicación'}
            </Text>
            {report.distance_meters !== undefined && (
              <Text style={styles.distanceText}>
                {formatDistance(report.distance_meters)} de distancia
              </Text>
            )}
          </View>

          {/* Información del contacto */}
          <View style={styles.contactInfo}>
            <View style={styles.reporterInfo}>
              <Avatar.Text 
                size={32} 
                label={report.reporter_name ? report.reporter_name.charAt(0).toUpperCase() : 'U'} 
                style={styles.avatar}
              />
              <View style={styles.reporterDetails}>
                <Text style={styles.reporterName}>
                  {report.reporter_name || 'Usuario'}
                </Text>
                <Text style={styles.reportDate}>
                  {formatDate(report.created_at)}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>

        {/* Botones de acción */}
        <Card.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onViewDetails}
            style={styles.detailsButton}
            compact
          >
            Ver detalles
          </Button>
          <Button
            mode="contained"
            onPress={onContact}
            style={styles.contactButton}
            compact
            icon="message"
          >
            Contactar
          </Button>
        </Card.Actions>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    margin: 16,
    marginBottom: 32,
    borderRadius: 16,
    maxHeight: height * 0.75,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  closeButton: {
    margin: 0,
  },
  imageContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingTop: 0,
  },
  petInfo: {
    marginBottom: 12,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  speciesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  speciesText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  locationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 4,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  contactInfo: {
    marginTop: 16,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  reportDate: {
    fontSize: 12,
    color: '#333333',
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  contactButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ReportModal;

