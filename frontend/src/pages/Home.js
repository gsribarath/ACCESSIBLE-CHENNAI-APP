import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';

function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    const prefs = localStorage.getItem('ac_prefs');
    
    if (!userData) {
      // Show onboarding if no user data and no preferences
      if (!prefs) {
        setShowOnboarding(true);
      } else {
        navigate('/login');
      }
    } else {
      setUser(JSON.parse(userData));
    }

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(getText('goodMorning'));
    else if (hour < 18) setGreeting(getText('goodAfternoon'));
    else setGreeting(getText('goodEvening'));
  }, [navigate, getText]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const quickActions = [
    { title: getText('navigate'), desc: 'Find accessible routes', path: '/navigate' },
    { title: getText('alerts'), desc: 'Real-time updates', path: '/alerts' },
    { title: getText('community'), desc: 'Connect & share', path: '/community' },
    { title: getText('settings'), desc: 'Preferences', path: '/settings' }
  ];

  const recentAlerts = [
    { id: 1, type: 'Service', msg: 'Metro service delayed on Blue Line', time: '10 min ago' },
    { id: 2, type: 'Accessibility', msg: 'Lift maintenance at Central Station', time: '25 min ago' },
    { id: 3, type: 'Weather', msg: 'Heavy rain expected - plan accordingly', time: '1 hour ago' }
  ];

  // Show onboarding for first-time users
  if (showOnboarding) {
    return (
      <div style={{ 
        ...getThemeStyles(),
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow)'
          }}>
            <span style={{ 
              fontSize: 40, 
              color: 'var(--card-bg)',
              fontWeight: 'bold'
            }}>
              AC
            </span>
          </div>
          <h1 style={{ 
            fontSize: 36, 
            marginBottom: 8, 
            fontWeight: 700,
            ...getTextStyles('primary')
          }}>
            Accessible Chennai
          </h1>
          <p style={{ 
            fontSize: 16, 
            margin: 0,
            ...getTextStyles('secondary')
          }}>
            Your inclusive navigation companion
          </p>
        </div>
        
        <div style={{ 
          maxWidth: 400, 
          padding: 32, 
          borderRadius: 16, 
          ...getCardStyles()
        }}>
          <h2 style={{ 
            marginBottom: 16, 
            fontSize: 24,
            ...getTextStyles('primary')
          }}>
            Welcome!
          </h2>
          <p style={{ 
            fontSize: 16, 
            lineHeight: 1.6, 
            marginBottom: 24,
            ...getTextStyles('secondary')
          }}>
            {getText('welcomeMessage')}
          </p>
          <button 
            onClick={handleOnboardingComplete} 
            style={{ 
              ...getButtonStyles('primary'),
              borderRadius: 12, 
              padding: '16px 32px', 
              fontSize: 16,
              fontWeight: 600,
              width: '100%',
              transition: 'all 0.2s'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: 18,
        ...getThemeStyles()
      }}>
        {getText('loading')}
      </div>
    );
  }

  // Main home page for logged-in users
  return (
    <div style={{ ...getThemeStyles(), paddingBottom: 80 }}>
      <Navigation user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Welcome Section */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 20
        }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 28, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            {greeting}!
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: 16, 
            lineHeight: 1.5,
            ...getTextStyles('secondary')
          }}>
            {getText('welcomeMessage')}
          </p>
        </section>

        {/* Quick Actions Grid */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ 
            marginBottom: 16, 
            fontSize: 20, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            {getText('quickActions')}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 16 
          }}>
            {quickActions.map(action => (
              <div
                key={action.title}
                onClick={() => navigate(action.path)}
                style={{
                  ...getCardStyles(),
                  padding: 24,
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ 
                  fontSize: 24, 
                  marginBottom: 16, 
                  opacity: 0.9, 
                  color: 'var(--accent-color)', 
                  fontWeight: 'bold' 
                }}>
                  {action.title[0]}
                </div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: 18, 
                  fontWeight: 600,
                  ...getTextStyles('primary')
                }}>
                  {action.title}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  lineHeight: 1.4,
                  ...getTextStyles('secondary')
                }}>
                  {action.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Alerts */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: 20, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              {getText('recentAlerts')}
            </h3>
            <button 
              onClick={() => navigate('/alerts')}
              style={{
                ...getButtonStyles('ghost'),
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'all 0.2s'
              }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentAlerts.map(alert => (
              <div 
                key={alert.id}
                style={{
                  padding: 20,
                  background: 'var(--card-bg)',
                  borderRadius: 12,
                  borderLeft: '4px solid var(--accent-color)',
                  transition: 'all 0.2s',
                  opacity: 0.9
                }}
                onMouseOver={e => e.target.style.opacity = '1'}
                onMouseOut={e => e.target.style.opacity = '0.9'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ 
                      background: 'var(--accent-color)', 
                      color: 'var(--card-bg)', 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {alert.type}
                    </span>
                    <p style={{ 
                      margin: '12px 0 0 0', 
                      fontSize: 15, 
                      lineHeight: 1.4,
                      ...getTextStyles('primary')
                    }}>
                      {alert.msg}
                    </p>
                  </div>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 500,
                    ...getTextStyles('secondary')
                  }}>
                    {alert.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Contact */}
        <section style={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
          color: '#fff',
          padding: 24, 
          borderRadius: 16,
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(238, 90, 36, 0.3)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>
            {getText('emergencyAssistance')}
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, opacity: 0.9 }}>
            Need immediate help with accessibility?
          </p>
          <button 
            style={{
              background: '#fff',
              color: '#ee5a24',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 16,
              transition: 'all 0.2s'
            }}
            onClick={() => window.location.href = 'tel:1077'}
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Call 1077
          </button>
        </section>
      </main>
    </div>
  );
}

export default Home;
