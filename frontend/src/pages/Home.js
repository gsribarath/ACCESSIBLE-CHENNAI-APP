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
import { useVoiceInterface, getVoiceCommands } from '../utils/voiceUtils';

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
      speak(`${greeting}! Welcome to Accessible Chennai. You can say: map, community, settings, about us, or help`);

      if (setupSpeechRecognition) {
        setupSpeechRecognition((command) => {
          const cleanCommand = command.toLowerCase().trim();
          
          if (cleanCommand.includes('map') || cleanCommand.includes('navigate')) {
            speak('Going to Navigation');
            navigate('/navigate');
          } else if (cleanCommand.includes('community')) {
            speak('Going to Community');
            navigate('/community');
          } else if (cleanCommand.includes('settings')) {
            speak('Going to Settings');
            navigate('/settings');
          } else if (cleanCommand.includes('about') || cleanCommand.includes('about us')) {
            speak('About Accessible Chennai');
            // For now, we'll show a voice description since about is part of the home page
            speak('Accessible Chennai is your trusted navigation companion for people with disabilities. We provide barrier-free routes, real-time accessibility information, and community support to make Chennai more accessible for everyone.');
          } else if (cleanCommand.includes('logout') || cleanCommand.includes('exit')) {
            speak('Logging out');
            handleLogout();
          } else if (cleanCommand.includes('help')) {
            speak('Available commands: map for navigation, community to connect, settings for preferences, about us to learn more, or logout to exit');
          } else {
            speak('Command not recognized. Try saying: map, community, settings, about us, or help');
          }
        });

        setTimeout(() => {
          startListening();
        }, 1000);
      }
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
    },
    { 
      title: 'About Us', 
      desc: 'Learn about our mission', 
      path: '#about',
      icon: faInfoCircle,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
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
                },
                { 
                  color: '#F59E0B',
                  bgColor: 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                  icon: faHandPaper,
                  title: 'About Us',
                  description: 'Discover our accessibility mission'
                }
              ];
              const currentAction = actionData[index] || actionData[0];
              
              return (
                <div
                  key={action.title}
                  onClick={() => {
                    if (action.title === 'About Us') {
                      // Scroll to the about section
                      const aboutSection = document.querySelector('[data-section="about"]');
                      if (aboutSection) {
                        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    } else {
                      navigate(action.path);
                    }
                  }}
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

        {/* About Us Section - Rapido Style */}
        <section 
          data-section="about"
          style={{ 
            ...getCardStyles(),
            padding: '60px 40px', 
            borderRadius: '24px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
            background: preferences.theme === 'dark' ? 
              'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)' : 
              'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)'
          }}>
          
          {/* About Us Heading */}
          <div style={{ 
            textAlign: 'left',
            marginBottom: '40px'
          }}>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '24px', 
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              color: '#000000',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              About Us
            </h1>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Left Content */}
            <div>
              <h2 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '48px', 
                fontWeight: '800',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
                ...getTextStyles('primary')
              }}>
                Chennai's Beloved
              </h2>
              <h3 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '36px', 
                fontWeight: '700',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.01em',
                lineHeight: '1.2',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Accessible Navigation Service
              </h3>
              
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  fontFamily: 'var(--font-heading)',
                  ...getTextStyles('primary')
                }}>
                  We are not an option, we are a choice
                </h4>
                <p style={{ 
                  margin: '0 0 20px 0', 
                  fontSize: '16px',
                  fontFamily: 'var(--font-secondary)',
                  lineHeight: '1.6',
                  ...getTextStyles('secondary')
                }}>
                  We're the #1 choice of millions of people with disabilities because we're the 
                  complete solution to Chennai's accessibility challenges. With assured safety, 
                  we provide barrier-free navigation and economically accessible routes. Our mission 
                  is to make Chennai accessible for everyone, ensuring that mobility challenges 
                  never limit your potential to explore, work, and live independently.
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  fontFamily: 'var(--font-heading)',
                  ...getTextStyles('primary')
                }}>
                  What makes us different?
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontFamily: 'var(--font-secondary)',
                  lineHeight: '1.6',
                  ...getTextStyles('secondary')
                }}>
                  Our intelligent accessibility features can navigate around barriers during peak hours and get 
                  you to your destination with confidence and ease! From voice-guided navigation to real-time 
                  accessibility updates, we ensure every journey is smooth and inclusive.
                </p>
              </div>

              {/* Key Features Summary */}
              <div style={{
                padding: '24px',
                background: preferences.theme === 'dark' ? 
                  'rgba(59, 130, 246, 0.1)' : 
                  'rgba(59, 130, 246, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h5 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  fontFamily: 'var(--font-heading)',
                  color: '#3b82f6'
                }}>
                  🚀 Core Features
                </h5>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  fontFamily: 'var(--font-secondary)',
                  lineHeight: '1.5',
                  ...getTextStyles('secondary')
                }}>
                  <strong>Voice Navigation</strong> • <strong>Wheelchair Routes</strong> • <strong>Visual/Audio Aids</strong> • <strong>Real-time Metro/Bus</strong> • <strong>Community Support</strong> • <strong>Emergency Assistance</strong> • <strong>Offline Maps</strong> • <strong>Multi-language Support</strong>
                </p>
              </div>
            </div>

            {/* Right Visual */}
            <div style={{ 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Main circular design inspired by Rapido */}
              <div style={{
                width: '320px',
                height: '320px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
              }}>
                {/* Inner circle */}
                <div style={{
                  width: '240px',
                  height: '240px',
                  background: preferences.theme === 'dark' ? 
                    'rgba(30, 41, 59, 0.9)' : 
                    'rgba(255, 255, 255, 0.95)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  {/* Accessibility icon */}
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: '#3b82f6'
                  }}>
                    ♿
                  </div>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '700',
                      fontFamily: 'var(--font-heading)',
                      color: '#3b82f6',
                      marginBottom: '8px'
                    }}>
                      50K+
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      fontFamily: 'var(--font-ui)',
                      ...getTextStyles('secondary')
                    }}>
                      Happy Users
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '-20px',
                  background: preferences.theme === 'dark' ? 
                    'rgba(30, 41, 59, 0.95)' : 
                    'rgba(255, 255, 255, 0.95)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                    100K+
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    ...getTextStyles('secondary')
                  }}>
                    Routes
                  </div>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '-20px',
                  background: preferences.theme === 'dark' ? 
                    'rgba(30, 41, 59, 0.95)' : 
                    'rgba(255, 255, 255, 0.95)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#8b5cf6',
                    marginBottom: '4px'
                  }}>
                    99%
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    ...getTextStyles('secondary')
                  }}>
                    Satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile responsive adjustments */}
          <style>{`
            @media (max-width: 768px) {
              [data-section="about"] > div > div {
                grid-template-columns: 1fr !important;
                gap: 40px !important;
                text-align: center;
              }
              [data-section="about"] h2 {
                font-size: 36px !important;
              }
              [data-section="about"] h3 {
                font-size: 28px !important;
              }
            }
          `}</style>
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
