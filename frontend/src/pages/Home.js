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
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import { useVoiceInterface } from '../utils/voiceUtils';

function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText, preferences } = usePreferences();
  
  // Voice interface setup
  const {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening,
    stopListening,
    isVoiceMode
  } = useVoiceInterface(preferences, getText);

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

    // Setup voice commands for voice mode
    if (isVoiceMode) {
      const commands = getVoiceCommands(preferences.language);
      
      const commandHandlers = {
        // Simple navigation commands
        'home': () => {
          speak('Already on home page');
        },
        'map|navigate': () => {
          speak('Going to map');
          navigate('/navigate');
        },
        'alerts': () => {
          speak('Going to alerts');
          navigate('/alerts');
        },
        'community': () => {
          speak('Going to community');
          navigate('/community');
        },
        'settings': () => {
          speak('Going to settings');
          navigate('/settings');
        },
        'logout|exit': () => {
          speak('Logging out');
          handleLogout();
        },
        'emergency|help|911': () => {
          speak('Emergency assistance activated. Calling 911');
          window.location.href = 'tel:911';
        },
        'commands|help|what can i do': () => {
          const helpText = `Available commands: Map, Alerts, Community, Settings, Emergency, or Logout`;
          speak(helpText);
        }
      };
      
      setupSpeechRecognition(commandHandlers);
      
      // Simple welcome message for voice mode
      setTimeout(() => {
        const welcomeMessage = `${greeting}! Welcome to Accessible Chennai. Say: Map, Alerts, Community, Settings, or Emergency.`;
        speak(welcomeMessage).then(() => {
          startListening();
        });
      }, 1000);
    }
  }, [navigate, getText, isVoiceMode, preferences.language, speak, setupSpeechRecognition, startListening, greeting]);

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
    <div style={{ ...getThemeStyles(), paddingBottom: 80, position: 'relative' }}>
      <Navigation user={user} onLogout={handleLogout} />

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

        {/* Quick Actions Grid */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            marginBottom: '24px', 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            ...getTextStyles('primary'),
            textAlign: 'center'
          }}>
            Essential Services
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {quickActions.map((action, index) => {
              const actionData = [
                { 
                  color: '#3B82F6',
                  bgColor: 'rgba(59, 130, 246, 0.1)',
                  borderColor: 'rgba(59, 130, 246, 0.2)',
                  icon: faCompass,
                  title: 'Smart Navigation',
                  description: 'AI-powered accessible route planning'
                },
                { 
                  color: '#EF4444',
                  bgColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  icon: faExclamationTriangle,
                  title: 'Community Alerts',
                  description: 'Real-time accessibility updates'
                },
                { 
                  color: '#10B981',
                  bgColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                  icon: faUsers,
                  title: 'Connect & Share',
                  description: 'Join our inclusive community'
                },
                { 
                  color: '#8B5CF6',
                  bgColor: 'rgba(139, 92, 246, 0.1)',
                  borderColor: 'rgba(139, 92, 246, 0.2)',
                  icon: faCog,
                  title: 'Accessibility Settings',
                  description: 'Customize your experience'
                }
              ];
              const currentAction = actionData[index] || actionData[0];
              
              return (
                <div
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  style={{
                    ...getCardStyles(),
                    padding: '24px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    background: preferences.theme === 'dark' ? 
                      'rgba(30, 41, 59, 0.8)' : 
                      'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${currentAction.borderColor}`,
                    boxShadow: preferences.theme === 'dark' ? 
                      '0 4px 16px rgba(0, 0, 0, 0.3)' : 
                      '0 4px 16px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = preferences.theme === 'dark' ? 
                      '0 8px 32px rgba(0, 0, 0, 0.4)' : 
                      '0 8px 32px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = currentAction.color;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = preferences.theme === 'dark' ? 
                      '0 4px 16px rgba(0, 0, 0, 0.3)' : 
                      '0 4px 16px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = currentAction.borderColor;
                  }}
                >
                  {/* Professional accent line */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: `linear-gradient(90deg, ${currentAction.color} 0%, transparent 100%)`,
                    borderRadius: '16px 16px 0 0'
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                      fontSize: '24px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px',
                      background: currentAction.bgColor,
                      borderRadius: '14px',
                      border: `2px solid ${currentAction.borderColor}`,
                      transition: 'all 0.3s ease',
                      color: currentAction.color
                    }}>
                      <FontAwesomeIcon icon={currentAction.icon} />
                    </div>
                    
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 'var(--font-size-lg)', 
                      fontWeight: 'var(--font-weight-semibold)',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: 'var(--letter-spacing-tight)',
                      color: currentAction.color,
                      lineHeight: 'var(--line-height-tight)'
                    }}>
                      {currentAction.title}
                    </h4>
                    
                    <p style={{ 
                      margin: 0, 
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-secondary)',
                      lineHeight: 'var(--line-height-normal)',
                      ...getTextStyles('secondary')
                    }}>
                      {currentAction.description}
                    </p>
                    
                    {/* Professional hover indicator */}
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: 0.7,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <span style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-ui)',
                        letterSpacing: 'var(--letter-spacing-wide)',
                        color: currentAction.color
                      }}>
                        Learn more
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: currentAction.color
                      }}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Alerts */}
        <section style={{ 
          ...getCardStyles(),
          padding: '24px', 
          borderRadius: '20px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background element */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #F44336 0%, #FF9800 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #F44336 0%, #FF9800 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: 'white'
                }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: 'var(--letter-spacing-tight)',
                  ...getTextStyles('primary')
                }}>
                  Recent Alerts
                </h3>
              </div>
              <button 
                onClick={() => navigate('/alerts')}
                style={{
                  ...getButtonStyles('ghost'),
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 16px'
                }}
              >
                View All →
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentAlerts.map((alert, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: '16px',
                    background: 'rgba(244, 67, 54, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(244, 67, 54, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '4px',
                      flexShrink: 0,
                      color: alert.type === 'urgent' ? '#F44336' : '#FF9800'
                    }}>
                      <FontAwesomeIcon icon={faCircle} size="xs" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-secondary)',
                        ...getTextStyles('primary')
                      }}>
                        {alert.message || alert.msg}
                      </p>
                      <p style={{ 
                        margin: 0, 
                        fontSize: 'var(--font-size-xs)',
                        fontFamily: 'var(--font-ui)',
                        ...getTextStyles('secondary')
                      }}>
                        {alert.time} • {alert.location || 'Chennai'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section style={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
          color: '#fff',
          padding: '24px', 
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(238, 90, 36, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            right: '-30px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '12px',
              color: 'white'
            }}>
              <FontAwesomeIcon icon={faPhoneAlt} />
            </div>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-heading)'
            }}>
              Emergency Assistance
            </h4>
            <p style={{ 
              margin: '0 0 20px 0', 
              fontSize: 'var(--font-size-sm)', 
              fontFamily: 'var(--font-secondary)',
              opacity: 0.9 
            }}>
              Immediate help is just a tap away
            </p>
            <button 
              onClick={() => window.location.href = 'tel:112'}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Call Emergency (112)
            </button>
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
