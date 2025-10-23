import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Configurar el video para que se reproduzca automáticamente
    const setupVideo = async () => {
      if (videoRef.current) {
        try {
           await videoRef.current.loadAsync(
             require('../assets/images/Logo_Animado_Para_Aplicación_PetAlert - Trim.mp4'),
             {
               shouldPlay: true,
               isLooping: false,
               isMuted: true,
             }
           );
        } catch (error) {
          console.error('Error cargando el video:', error);
          // Si hay error, llamar onFinish inmediatamente
          setTimeout(() => onFinish && onFinish(), 1000);
        }
      }
    };

    setupVideo();
  }, []);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Cuando el video termine, llamar onFinish
      onFinish && onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={true}
        isLooping={false}
        isMuted={true}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Blanco puro para coincidir con el video
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width * 0.9, // 90% del ancho de la pantalla para mejor visibilidad
    height: height * 0.5, // 50% de la altura de la pantalla
    maxWidth: 400, // Máximo ancho aumentado para mejor visualización
    maxHeight: 300, // Máximo alto aumentado para mejor visualización
  },
});
