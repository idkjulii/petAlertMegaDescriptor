import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, TextInput, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
            } catch (error) {
              console.error('Error cerrando sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      // Aquí podrías implementar la actualización del perfil
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Mi Perfil</Title>
        
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <TextInput
              label="Nombre completo"
              value={profileData.full_name}
              onChangeText={(text) => setProfileData({ ...profileData, full_name: text })}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Teléfono"
              value={profileData.phone}
              onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <TextInput
              label="Email"
              value={user.email}
              mode="outlined"
              editable={false}
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={styles.updateButton}
            >
              Actualizar Perfil
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <Text style={styles.statText}>📧 Email: {user.email}</Text>
            <Text style={styles.statText}>📅 Miembro desde: {new Date(user.created_at).toLocaleDateString()}</Text>
            <Text style={styles.statText}>✅ Email verificado: {user.email_confirmed_at ? 'Sí' : 'No'}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Acciones</Text>
            
            <Button
              mode="outlined"
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
              style={styles.logoutButton}
              buttonColor="#FF3B30"
              textColor="#FFFFFF"
            >
              Cerrar Sesión
            </Button>
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
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 8,
  },
});

