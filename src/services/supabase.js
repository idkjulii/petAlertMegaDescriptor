import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eamsbroadstwkrkjcuvo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbXNicm9hZHN0d2tya2pjdXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjQ3ODgsImV4cCI6MjA3NTMwMDc4OH0.bzFaxK25SPMKE5REMxRyK9jPj1n8ocDrn_u6qyMTXEw';

// Validar configuración
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Las credenciales de Supabase no están configuradas correctamente');
  console.error('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.error('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
}

console.log('🔧 Configuración de Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'No configurada');

const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const authService = {
  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

const profileService = {
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateLocation: async (userId, latitude, longitude) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          location: `POINT(${longitude} ${latitude})`,
        })
        .eq('id', userId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

const petService = {
  getUserPets: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getPetById: async (petId) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  createPet: async (petData) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([petData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updatePet: async (petId, updates) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  deletePet: async (petId) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  markAsLost: async (petId, isLost = true) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ is_lost: isLost })
        .eq('id', petId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Función auxiliar para calcular distancia entre dos puntos
// Función para extraer coordenadas de diferentes formatos de location
const extractCoordinatesFromLocation = (locationData) => {
  if (!locationData) {
    return null;
  }
  
  // Formato PostGIS: "SRID=4326;POINT(lon lat)"
  if (typeof locationData === 'string' && locationData.includes('POINT(')) {
    try {
      const coordsStr = locationData.split('POINT(')[1].split(')')[0];
      const [longitude, latitude] = coordsStr.split(' ').map(parseFloat);
      return { latitude, longitude };
    } catch (error) {
      console.warn('Error parsing PostGIS POINT:', error);
      return null;
    }
  }
  
  // Formato GeoJSON: {"type":"Point","coordinates":[lon,lat]}
  if (typeof locationData === 'object' && locationData.type === 'Point' && locationData.coordinates) {
    try {
      const [longitude, latitude] = locationData.coordinates;
      return { latitude, longitude };
    } catch (error) {
      console.warn('Error parsing GeoJSON Point:', error);
      return null;
    }
  }
  
  // Si ya tiene latitude y longitude directamente
  if (typeof locationData === 'object' && locationData.latitude && locationData.longitude) {
    return {
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude)
    };
  }
  
  console.warn('Formato de location no reconocido:', locationData);
  return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const reportService = {
  createReport: async (reportData) => {
    try {
      console.log('📝 Creando reporte con datos:', {
        type: reportData.type,
        pet_name: reportData.pet_name,
        species: reportData.species,
        location: reportData.location,
        reporter_id: reportData.reporter_id
      });
      
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creando reporte:', error);
        throw error;
      }
      
      console.log('✅ Reporte creado exitosamente:', {
        id: data.id,
        type: data.type,
        pet_name: data.pet_name,
        created_at: data.created_at
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error en createReport:', error);
      return { data: null, error };
    }
  },

  getReportById: async (reportId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_report_by_id_with_coords', { report_id: reportId });
      
      if (error) throw error;
      
      // La función RPC devuelve un array, pero solo queremos el primer elemento
      const report = data && data.length > 0 ? data[0] : null;
      
      if (!report) {
        return { data: null, error: { message: 'Reporte no encontrado' } };
      }
      
      return { data: report, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserReports: async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_reports_with_coords', { user_id: userId });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getAllReports: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_reports_with_coords');
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getReportsSimple: async () => {
    try {
      console.log('🔄 Obteniendo todos los reportes activos directamente...');
      
      // Consultar directamente la tabla reports sin usar RPC
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error obteniendo reportes:', error);
        throw error;
      }
      
      // Procesar los reportes para extraer coordenadas
      const processedReports = data?.map(report => {
        const coords = extractCoordinatesFromLocation(report.location);
        return {
          ...report,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          hasValidCoords: !!(coords?.latitude && coords?.longitude)
        };
      }) || [];
      
      console.log(`✅ Obtenidos ${processedReports.length} reportes activos`);
      if (processedReports.length > 0) {
        console.log('📍 Primeras coordenadas:', {
          id: processedReports[0].id,
          type: processedReports[0].type,
          pet_name: processedReports[0].pet_name,
          latitude: processedReports[0].latitude,
          longitude: processedReports[0].longitude,
          hasValidCoords: processedReports[0].hasValidCoords,
          location: processedReports[0].location
        });
      } else {
        console.log('⚠️ No se encontraron reportes en la base de datos');
      }
      return { data: processedReports, error: null };
    } catch (error) {
      console.error('❌ Error en getReportsSimple:', error);
      return { data: null, error };
    }
  },

  getNearbyReports: async (latitude, longitude, radiusMeters = 5000) => {
    try {
      console.log(`🔍 Buscando reportes cercanos a ${latitude}, ${longitude} en radio de ${radiusMeters}m`);
      
      // Consultar directamente la tabla reports
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error obteniendo reportes:', error);
        throw error;
      }
      
      // Procesar y filtrar reportes por distancia
      const nearbyReports = data
        ?.map(report => {
          const coords = extractCoordinatesFromLocation(report.location);
          if (!coords) return null;
          
          const distance = calculateDistance(
            latitude,
            longitude,
            coords.latitude,
            coords.longitude
          );
          
          return {
            ...report,
            latitude: coords.latitude,
            longitude: coords.longitude,
            distance_meters: distance,
            hasValidCoords: true
          };
        })
        .filter(report => report && report.distance_meters <= radiusMeters)
        .sort((a, b) => a.distance_meters - b.distance_meters) || [];
      
      console.log(`✅ Encontrados ${nearbyReports.length} reportes cercanos`);
      return { data: nearbyReports, error: null };
    } catch (error) {
      console.error('❌ Error en getNearbyReports:', error);
      return { data: null, error };
    }
  },

  updateReport: async (reportId, updates) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  resolveReport: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

const messageService = {
  getOrCreateConversation: async (reportId, participant1, participant2) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('report_id', reportId)
        .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
        .single();
      
      if (existing) {
        return { data: existing, error: null };
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          report_id: reportId,
          participant_1: participant1,
          participant_2: participant2,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  sendMessage: async (conversationId, senderId, content, imageUrl = null) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          image_url: imageUrl,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getMessages: async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  subscribeToMessages: (conversationId, callback) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  },
};

export {
    authService, messageService, petService, profileService, reportService, supabase
};
