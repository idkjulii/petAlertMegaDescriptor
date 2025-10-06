import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { petService } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function PetsScreen() {
  const { getUserId } = useAuthStore();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPets();
  }, []);

  const loadUserPets = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await petService.getUserPets(userId);
      
      if (error) {
        console.error('Error cargando mascotas:', error);
      } else {
        setPets(data || []);
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
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Mis Mascotas</Title>
        
        {pets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                🐾 No tienes mascotas registradas aún
              </Text>
              <Text style={styles.emptySubtext}>
                Registra tu primera mascota para poder crear reportes
              </Text>
            </Card.Content>
          </Card>
        ) : (
          pets.map((pet) => (
            <Card key={pet.id} style={styles.petCard}>
              <Card.Content>
                <Text style={styles.petName}>
                  {pet.name || 'Sin nombre'}
                </Text>
                <Text style={styles.petInfo}>
                  🐕 {pet.species === 'dog' ? 'Perro' : pet.species === 'cat' ? 'Gato' : 'Otro'} • {pet.breed || 'Raza no especificada'}
                </Text>
                <Text style={styles.petInfo}>
                  📏 Tamaño: {pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande'}
                </Text>
                <Text style={styles.petInfo}>
                  🎨 Color: {pet.color || 'No especificado'}
                </Text>
                {pet.is_lost && (
                  <Text style={styles.lostStatus}>
                    ⚠️ MASCOTA PERDIDA
                  </Text>
                )}
                <Text style={styles.petDate}>
                  📅 Registrado: {new Date(pet.created_at).toLocaleDateString()}
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
  petCard: {
    marginBottom: 16,
    elevation: 2,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  petInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lostStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 8,
    marginBottom: 4,
  },
  petDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

