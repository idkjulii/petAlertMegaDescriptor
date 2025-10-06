import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, initialize, initialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        await initialize();
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [initialize]);

  useEffect(() => {
    if (!initialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated()) {
      // Usuario autenticado
      if (inAuthGroup) {
        // Si está en grupo de auth, redirigir a tabs
        router.replace('/(tabs)');
      } else if (segments.length === 0 || segments[0] === 'index') {
        // Si está en la raíz, redirigir a tabs
        router.replace('/(tabs)');
      }
    } else {
      // Usuario no autenticado
      if (inTabsGroup || segments.length === 0 || segments[0] === 'index') {
        // Si está en tabs o raíz, redirigir a login
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, initialized, segments, router, isLoading]);

  // Mostrar loading mientras se inicializa la autenticación
  if (!initialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Renderizar el slot para las rutas
  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

