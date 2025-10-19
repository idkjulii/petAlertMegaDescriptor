
import { buildUrl } from '../config/backend.js';

/**
 * Servicio de búsqueda con IA para encontrar mascotas
 */
const aiSearchService = {
  /**
   * Analiza una imagen con Google Vision API
   * @param {string} imageUri - URI de la imagen
   * @returns {Promise<Object>} Resultado del análisis
   */
  analyzeImage: async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "search.jpg",
      });

      const response = await fetch(buildUrl('ANALYZE_IMAGE'), {
        method: "POST",
        body: formData,
        // No especificar Content-Type para FormData en React Native
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error analizando imagen:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Genera una descripción automática de la imagen
   * @param {string} imageUri - URI de la imagen
   * @returns {Promise<Object>} Descripción generada
   */
  generateCaption: async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "caption.jpg",
      });

      const response = await fetch(buildUrl('CAPTION'), {
        method: "POST",
        body: formData,
        // No especificar Content-Type para FormData en React Native
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error generando caption:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Busca coincidencias usando IA
   * @param {Object} searchParams - Parámetros de búsqueda
   * @returns {Promise<Object>} Resultados de la búsqueda
   */
  searchMatches: async (searchParams) => {
    try {
      const {
        imageUri,
        userLatitude,
        userLongitude,
        radiusKm = 10,
        searchType = 'both', // 'lost', 'found', 'both'
        analysisData = null
      } = searchParams;

      // Si no tenemos análisis previo, analizamos la imagen
      let analysis = analysisData;
      if (!analysis) {
        const analysisResult = await aiSearchService.analyzeImage(imageUri);
        if (!analysisResult.success) {
          throw new Error(analysisResult.error);
        }
        analysis = analysisResult.data;
      }

      // Preparar datos para la búsqueda
      const searchData = new FormData();
      searchData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "search.jpg",
      });
      searchData.append("user_lat", userLatitude.toString());
      searchData.append("user_lng", userLongitude.toString());
      searchData.append("radius_km", radiusKm.toString());
      searchData.append("search_type", searchType);

      const response = await fetch(buildUrl('AI_SEARCH'), {
        method: "POST",
        body: searchData,
        // No especificar Content-Type para FormData en React Native
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          analysis: analysis,
          matches: data.matches || [],
          searchMetadata: data.search_metadata || {},
          totalResults: data.matches ? data.matches.length : 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error en búsqueda IA:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Busca matches automáticos para un reporte específico
   * @param {string} reportId - ID del reporte
   * @param {number} radiusKm - Radio de búsqueda en km
   * @param {number} topK - Número máximo de resultados
   * @returns {Promise<Object>} Resultados del auto-match
   */
  getAutoMatches: async (reportId, radiusKm = 10, topK = 5) => {
    try {
      const response = await fetch(
        `${buildUrl('AUTO_MATCH')}?report_id=${reportId}&radius_km=${radiusKm}&top_k=${topK}`,
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error obteniendo auto-matches:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Guarda etiquetas de IA para un reporte
   * @param {string} reportId - ID del reporte
   * @param {Object} labelsData - Datos de etiquetas
   * @returns {Promise<Object>} Resultado de la operación
   */
  saveReportLabels: async (reportId, labelsData) => {
    try {
      const response = await fetch(buildUrl('SAVE_LABELS', { report_id: reportId }), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labelsData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error guardando etiquetas:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Verifica el estado del backend
   * @returns {Promise<Object>} Estado del backend
   */
  checkBackendStatus: async () => {
    try {
      const response = await fetch(buildUrl('HEALTH'), {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Error verificando estado del backend:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Calcula similitud entre dos conjuntos de etiquetas
   * @param {Array} labels1 - Primer conjunto de etiquetas
   * @param {Array} labels2 - Segundo conjunto de etiquetas
   * @returns {number} Puntuación de similitud (0-100)
   */
  calculateLabelSimilarity: (labels1, labels2) => {
    if (!labels1 || !labels2 || labels1.length === 0 || labels2.length === 0) {
      return 0;
    }

    const set1 = new Set(labels1.map(label => 
      typeof label === 'string' ? label.toLowerCase() : label.label?.toLowerCase()
    ));
    const set2 = new Set(labels2.map(label => 
      typeof label === 'string' ? label.toLowerCase() : label.label?.toLowerCase()
    ));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return Math.round((intersection.size / union.size) * 100);
  },

  /**
   * Calcula similitud de colores
   * @param {Array} colors1 - Primer conjunto de colores
   * @param {Array} colors2 - Segundo conjunto de colores
   * @returns {number} Puntuación de similitud (0-100)
   */
  calculateColorSimilarity: (colors1, colors2) => {
    if (!colors1 || !colors2 || colors1.length === 0 || colors2.length === 0) {
      return 0;
    }

    // Convertir colores hex a RGB y calcular similitud
    const rgb1 = colors1.map(color => hexToRgb(color));
    const rgb2 = colors2.map(color => hexToRgb(color));

    let maxSimilarity = 0;
    
    for (const c1 of rgb1) {
      for (const c2 of rgb2) {
        if (c1 && c2) {
          const similarity = calculateColorDistance(c1, c2);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
    }

    return Math.round(maxSimilarity);
  }
};

/**
 * Convierte color hex a RGB
 * @param {string} hex - Color en formato hex
 * @returns {Object|null} Objeto con r, g, b
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcula distancia entre dos colores RGB
 * @param {Object} color1 - Primer color RGB
 * @param {Object} color2 - Segundo color RGB
 * @returns {number} Similitud (0-100)
 */
function calculateColorDistance(color1, color2) {
  const rDiff = Math.abs(color1.r - color2.r);
  const gDiff = Math.abs(color1.g - color2.g);
  const bDiff = Math.abs(color1.b - color2.b);
  
  const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  const maxDistance = Math.sqrt(255 * 255 * 3);
  
  return Math.round((1 - distance / maxDistance) * 100);
}

export default aiSearchService;
