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
    HelperText,
    Paragraph,
    Text,
    TextInput,
    Title,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { data, error } = await authService.signUp(
        email.trim(),
        password,
        fullName.trim()
      );

      if (error) {
        console.error('Error en registro:', error);
        Alert.alert(
          'Error de registro',
          error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.'
        );
      } else {
        Alert.alert(
          '¡Registro exitoso!',
          'Tu cuenta ha sido creada correctamente. Por favor, verifica tu email antes de iniciar sesión.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/(auth)/login');
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { text: '', color: '#666' };
    if (password.length < 6) return { text: 'Débil', color: '#FF3B30' };
    if (password.length < 8) return { text: 'Media', color: '#FF9500' };
    return { text: 'Fuerte', color: '#34C759' };
  };

  const passwordStrength = getPasswordStrength(password);

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
              Únete a nuestra comunidad para ayudar a encontrar mascotas perdidas
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.cardTitle}>Crear Cuenta</Title>

              <TextInput
                label="Nombre completo"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

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

              {password.length > 0 && (
                <HelperText type="info" style={styles.helperText}>
                  Seguridad: <Text style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </Text>
                </HelperText>
              )}

              <TextInput
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <HelperText type="error" style={styles.helperText}>
                  Las contraseñas no coinciden
                </HelperText>
              )}

              {confirmPassword.length > 0 && password === confirmPassword && (
                <HelperText type="info" style={styles.helperText}>
                  ✓ Las contraseñas coinciden
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}
              >
                Crear Cuenta
              </Button>

              <Divider style={styles.divider} />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  ¿Ya tienes una cuenta?
                </Text>
                <Button
                  mode="text"
                  onPress={goToLogin}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonText}
                >
                  Inicia sesión aquí
                </Button>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Paragraph style={styles.footerText}>
              Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad
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
  helperText: {
    marginTop: -12,
    marginBottom: 8,
    fontSize: 12,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 8,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  loginButton: {
    marginTop: -8,
  },
  loginButtonText: {
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

