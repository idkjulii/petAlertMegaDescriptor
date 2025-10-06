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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const authService = {
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

export const profileService = {
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

export const petService = {
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

export const reportService = {
  createReport: async (reportData) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getReportById: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(id, full_name, phone, avatar_url),
          pet:pets(*)
        `)
        .eq('id', reportId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserReports: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getNearbyReports: async (latitude, longitude, radiusMeters = 5000) => {
    try {
      const { data, error } = await supabase
        .rpc('nearby_reports', {
          lat: latitude,
          lng: longitude,
          radius_meters: radiusMeters,
        });
      
      if (error) throw error;
      
      const reportIds = data.map(r => r.id);
      const { data: fullReports, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(id, full_name, avatar_url)
        `)
        .in('id', reportIds);
      
      if (reportsError) throw reportsError;
      
      const reportsWithDistance = fullReports.map(report => {
        const distanceData = data.find(d => d.id === report.id);
        return {
          ...report,
          distance_meters: distanceData?.distance_meters || 0,
        };
      });
      
      return { data: reportsWithDistance, error: null };
    } catch (error) {
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

export const messageService = {
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