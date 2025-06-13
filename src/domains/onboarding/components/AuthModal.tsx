import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Dialog } from '../../../components/ui/Dialog';
import { useAuthStore } from '../../../state/authStore';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ open, onClose, defaultMode = 'register' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.username);
      }
      onClose();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    clearError();
    setFormData({ email: '', password: '', username: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} className="wf-glass-frosted">
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'var(--space-xl)' 
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'var(--wf-gradient-primary)',
            borderRadius: '1rem',
            margin: '0 auto var(--space-lg) auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="wf-animate-glow-subtle">
            <User style={{ 
              width: '2rem', 
              height: '2rem', 
              color: 'white' 
            }} />
          </div>
          
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            background: 'var(--wf-text-gradient-animated)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 'var(--space-sm)'
          }}>
            {mode === 'login' ? 'Welcome Back' : 'Join WiredFront'}
          </h2>
          
          <p style={{
            color: 'var(--color-muted)',
            fontSize: 'var(--text-sm)'
          }}>
            {mode === 'login' 
              ? 'Sign in to continue your development journey' 
              : 'Start building production-ready apps today'
            }
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '0.5rem',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
            color: 'var(--color-error)',
            fontSize: 'var(--text-sm)'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)'
        }}>
          {/* Username Field (Register Only) */}
          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-sm)'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: 'var(--space-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 'var(--text-lg)',
                  height: 'var(--text-lg)',
                  color: 'var(--color-muted)'
                }} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--space-md) var(--space-md) var(--space-md) 3rem',
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-base)',
                    backdropFilter: 'var(--input-backdrop)',
                    transition: 'all var(--transition-base) ease'
                  }}
                  placeholder="Choose a username"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                    e.target.style.boxShadow = 'var(--input-focus-shadow)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-sm)'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: 'var(--space-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'var(--text-lg)',
                height: 'var(--text-lg)',
                color: 'var(--color-muted)'
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-md) var(--space-md) var(--space-md) 3rem',
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: '0.75rem',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-base)',
                  backdropFilter: 'var(--input-backdrop)',
                  transition: 'all var(--transition-base) ease'
                }}
                placeholder="Enter your email"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = 'var(--input-focus-shadow)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-sm)'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: 'var(--space-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'var(--text-lg)',
                height: 'var(--text-lg)',
                color: 'var(--color-muted)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-md) 3rem var(--space-md) 3rem',
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: '0.75rem',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-base)',
                  backdropFilter: 'var(--input-backdrop)',
                  transition: 'all var(--transition-base) ease'
                }}
                placeholder="Enter your password"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = 'var(--input-focus-shadow)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--space-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 'var(--space-xs)',
                  borderRadius: '0.25rem',
                  transition: 'color var(--transition-base) ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-muted)';
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: 'var(--text-lg)', height: 'var(--text-lg)' }} />
                ) : (
                  <Eye style={{ width: 'var(--text-lg)', height: 'var(--text-lg)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="wf-btn wf-btn-primary wf-interactive wf-focus-ring"
            style={{
              width: '100%',
              padding: 'var(--space-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%'
                }} className="wf-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            margin: 'var(--space-md) 0'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)'
            }} />
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-muted)'
            }}>
              or
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)'
            }} />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="wf-btn wf-btn-glass wf-interactive wf-focus-ring"
            style={{
              width: '100%',
              padding: 'var(--space-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Mode Switch */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)'
          }}>
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              type="button"
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'color var(--transition-base) ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </Dialog>
  );
}