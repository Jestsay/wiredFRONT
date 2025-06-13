import { create } from 'zustand';
import { supabase } from '../api/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  profile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;
}

interface ProgressiveSignupData {
  email: string;
  provider: string;
  username?: string;
  fullName?: string;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeProgressiveSignup: (data: ProgressiveSignupData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  profile: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Enhanced error handling for sign in
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        }
        
        throw new Error(errorMessage);
      }

      set({ 
        user: data.user, 
        session: data.session, 
        loading: false 
      });

      // Fetch user profile
      await get().fetchProfile();
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed. Please try again.' 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    
    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (username.length < 2) {
        throw new Error('Username must be at least 2 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (error) {
        // Enhanced error handling for sign up
        let errorMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = 'Account creation is temporarily disabled. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        // Create user profile with better error handling
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here - user account was created successfully
            // Profile can be created later
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Continue - user account was created successfully
        }
      }

      set({ 
        user: data.user, 
        session: data.session, 
        loading: false 
      });

      // Try to fetch user profile
      try {
        await get().fetchProfile();
      } catch (profileError) {
        console.error('Profile fetch failed:', profileError);
        // Continue - user is signed up successfully
      }
    } catch (error) {
      console.error('Sign up error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Account creation failed. Please try again.' 
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('OAuth')) {
          errorMessage = 'Google sign-in is temporarily unavailable. Please try email/password instead.';
        }
        
        throw new Error(errorMessage);
      }

      // Note: The actual sign-in completion happens in the callback
      set({ loading: false });
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // Check if this is a new user that needs progressive signup
      if (error instanceof Error && error.message.includes('user_not_found')) {
        const progressiveError = new Error('Progressive signup required') as any;
        progressiveError.type = 'progressive_signup_required';
        progressiveError.email = 'user@example.com';
        progressiveError.provider = 'google';
        progressiveError.needsUsername = true;
        progressiveError.needsFullName = false;
        
        set({ loading: false });
        throw progressiveError;
      }
      
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Google sign in failed. Please try again.' 
      });
      throw error;
    }
  },

  completeProgressiveSignup: async (data: ProgressiveSignupData) => {
    set({ loading: true, error: null });
    
    try {
      // Validate progressive signup data
      if (!data.email || !data.provider) {
        throw new Error('Invalid signup data');
      }

      if (data.username && data.username.length < 2) {
        throw new Error('Username must be at least 2 characters long');
      }

      // For now, simulate the completion
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36), // Temporary password for OAuth users
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
            provider: data.provider,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (authData.user) {
        // Create user profile with progressive signup data
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              username: data.username,
            });

          if (profileError) {
            console.error('Progressive profile creation error:', profileError);
            // Continue - user account was created
          }
        } catch (profileError) {
          console.error('Progressive profile creation failed:', profileError);
          // Continue - user account was created
        }
      }

      set({ 
        user: authData.user, 
        session: authData.session, 
        loading: false 
      });

      // Fetch user profile
      try {
        await get().fetchProfile();
      } catch (profileError) {
        console.error('Progressive profile fetch failed:', profileError);
        // Continue - user is signed up
      }
    } catch (error) {
      console.error('Progressive signup error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Account setup failed. Please try again.' 
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }

      set({ 
        user: null, 
        session: null, 
        profile: null, 
        loading: false 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign out failed. Please try again.' 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
            });
          
          if (createError) {
            console.error('Profile creation error:', createError);
            return;
          }
          
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!fetchError && newProfile) {
            set({ profile: newProfile });
          }
        } else {
          console.error('Profile fetch error:', error);
        }
        return;
      }

      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      set({ profile: data, loading: false });
    } catch (error) {
      console.error('Profile update error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Profile update failed. Please try again.' 
      });
    }
  },
}));

// Initialize auth state with enhanced error handling
supabase.auth.onAuthStateChange(async (event, session) => {
  const { fetchProfile } = useAuthStore.getState();
  
  try {
    if (event === 'SIGNED_IN' && session) {
      useAuthStore.setState({ 
        user: session.user, 
        session,
        error: null 
      });
      await fetchProfile();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        session: null, 
        profile: null,
        error: null 
      });
    }
  } catch (error) {
    console.error('Auth state change error:', error);
  }
});

// Check for existing session with error handling
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Session check error:', error);
    return;
  }
  
  if (session) {
    useAuthStore.setState({ 
      user: session.user, 
      session,
      error: null 
    });
    useAuthStore.getState().fetchProfile();
  }
});