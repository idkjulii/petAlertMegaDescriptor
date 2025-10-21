/**
 * Servicio de API para comunicarse con el backend
 */
import { BACKEND_URL, ENDPOINTS, buildUrl } from '../config/backend';

class ApiService {
  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  /**
   * Realiza una petición HTTP
   */
  async request(endpoint, options = {}) {
    const url = typeof endpoint === 'string' ? endpoint : buildUrl(endpoint.endpoint, endpoint.params);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      console.log(`🌐 API Request: ${finalOptions.method || 'GET'} ${url}`);
      
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${url}`, data);
      
      return { data, error: null };
    } catch (error) {
      console.error(`❌ API Error: ${url}`, error);
      return { data: null, error };
    }
  }

  /**
   * Verifica el estado del backend
   */
  async health() {
    return this.request(ENDPOINTS.HEALTH);
  }

  /**
   * Obtiene información de la versión
   */
  async version() {
    return this.request(ENDPOINTS.VERSION);
  }

  /**
   * Verifica el estado de Supabase
   */
  async supabaseStatus() {
    return this.request(ENDPOINTS.SUPABASE_STATUS);
  }

  /**
   * Obtiene todos los reportes
   */
  async getAllReports() {
    return this.request(ENDPOINTS.REPORTS);
  }

  /**
   * Obtiene reportes cercanos
   */
  async getNearbyReports(latitude, longitude, radiusKm = 10) {
    const url = `${buildUrl(ENDPOINTS.REPORTS_NEARBY)}?lat=${latitude}&lng=${longitude}&radius_km=${radiusKm}`;
    return this.request(url);
  }

  /**
   * Obtiene un reporte por ID
   */
  async getReportById(reportId) {
    return this.request({
      endpoint: ENDPOINTS.REPORTS_BY_ID,
      params: { report_id: reportId }
    });
  }

  /**
   * Crea un nuevo reporte
   */
  async createReport(reportData) {
    return this.request(ENDPOINTS.REPORTS, {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  /**
   * Actualiza un reporte
   */
  async updateReport(reportId, updates) {
    return this.request({
      endpoint: ENDPOINTS.REPORTS_BY_ID,
      params: { report_id: reportId }
    }, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Resuelve un reporte
   */
  async resolveReport(reportId) {
    return this.request({
      endpoint: ENDPOINTS.REPORTS_RESOLVE,
      params: { report_id: reportId }
    }, {
      method: 'POST'
    });
  }

  /**
   * Auto-matching de reportes
   */
  async autoMatch(reportId, radiusKm = 10, topK = 5) {
    const url = `${buildUrl(ENDPOINTS.AUTO_MATCH)}?report_id=${reportId}&radius_km=${radiusKm}&top_k=${topK}`;
    return this.request(url);
  }

  /**
   * Guarda etiquetas de un reporte
   */
  async saveLabels(reportId, labels) {
    return this.request({
      endpoint: ENDPOINTS.SAVE_LABELS,
      params: { report_id: reportId }
    }, {
      method: 'POST',
      body: JSON.stringify({ labels })
    });
  }
}

// Crear instancia singleton
const apiService = new ApiService();

export default apiService;
