import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';

export default function MessagesScreen() {
  const { getUserId } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      // Por ahora, mostrar mensaje de funcionalidad en desarrollo
      setMessages([]);
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
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Mensajes</Title>
        
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyText}>
              💬 Sistema de mensajes
            </Text>
            <Text style={styles.emptySubtext}>
              Esta funcionalidad está en desarrollo. Pronto podrás comunicarte con otros usuarios sobre reportes de mascotas.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>📱 Funcionalidades próximas:</Text>
            <Text style={styles.infoText}>• Chat en tiempo real</Text>
            <Text style={styles.infoText}>• Notificaciones push</Text>
            <Text style={styles.infoText}>• Compartir fotos en chat</Text>
            <Text style={styles.infoText}>• Historial de conversaciones</Text>
          </Card.Content>
        </Card>
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
    marginBottom: 16,
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
    lineHeight: 20,
  },
  infoCard: {
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

