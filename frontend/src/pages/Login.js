import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth and all login/register success redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user_id');
    const email = params.get('email');
    const errorParam = params.get('error');
    
    // Handle errors
    if (errorParam) {
      const errorMessages = {
        'google_auth_failed': 'Google authentication failed. Please try again.',
        'google_not_configured': 'Google Sign-In is not properly configured.',
        'no_email_from_google': 'Unable to get email from Google account.',
        'google_callback_failed': 'Google authentication callback failed.'
      };
      setError(errorMessages[errorParam] || 'Authentication failed. Please try again.');
      return;
    }
    
    // Handle successful login
    if ((params.get('google_success') || params.get('login_success') || params.get('register_success')) && userId) {
      const userData = { user_id: userId };
      if (email) {
        userData.email = email;
      }
      localStorage.setItem('ac_user', JSON.stringify(userData));
      
      // Check if this is a new registration (mode selection needed) or existing user
      if (params.get('register_success') || params.get('google_success')) {
        // For new users, redirect to mode selection
        window.location.href = '/mode-selection';
      } else {
        // For existing users, go directly to home
        window.location.href = '/';
      }
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password confirmation for registration
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const prefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
    try {
      const res = await fetch(`/api/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, preferences: prefs }),
      });
      const data = await res.json();
      console.log('Login response:', data, 'Status:', res.status);
      if (res.ok) {
        localStorage.setItem('ac_user', JSON.stringify({ email, user_id: data.user_id }));
        
        if (isRegister && data.is_new_user) {
          // New user registration - go to mode selection
          console.log('Navigating to mode selection for new user...');
          window.location.href = '/mode-selection';
        } else {
          // Existing user login - go to home
          console.log('Navigating to home for existing user...');
          window.location.href = '/';
        }
      } else {
        setError(data.error || 'Login/Register failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error');
    }
  };

  // Real Google OAuth
  const handleGoogle = async () => {
    try {
      setError(''); // Clear any existing errors
      // Add loading state if needed
      window.location.href = '/api/google-auth/login';
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Unable to connect to Google. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Navigation showBottomNav={false} />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh - 64px)', 
        padding: '20px',
        boxSizing: 'border-box',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
          }}>
            <span style={{ 
              fontSize: 40, 
              color: '#fff',
              fontWeight: 'bold',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}>
              AC
            </span>
          </div>
          <h2 style={{ 
            color: '#333', 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            margin: 0 
          }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: 'var(--font-size-sm)', 
            fontFamily: 'var(--font-secondary)',
            margin: '8px 0 0 0' 
          }}>
            {isRegister ? 'Join our accessible community' : 'Sign in to continue your journey'}
          </p>
        </div>

        <div style={{ 
          maxWidth: 400, 
          width: '100%', 
          padding: 32, 
          borderRadius: 16, 
          background: '#fff', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxSizing: 'border-box'
        }}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#333', 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)'
              }}>
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-primary)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#1976d2';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#333', 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)'
              }}>
                Password
              </label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-primary)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#1976d2';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
              />
            </div>

            {isRegister && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#333', 
                  fontSize: 'var(--font-size-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-ui)',
                  letterSpacing: 'var(--letter-spacing-wide)'
                }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: `2px solid ${password && confirmPassword && password !== confirmPassword ? '#d32f2f' : '#e0e0e0'}`,
                    borderRadius: 12,
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-primary)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: '#fafafa',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#1976d2';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    if (password && confirmPassword && password !== confirmPassword) {
                      e.target.style.borderColor = '#d32f2f';
                    } else {
                      e.target.style.borderColor = '#e0e0e0';
                    }
                    e.target.style.background = '#fafafa';
                  }}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <div style={{ 
                    color: '#d32f2f', 
                    fontSize: 'var(--font-size-xs)', 
                    marginTop: '4px',
                    fontFamily: 'var(--font-ui)'
                  }}>
                    Passwords do not match
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 12, 
                padding: '14px 0', 
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                boxSizing: 'border-box'
              }}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.3)';
              }}
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{ height: 1, background: '#e0e0e0', position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                top: -8, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: '#fff', 
                padding: '0 16px', 
                fontSize: 12, 
                color: '#666' 
              }}>
                OR
              </span>
            </div>
          </div>

          <button 
            onClick={handleGoogle} 
            style={{ 
              width: '100%', 
              background: '#fff', 
              color: '#333', 
              border: '2px solid #e0e0e0', 
              borderRadius: 12, 
              padding: '12px 0', 
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-ui)',
              letterSpacing: 'var(--letter-spacing-normal)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={e => {
              e.target.style.borderColor = '#1976d2';
              e.target.style.background = '#f8f9fa';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseOut={e => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.background = '#fff';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setConfirmPassword('');
                setError('');
              }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1976d2', 
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                textDecoration: 'underline',
                padding: '8px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Create One'}
            </button>
          </div>

          {error && (
            <div style={{ 
              color: '#d32f2f', 
              marginTop: 16, 
              padding: '12px 16px',
              background: '#ffebee',
              borderRadius: 8,
              fontSize: 14,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
