import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandPaper, 
  faCompass, 
  faExclamationTriangle, 
  faUsers, 
  faCog,
  faPhoneAlt,
  faCircle,
  faMicrophone,
  faRoute,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import { useVoiceInterface, VOICE_MODE_INTRO, processVoiceCommand } from '../utils/voiceUtils';

function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  const { preferences, getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();
  const isVoiceMode = preferences.mode === 'voice';
  
  // Voice interface setup
  const {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening,
    stopListening
  } = useVoiceInterface();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [voiceSetupComplete, setVoiceSetupComplete] = useState(false);

  // First useEffect: Load user and set greeting
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

  // Second useEffect: Setup voice commands for voice mode
  useEffect(() => {
    if (!isVoiceMode || !user || voiceSetupComplete) {
      return;
    }

    // Speak the comprehensive introduction first
    speak(VOICE_MODE_INTRO, true).then(() => {
      // After intro, start listening for commands
      if (setupSpeechRecognition) {
        setupSpeechRecognition((command) => {
          const result = processVoiceCommand(command);
          
          if (result.action === 'navigate') {
            const destination = result.destination || '/navigate';
            const pageName = destination.replace('/', '').replace(/^\w/, c => c.toUpperCase());
            speak(`Opening ${pageName} page`).then(() => {
              navigate(destination);
            });
          } else if (result.action === 'nearbyBusStop') {
            speak('Finding nearby bus stops. Please wait.').then(() => {
              // Navigate to navigation page with nearby search active
              navigate('/navigate', { state: { searchNearby: true } });
            });
          } else if (result.action === 'accessibleRoute') {
            speak('Opening accessible route planning. Please specify your destination.').then(() => {
              navigate('/navigate', { state: { accessibleOnly: true } });
            });
          } else if (result.action === 'repeatIntro') {
            speak(VOICE_MODE_INTRO, true);
          } else if (result.action === 'exitVoiceMode') {
            speak('Switching to Normal Mode').then(() => {
              // Update preferences to normal mode
              const currentPrefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
              const updatedPrefs = { ...currentPrefs, mode: 'normal' };
              localStorage.setItem('ac_prefs', JSON.stringify(updatedPrefs));
              window.location.reload();
            });
          } else if (result.action === 'unknown') {
            speak('I did not understand that. Please repeat your command slowly.');
          }
        });

        setTimeout(() => {
          startListening();
        }, 1000);
        
        setVoiceSetupComplete(true);
      }
    });
  }, [isVoiceMode, user, voiceSetupComplete]); // Removed function dependencies

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const quickActions = [
    { 
      title: getText('navigate'), 
      desc: 'Find accessible routes', 
      path: '/navigate',
      icon: faRoute,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      title: getText('community'), 
      desc: 'Connect & share', 
      path: '/community',
      icon: faUsers,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      title: getText('settings'), 
      desc: 'Preferences', 
      path: '/settings',
      icon: faCog,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
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
    <div style={{ ...getThemeStyles(), paddingBottom: 80, position: 'relative' }}>
      <Navigation user={user} />

      {/* Voice Mode Indicator */}
      {isVoiceMode && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          background: isListening ? 'var(--accent-color)' : 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s'
        }}>
          <FontAwesomeIcon 
            icon={faMicrophone} 
            style={{
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
          />
          <span>{voiceFeedback || (isListening ? 'Listening...' : 'Voice Mode Active')}</span>
        </div>
      )}

      {/* Main Content */}
      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <section style={{ 
          ...getCardStyles(),
          padding: '32px', 
          borderRadius: '20px', 
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, 
            ${preferences.theme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)'} 0%, 
            ${preferences.theme === 'dark' ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)'} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${preferences.theme === 'dark' ? 'rgba(71,85,105,0.3)' : 'rgba(226,232,240,0.5)'}`,
          boxShadow: preferences.theme === 'dark' ? 
            '0 8px 32px rgba(0,0,0,0.3)' : 
            '0 8px 32px rgba(15,23,42,0.08)'
        }}>
          {/* Professional accent element */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 50%, #3B82F6 100%)',
            animation: 'slideRight 3s ease-in-out infinite'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, 
                  ${preferences.theme === 'dark' ? '#3B82F6' : '#1E40AF'} 0%, 
                  ${preferences.theme === 'dark' ? '#1D4ED8' : '#3B82F6'} 100%)`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <FontAwesomeIcon icon={faHandPaper} />
              </div>
              <div>
                <h2 style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-extrabold)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: 'var(--letter-spacing-tight)'
                }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-secondary)',
                  fontWeight: 'var(--font-weight-medium)',
                  ...getTextStyles('secondary')
                }}>
                  Your accessibility navigation hub for Chennai
                </p>
              </div>
            </div>
            
            <p style={{ 
              margin: '16px 0 0 0', 
              fontSize: 'var(--font-size-base)',
              fontFamily: 'var(--font-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
              ...getTextStyles('secondary')
            }}>
              Navigate Chennai with confidence using our comprehensive accessibility features
            </p>
          </div>
        </section>

        {/* Quick Access */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-heading)',
            marginBottom: '20px',
            ...getTextStyles('primary')
          }}>
            Quick Access
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { 
                label: 'Nearby Metro Stations', 
                path: '/navigate',
                icon: faCompass,
                color: '#3B82F6'
              },
              { 
                label: 'Emergency Contacts', 
                path: '/alerts',
                icon: faPhoneAlt,
                color: '#EF4444'
              },
              { 
                label: 'Real-time Updates', 
                path: '/alerts',
                icon: faInfoCircle,
                color: '#10B981'
              }
            ].map((link, idx) => (
              <div
                key={idx}
                onClick={() => navigate(link.path)}
                style={{
                  ...getCardStyles(),
                  padding: '16px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${link.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: preferences.theme === 'dark' ? 
                    'rgba(30,41,59,0.8)' : 
                    'rgba(255,255,255,0.9)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${link.color}30`;
              }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${link.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: link.color,
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  <FontAwesomeIcon icon={link.icon} />
                </div>
                <span style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  ...getTextStyles('primary')
                }}>
                  {link.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{
            ...getCardStyles(),
            padding: '32px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, 
              ${preferences.theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'} 0%, 
              ${preferences.theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)'} 100%)`,
            border: `1px solid ${preferences.theme === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
            boxShadow: preferences.theme === 'dark' ? 
              '0 8px 32px rgba(0,0,0,0.3)' : 
              '0 8px 32px rgba(59,130,246,0.1)'
          }}>
            <h3 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '24px',
              textAlign: 'center',
              ...getTextStyles('primary')
            }}>
              Your Impact in Numbers
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '24px'
            }}>
              {[
                { number: '42', label: 'Routes Planned', color: '#3B82F6', icon: faRoute },
                { number: '18', label: 'Alerts Received', color: '#F59E0B', icon: faExclamationTriangle },
                { number: '12', label: 'Community Posts', color: '#10B981', icon: faUsers },
                { number: '5', label: 'Places Saved', color: '#8B5CF6', icon: faCompass }
              ].map((stat, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  padding: '20px',
                  borderRadius: '12px',
                  background: preferences.theme === 'dark' ? 
                    'rgba(255,255,255,0.05)' : 
                    'rgba(255,255,255,0.8)',
                  border: `1px solid ${preferences.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 12px',
                    borderRadius: '50%',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    fontSize: '20px'
                  }}>
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: '4px',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    ...getTextStyles('secondary'),
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section>
          <div style={{
            ...getCardStyles(),
            padding: '24px',
            borderRadius: '16px',
            background: preferences.theme === 'dark' ? 
              'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)' : 
              'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)',
            border: `1px solid ${preferences.theme === 'dark' ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`
          }}>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '16px',
              ...getTextStyles('primary'),
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              Pro Tip of the Day
            </h3>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 'var(--line-height-relaxed)',
              ...getTextStyles('secondary'),
              margin: 0
            }}>
              Use voice mode for hands-free navigation! Enable it in Settings → Accessibility Mode → Voice Control for a fully guided experience.
            </p>
          </div>
        </section>


      </main>

      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes slideRight {
          0%, 100% { 
            transform: translateX(-10px); 
            opacity: 0.8;
          }
          50% { 
            transform: translateX(10px); 
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.8;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.05); 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
