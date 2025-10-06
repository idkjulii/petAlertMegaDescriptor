import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Divider,
    Paragraph,
    Text,
    TextInput,
    Title,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Intentando iniciar sesión con:', email.trim());
      
      const { data, error } = await authService.signIn(email.trim(), password);

      console.log('📊 Resultado del login:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ Error en login:', error);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'No se pudo iniciar sesión. Verifica tus credenciales.';
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email antes de iniciar sesión.';
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Error de inicio de sesión', errorMessage);
      } else if (data?.user) {
        console.log('✅ Login exitoso para usuario:', data.user.email);
        // Navegar directamente a tabs sin Alert
        router.replace('/(tabs)');
      } else {
        console.warn('⚠️ Login sin datos de usuario');
        Alert.alert('Error', 'No se recibieron datos del usuario. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('💥 Error inesperado en login:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/(auth)/register');
  };

  const goToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Title style={styles.title}>🐾 Pet Finder</Title>
            <Paragraph style={styles.subtitle}>
              Inicia sesión para ayudar a encontrar mascotas perdidas
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Iniciar Sesión</Title>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="text"
                onPress={goToForgotPassword}
                style={styles.forgotButton}
                labelStyle={styles.forgotButtonText}
              >
                ¿Olvidaste tu contraseña?
              </Button>

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                Iniciar Sesión
              </Button>

              <Divider style={styles.divider} />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  ¿No tienes una cuenta?
                </Text>
                <Button
                  mode="text"
                  onPress={goToRegister}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonText}
                >
                  Regístrate aquí
                </Button>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Paragraph style={styles.footerText}>
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </Paragraph>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 20,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  registerButton: {
    marginTop: -8,
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});