/**
 * Configuración de red para desarrollo
 * Cambia estas IPs según tu configuración de red local
 */

// IP de tu computadora en la red local
// Para encontrar tu IP: ejecuta 'ipconfig' en Windows o 'ifconfig' en Mac/Linux
export const NETWORK_CONFIG = {
  // Cambia esta IP por la IP de tu computadora
  BACKEND_IP: '192.168.0.204',
  
  // Puertos del backend
  BACKEND_PORT: 8003,
  
  // URLs completas
  get BACKEND_URL() {
    return `http://${this.BACKEND_IP}:${this.BACKEND_PORT}`;
  },
  
  get EMBEDDINGS_URL() {
    return `${this.BACKEND_URL}/embeddings`;
  }
};

// Función para obtener la IP automáticamente (solo para desarrollo web)
export const getLocalIP = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return hostname;
    }
  }
  return NETWORK_CONFIG.BACKEND_IP;
};
