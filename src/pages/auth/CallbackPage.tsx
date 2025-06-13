import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuthStore } from '../../state/authStore';

export function CallbackPage() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=auth_failed');
          return;
        }

        if (data.session) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // User profile doesn't exist - trigger progressive signup
            const progressiveError = new Error('Progressive signup required') as any;
            progressiveError.type = 'progressive_signup_required';
            progressiveError.email = data.session.user.email;
            progressiveError.provider = data.session.user.app_metadata.provider || 'google';
            progressiveError.needsUsername = true;
            progressiveError.needsFullName = false;
            
            // Store the session temporarily and redirect to handle progressive signup
            navigate('/?progressive_signup=true');
            return;
          }

          // Profile exists, complete sign in
          await fetchProfile();
          navigate('/dashboard');
        } else {
          navigate('/?error=no_session');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        navigate('/?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate, fetchProfile]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted">Completing sign in...</p>
      </div>
    </div>
  );
}

export default CallbackPage;