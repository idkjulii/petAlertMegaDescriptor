import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportService } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function ReportsScreen() {
  const { getUserId } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReports();
  }, []);

  const loadUserReports = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await reportService.getUserReports(userId);
      
      if (error) {
        console.error('Error cargando reportes:', error);
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Mis Reportes</Title>
        
        {reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                📝 No tienes reportes creados aún
              </Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer reporte desde la pantalla de inicio
              </Text>
            </Card.Content>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.reportType}>
                  {report.type === 'lost' ? '🔴 Mascota Perdida' : '🟢 Mascota Encontrada'}
                </Text>
                <Text style={styles.reportPetName}>
                  {report.pet_name || 'Sin nombre'}
                </Text>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description || 'Sin descripción'}
                </Text>
                <Text style={styles.reportDate}>
                  📅 {new Date(report.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.reportStatus}>
                  Estado: {report.status === 'active' ? 'Activo' : 'Resuelto'}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 40,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  reportCard: {
    marginBottom: 16,
    elevation: 2,
  },
  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportPetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  reportStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});

