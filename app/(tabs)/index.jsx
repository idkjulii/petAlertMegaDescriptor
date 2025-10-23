import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { FAB, Portal, Provider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from '../../src/components/Map/MapView';
import ReportModal from '../../src/components/UI/ReportModal';
import { getCurrentLocation } from '../../src/services/location';
import { authService, messageService, reportService } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { getUserId } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    initializeScreen();
  }, []);

  // Refrescar reportes cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      // Solo refrescar si ya se inicializó la pantalla
      if (reports.length >= 0) {
        loadReportsNearby();
      }
    }, [])
  );

  const initializeScreen = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      setCurrentUser(user);

      await loadReportsNearby();
    } catch (error) {
      console.error('Error inicializando pantalla:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
    }
  };

  const loadReportsNearby = async () => {
    try {
      setLoading(true);

      const location = await getCurrentLocation();

      if (location.error || !location.latitude || !location.longitude) {
        console.warn('⚠️ No se pudo obtener la ubicación:', location.error);
        Alert.alert(
          'Ubicación requerida',
          'Necesitamos acceso a tu ubicación para mostrar reportes cercanos.'
        );
        setLoading(false);
        return;
      }

      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      console.log(`📍 Ubicación obtenida: ${location.latitude}, ${location.longitude}`);

      // Intentar obtener reportes cercanos primero
      let { data, error } = await reportService.getNearbyReports(
        location.latitude,
        location.longitude,
        5000
      );

      // Si falla, usar método simple para obtener todos los reportes
      if (error || !data || data.length === 0) {
        console.log('⚠️ Fallback: obteniendo todos los reportes...');
        const simpleResult = await reportService.getReportsSimple();
        data = simpleResult.data;
        error = simpleResult.error;
      }

      if (error) {
        console.error('Error cargando reportes:', error);
        
        // Mostrar mensaje más específico según el tipo de error
        let errorMessage = 'No se pudieron cargar los reportes';
        let errorTitle = 'Error';
        
        if (error.message && error.message.includes('Configuración de Supabase')) {
          errorTitle = 'Configuración requerida';
          errorMessage = 'Por favor, configura las credenciales de Supabase:\n\n1. Crea un archivo .env en la raíz del proyecto\n2. Agrega EXPO_PUBLIC_SUPABASE_URL\n3. Agrega EXPO_PUBLIC_SUPABASE_ANON_KEY';
        } else if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message && error.message.includes('Coordenadas inválidas')) {
          errorMessage = 'Error de ubicación. Por favor, verifica los permisos de ubicación.';
        }
        
        Alert.alert(errorTitle, errorMessage);
        setReports([]); // Establecer array vacío en caso de error
      } else {
        setReports(data || []);
        console.log(`✅ Cargados ${data?.length || 0} reportes cercanos`);
        
        // Debug: mostrar información de los reportes cargados
        if (data && data.length > 0) {
          console.log('📍 Reportes cargados:', data.map(report => ({
            id: report.id,
            type: report.type,
            location: report.location,
            latitude: report.latitude,
            longitude: report.longitude,
            hasValidCoords: !!(report.latitude && report.longitude) || 
                           (report.location && typeof report.location === 'string' && report.location.includes('POINT'))
          })));
        }
      }
    } catch (error) {
      console.error('Error en loadReportsNearby:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al cargar los reportes');
      setReports([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportsNearby();
    setRefreshing(false);
  };

  const handleReportPress = (report) => {
    router.push(`/report/${report.id}`);
  };

  const handleMarkerPress = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const handleViewDetails = () => {
    setModalVisible(false);
    router.push(`/report/${selectedReport.id}`);
  };

  const handleContact = async () => {
    try {
      const currentUserId = getUserId();
      
      if (!currentUserId) {
        Alert.alert('Error', 'Debes iniciar sesión para contactar al reportero');
        return;
      }

      if (currentUserId === selectedReport.reporter_id) {
        Alert.alert('Información', 'Este es tu propio reporte');
        return;
      }

      // Crear o obtener conversación
      const { data: conversation, error: convError } = await messageService.getOrCreateConversation(
        selectedReport.id,
        currentUserId,
        selectedReport.reporter_id
      );

      if (convError) {
        console.error('Error creando conversación:', convError);
        Alert.alert('Error', 'No se pudo iniciar la conversación');
        return;
      }

      // Cerrar modal y navegar a la conversación
      setModalVisible(false);
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error contactando reportero:', error);
      Alert.alert('Error', 'Ocurrió un error al contactar al reportero');
    }
  };

  const handleCreateLostReport = () => {
    setFabOpen(false);
    router.push('/report/create-lost');
  };

  const handleCreateFoundReport = () => {
    setFabOpen(false);
    router.push('/report/create-found');
  };

  const handleAISearch = () => {
    setFabOpen(false);
    router.push('/ai-search');
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <MapView
          reports={reports}
          onReportPress={handleReportPress}
          onMarkerPress={handleMarkerPress}
          showUserLocation={true}
          showRadius={false}
          style={styles.map}
        />

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📍 {reports.length} reporte{reports.length !== 1 ? 's' : ''} cerca de ti
            </Text>
          </View>
        </View>

        <Portal>
          <FAB.Group
            open={fabOpen}
            visible={true}
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: 'magnify',
                label: 'Búsqueda IA',
                onPress: handleAISearch,
                small: false,
                color: '#007AFF',
              },
              {
                icon: 'paw',
                label: 'Encontré una mascota',
                onPress: handleCreateFoundReport,
                small: false,
                color: '#34C759',
              },
              {
                icon: 'alert',
                label: 'Perdí mi mascota',
                onPress: handleCreateLostReport,
                small: false,
                color: '#FF3B30',
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={styles.fab}
          />
        </Portal>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </Text>
        </TouchableOpacity>

        {/* Modal de información del reporte */}
        <ReportModal
          visible={modalVisible}
          report={selectedReport}
          onClose={handleModalClose}
          onViewDetails={handleViewDetails}
          onContact={handleContact}
        />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fab: {
    backgroundColor: '#007AFF',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

