import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function Settings() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState('normal');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
    
    // Load saved preferences
    const prefs = localStorage.getItem('ac_prefs');
    if (prefs) {
      const { language: lang, theme: th, mode: md } = JSON.parse(prefs);
      setLanguage(lang || 'en');
      setTheme(th || 'light');
      setMode(md || 'normal');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const handleSave = async () => {
    localStorage.setItem('ac_prefs', JSON.stringify({ language, theme, mode }));
    if (user?.user_id) {
      try {
        await fetch(`/api/user/${user.user_id}/preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: { language, theme, mode } }),
        });
        setMsg('Preferences saved successfully!');
        setTimeout(() => setMsg(''), 3000);
      } catch (err) {
        console.error('Error saving preferences:', err);
        setMsg('Error saving preferences');
        setTimeout(() => setMsg(''), 3000);
      }
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: 80 }}>
      <Navigation user={user} onLogout={handleLogout} />

      <main style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 28, fontWeight: 600 }}>
            Settings & Preferences
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
            Customize your Accessible Chennai experience
          </p>
        </section>

        {/* Settings Form */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: 24
        }}>
          {/* Language Setting */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: 18, fontWeight: 600 }}>Language</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
              Choose your preferred language for the interface
            </p>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 300,
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
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Theme Setting */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: 18, fontWeight: 600 }}>Display Theme</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
              Adjust the visual appearance for better accessibility
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {['light', 'dark', 'high-contrast'].map(themeOption => (
                <button
                  key={themeOption}
                  onClick={() => setTheme(themeOption)}
                  style={{
                    padding: '12px 16px',
                    border: `2px solid ${theme === themeOption ? '#1976d2' : '#e0e0e0'}`,
                    borderRadius: 12,
                    background: theme === themeOption ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {theme === themeOption && <span style={{ color: '#1976d2', fontSize: 16, fontWeight: 'bold' }}>✓</span>}
                  <span style={{ 
                    color: theme === themeOption ? '#1976d2' : '#333',
                    fontWeight: theme === themeOption ? 600 : 400,
                    textTransform: 'capitalize'
                  }}>
                    {themeOption.replace('-', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Setting */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: 18, fontWeight: 600 }}>Interaction Mode</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
              Choose how you want to interact with the app
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { value: 'normal', label: 'Touch/Click', desc: 'Standard interaction' },
                { value: 'voice', label: 'Voice Mode', desc: 'Voice commands & feedback' }
              ].map(modeOption => (
                <button
                  key={modeOption.value}
                  onClick={() => setMode(modeOption.value)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${mode === modeOption.value ? '#1976d2' : '#e0e0e0'}`,
                    borderRadius: 12,
                    background: mode === modeOption.value ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {mode === modeOption.value && <span style={{ color: '#1976d2', fontSize: 16, fontWeight: 'bold' }}>✓</span>}
                    <span style={{ 
                      color: mode === modeOption.value ? '#1976d2' : '#333',
                      fontWeight: mode === modeOption.value ? 600 : 500,
                      fontSize: 14
                    }}>
                      {modeOption.label}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 12, 
                    color: '#666',
                    opacity: mode === modeOption.value ? 1 : 0.7
                  }}>
                    {modeOption.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 24 }}>
            <button 
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              Save Preferences
            </button>
            
            {msg && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px 16px',
                borderRadius: 8,
                background: msg.includes('Error') ? '#ffebee' : '#e8f5e8',
                color: msg.includes('Error') ? '#c62828' : '#2e7d32',
                fontSize: 14,
                fontWeight: 500
              }}>
                {msg}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
