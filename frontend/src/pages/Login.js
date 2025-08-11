import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth and all login/register success redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user_id');
    if ((params.get('google_success') || params.get('login_success') || params.get('register_success')) && userId) {
      localStorage.setItem('ac_user', JSON.stringify({ user_id: userId }));
      window.location.href = '/';
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        console.log('Navigating to home...');
        window.location.href = '/';
      } else {
        setError(data.error || 'Login/Register failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error');
    }
  };

  // Real Google OAuth
  const handleGoogle = () => {
    window.location.href = '/api/google-auth/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Navigation showBottomNav={false} />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '20px' }}>
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
          <h2 style={{ color: '#333', fontSize: 24, fontWeight: 600, margin: 0 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#666', fontSize: 14, margin: '8px 0 0 0' }}>
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
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
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
                  fontSize: 16,
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa'
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
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
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
                  fontSize: 16,
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa'
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

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 12, 
                padding: '14px 0', 
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)'
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
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseOver={e => {
              e.target.style.borderColor = '#1976d2';
              e.target.style.background = '#f8f9fa';
            }}
            onMouseOut={e => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.background = '#fff';
            }}
          >
            <span style={{ fontSize: 18 }}>🔗</span>
            Sign in with Google
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1976d2', 
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'underline'
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
