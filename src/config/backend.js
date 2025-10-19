/**
 * Configuración del backend
 */

// URL base del backend
const BACKEND_URL = 'http://127.0.0.1:8003';

// Endpoints disponibles
const ENDPOINTS = {
  HEALTH: '/health',
  AI_SEARCH: '/ai-search',
  AI_SEARCH_HEALTH: '/ai-search/health',
  ANALYZE_IMAGE: '/analyze_image',
  CAPTION: '/caption',
  AUTO_MATCH: '/reports/auto-match',
  SAVE_LABELS: '/reports/{report_id}/labels'
};

/**
 * Construye la URL completa para un endpoint
 * @param {string} endpoint - Nombre del endpoint
 * @param {Object} params - Parámetros para reemplazar en la URL
 * @returns {string} URL completa
 */
const buildUrl = (endpoint, params = {}) => {
  let url = `${BACKEND_URL}${ENDPOINTS[endpoint]}`;
  
  // Sufstituir parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  
  return url;
};

export {
    BACKEND_URL,
    ENDPOINTS,
    buildUrl
};

