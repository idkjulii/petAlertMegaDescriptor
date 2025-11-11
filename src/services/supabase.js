import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import apiService from './api';

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

// Verificar que tenemos las credenciales necesarias
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase URL y API Key son requeridos');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  // Asegurar que los headers se envíen correctamente
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
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

  // Ensure a profile exists for a user, creating it if necessary
  ensureProfile: async (userId, userData = {}) => {
    try {
      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile exists, return it
      if (existingProfile && !fetchError) {
        return { data: existingProfile, error: null };
      }

      // If profile doesn't exist, create it
      // Get user data from auth if available
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      const profileData = {
        id: userId,
        full_name: userData.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Usuario',
        avatar_url: userData.avatar_url || null,
        phone: userData.phone || null,
        location: userData.location || null,
      };

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        // If insert fails, it might be because profile was created between check and insert
        // Try fetching again
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (retryProfile && !retryError) {
          return { data: retryProfile, error: null };
        }
        throw insertError;
      }

      return { data: newProfile, error: null };
    } catch (error) {
      console.error('Error ensuring profile:', error);
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

// Función auxiliar para hacer llamadas RPC con headers explícitos
const rpcCall = async (functionName, params = {}) => {
  try {
    // Obtener la sesión actual para incluir el token de autenticación si existe
    const { data: { session } } = await supabase.auth.getSession();
    
    // Hacer la llamada RPC con el cliente configurado
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(
        `❌ Error en RPC ${functionName}:`,
        error,
        'params:',
        JSON.stringify(params),
        'session:',
        session?.user?.id || '(sin sesión)'
      );
      // Si el error es por falta de API key, intentar con fetch directo
      if (error.message && error.message.includes('API key')) {
        console.warn('⚠️ Intentando llamada RPC directa con fetch...');
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': session ? `Bearer ${session.access_token}` : `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return { data, error: null };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Error en rpcCall para ${functionName}:`, error);
    return { data: null, error };
  }
};

const reportService = {
  createReport: async (reportData) => {
    try {
      // Ensure profile exists before creating report
      if (reportData.reporter_id) {
        const { error: profileError } = await profileService.ensureProfile(reportData.reporter_id);
        if (profileError) {
          console.error('Error ensuring profile:', profileError);
          // Continue anyway, but log the error
        }
      }

      // IMPORTANTE: Usar el endpoint del backend para que genere embeddings automáticamente
      // Si el backend no está disponible, fallback a Supabase directo
      try {
        console.log('📤 Creando reporte a través del backend (generación automática de embeddings)...');
        const backendResult = await apiService.createReport(reportData);
        
        if (backendResult.error) {
          throw backendResult.error;
        }
        
        if (backendResult.data?.report) {
          console.log('✅ Reporte creado a través del backend. Embeddings se generarán automáticamente.');
          return { data: backendResult.data.report, error: null };
        }
        
        // Si el formato de respuesta es diferente, intentar con Supabase directo
        throw new Error('Formato de respuesta inesperado del backend');
        
      } catch (backendError) {
        console.warn('⚠️ Backend no disponible, creando reporte directamente en Supabase:', backendError.message);
        console.warn('   Los embeddings NO se generarán automáticamente.');
        
        // Fallback: crear directamente en Supabase
        const { data, error } = await supabase
          .from('reports')
          .insert([reportData])
          .select()
          .single();
        
        if (error) throw error;

        return { data, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  requestMatchesAnalysis: async (reportId) => {
    try {
      const result = await apiService.sendReportToN8n(reportId);
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getMatchesForReport: async (reportId) => {
    try {
      const result = await apiService.getMatchesForReport(reportId);
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getReportById: async (reportId) => {
    try {
      const { data, error } = await rpcCall('get_report_by_id_with_coords', { report_id: reportId });
      
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
      const { data, error } = await rpcCall('get_user_reports_with_coords', { user_id: userId });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getAllReports: async () => {
    try {
      const { data, error } = await rpcCall('get_reports_with_coords');
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getReportsSimple: async () => {
    try {
      console.log('🔄 Obteniendo todos los reportes activos...');
      const { data, error } = await rpcCall('get_reports_with_coords');
      
      if (error) {
        console.error('❌ Error obteniendo reportes:', error);
        throw error;
      }
      
      console.log(`✅ Obtenidos ${data?.length || 0} reportes activos`);
      if (data && data.length > 0) {
        console.log('📍 Primeras coordenadas:', {
          id: data[0].id,
          latitude: data[0].latitude,
          longitude: data[0].longitude
        });
      }
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Error en getReportsSimple:', error);
      return { data: null, error };
    }
  },

  getNearbyReports: async (latitude, longitude, radiusMeters = 5000) => {
    try {
      const { data: rpcData, error: rpcError } = await rpcCall('nearby_reports', {
        lat: latitude,
        lng: longitude,
        radius_meters: radiusMeters,
      });
      
      if (rpcError) {
        console.warn('⚠️ RPC nearby_reports falló, usando método alternativo:', rpcError.message);
        const { data: allReports, error: allError } = await rpcCall('get_reports_with_coords');
        
        if (allError) throw allError;
        
        const nearbyReports = allReports
          .filter(report => {
            if (!report.latitude || !report.longitude) return false;
            
            const distance = calculateDistance(
              latitude, 
              longitude, 
              report.latitude, 
              report.longitude
            );
            
            report.distance_meters = distance;
            return distance <= radiusMeters;
          })
          .sort((a, b) => a.distance_meters - b.distance_meters);
        
        console.log(`✅ Filtrados ${nearbyReports.length} reportes cercanos (método local)`);
        return { data: nearbyReports, error: null };
      }
      
      const reportIds = rpcData.map(r => r.id);
      const { data: fullReports, error: reportsError } = await rpcCall('get_reports_with_coords');
      
      if (reportsError) throw reportsError;
      
      const filtered = fullReports.filter(report => reportIds.includes(report.id));
      const reportsWithDistance = filtered.map(report => {
        const distanceData = rpcData.find(d => d.id === report.id);
        return {
          ...report,
          distance_meters: distanceData?.distance_meters || 0,
        };
      });
      
      return { data: reportsWithDistance, error: null };
    } catch (error) {
      console.error('❌ Error en getNearbyReports:', error);
      return { data: null, error };
    }
  },

  updateReport: async (reportId, updates) => {
    try {
      // Usar el endpoint del backend para que genere embeddings automáticamente si hay fotos nuevas
      try {
        console.log('📤 Actualizando reporte a través del backend (generación automática de embeddings)...');
        const backendResult = await apiService.updateReport(reportId, updates);
        
        if (backendResult.error) {
          throw backendResult.error;
        }
        
        if (backendResult.data?.report) {
          console.log('✅ Reporte actualizado a través del backend. Embeddings se generarán automáticamente si hay fotos nuevas.');
          return { data: backendResult.data.report, error: null };
        }
        
        throw new Error('Formato de respuesta inesperado del backend');
        
      } catch (backendError) {
        console.warn('⚠️ Backend no disponible, actualizando reporte directamente en Supabase:', backendError.message);
        
        // Fallback: actualizar directamente en Supabase
        const { data, error } = await supabase
          .from('reports')
          .update(updates)
          .eq('id', reportId)
          .select()
          .single();
        
        if (error) throw error;
        
        return { data, error: null };
      }
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

  deleteReport: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'cancelled',
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
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('report_id', reportId)
        .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            report_id: reportId,
            participant_1: participant1,
            participant_2: participant2,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserConversations: async (userId) => {
    try {
      const { data, error } = await rpcCall('get_user_conversations', {
        p_user_id: userId,
      });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getConversationById: async (conversationId, userId) => {
    try {
      const { data, error } = await rpcCall('get_conversation_detail', {
        p_conversation_id: conversationId,
        p_user_id: userId,
      });

      if (error) throw error;

      const conversation = Array.isArray(data) ? data[0] : data;
      return { data: conversation || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  sendMessage: async (conversationId, senderId, content, imageUrl = null) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getMessages: async (conversationId, { limit = 50, cursor = null } = {}) => {
    try {
      const { data, error } = await rpcCall('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_limit: limit,
        p_cursor: cursor,
      });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  markConversationAsRead: async (conversationId, userId) => {
    try {
      const { data, error } = await rpcCall('mark_conversation_messages_read', {
        p_conversation_id: conversationId,
        p_user_id: userId,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  subscribeToMessages: (conversationId, { onInsert, onUpdate } = {}) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onInsert?.(payload.new, payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onUpdate?.(payload.new, payload);
        }
      )
      .subscribe();

    return channel;
  },

  subscribeToConversations: (userId, callback) => {
    if (!userId) return null;

    const channel = supabase
      .channel(`conversations:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const participants = [
            payload.new?.participant_1,
            payload.new?.participant_2,
            payload.old?.participant_1,
            payload.old?.participant_2,
          ].filter(Boolean);

          if (participants.includes(userId)) {
            callback?.(payload);
          }
        }
      )
      .subscribe();

    return channel;
  },

  removeChannel: (channel) => {
    if (!channel) return;
    supabase.removeChannel(channel);
  },
};

const notificationService = {
  registerToken: async ({ userId, expoPushToken, platform, deviceId }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const sessionUserId = session?.user?.id;

      if (!sessionUserId) {
        console.info('[notificationService] Registro de push omitido: sin usuario autenticado.');
        return { data: null, error: null };
      }

      if (userId && userId !== sessionUserId) {
        console.warn(
          '[notificationService] userId provisto no coincide con la sesión actual. Se usará auth.uid().'
        );
      }

      const { data, error } = await rpcCall('register_push_token', {
        p_user_id: sessionUserId,
        p_expo_token: expoPushToken,
        p_platform: platform,
        p_device_id: deviceId || null,
      });

      if (error) throw error;

      const tokenData = Array.isArray(data) ? data[0] : data;
      return { data: tokenData, error: null };
    } catch (error) {
      if (error?.message === 'No hay un usuario autenticado') {
        console.info('[notificationService] Registro de push abortado: sesión inexistente.');
        return { data: null, error: null };
      }
      console.error('Error registrando push token:', error);
      return { data: null, error };
    }
  },

  getUserTokens: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  removeTokenById: async (tokenId) => {
    try {
      const { error } = await supabase.from('push_tokens').delete().eq('id', tokenId);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  removeTokenValue: async (userId, expoPushToken) => {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .match({
          user_id: userId,
          expo_token: expoPushToken,
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

export {
  authService, messageService, notificationService, petService, profileService, reportService, supabase
};

