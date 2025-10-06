import { create } from 'zustand';
import { authService } from '../services/supabase';

export const useAuthStore = create((set, get) => ({
  // Estado inicial
  user: null,
  session: null,
  loading: false,
  initialized: false,

  // Actions para actualizar estado
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  // Función de login
  login: async (email, password) => {
    try {
      set({ loading: true });
      
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        set({ loading: false });
        return { success: false, error };
      }

      // Actualizar estado con datos del usuario y sesión
      set({
        user: data.user,
        session: data.session,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Función de logout
  logout: async () => {
    try {
      set({ loading: true });
      
      const { error } = await authService.signOut();
      
      if (error) {
        set({ loading: false });
        return { success: false, error };
      }

      // Limpiar estado
      set({
        user: null,
        session: null,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Función de registro
  signUp: async (email, password, fullName) => {
    try {
      set({ loading: true });
      
      const { data, error } = await authService.signUp(email, password, fullName);
      
      set({ loading: false });
      
      if (error) {
        return { success: false, error };
      }

      // En registro, no establecemos sesión inmediatamente
      // El usuario debe verificar su email primero
      return { success: true, data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Función de inicialización para verificar sesión existente
  initialize: async () => {
    try {
      set({ loading: true });
      
      const { session, error: sessionError } = await authService.getSession();
      
      if (sessionError) {
        set({ loading: false, initialized: true });
        return { success: false, error: sessionError };
      }

      if (session?.user) {
        const { user, error: userError } = await authService.getCurrentUser();
        
        if (userError) {
          set({ loading: false, initialized: true });
          return { success: false, error: userError };
        }

        set({
          user: user,
          session: session,
          loading: false,
          initialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      return { success: true };
    } catch (error) {
      set({ loading: false, initialized: true });
      return { success: false, error };
    }
  },

  // Función para refrescar datos del usuario
  refreshUser: async () => {
    try {
      const { user, error } = await authService.getCurrentUser();
      
      if (error) {
        return { success: false, error };
      }

      set({ user });
      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Función para actualizar perfil del usuario
  updateProfile: async (updates) => {
    try {
      const { user } = get();
      
      if (!user) {
        return { success: false, error: new Error('Usuario no autenticado') };
      }

      // Aquí podrías llamar a profileService.updateProfile si lo tienes
      // Por ahora solo actualizamos el estado local
      set({ user: { ...user, ...updates } });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Función para verificar si el usuario está autenticado
  isAuthenticated: () => {
    const { user, session } = get();
    return !!(user && session);
  },

  // Función para obtener el ID del usuario
  getUserId: () => {
    const { user } = get();
    return user?.id || null;
  },

  // Función para limpiar el estado (útil para errores)
  clearAuth: () => {
    set({
      user: null,
      session: null,
      loading: false,
    });
  },

  // Suscribirse a cambios de autenticación
  subscribeToAuthChanges: () => {
    return authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        set({
          user: session?.user || null,
          session: session,
        });
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          session: null,
        });
      } else if (event === 'TOKEN_REFRESHED') {
        set({
          session: session,
        });
      }
    });
  },
}));

