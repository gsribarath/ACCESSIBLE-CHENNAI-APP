import React, { useState, useEffect, useRef } from 'react';
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
  faInfoCircle,
  faMapMarkerAlt,
  faTrain,
  faBus,
  faWalking
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import { useVoiceInterface, VOICE_MODE_INTRO, processVoiceCommand } from '../utils/voiceUtils';
import LocationService from '../services/LocationService';
import MetroService from '../services/MetroService';

function Home() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [accessibleRoutes, setAccessibleRoutes] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
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
  const voiceSetupStartedRef = useRef(false);

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

  // Get current location and find accessible routes
  useEffect(() => {
    const fetchAccessibleRoutes = async () => {
      try {
        setLoadingLocation(true);
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
        
        // Get all metro stations - with safety check
        const metroStations = MetroService.METRO_STATIONS || {};
        const allStations = Object.entries(metroStations).map(([name, data]) => ({
          name,
          ...data,
          type: 'metro'
        }));
        
        // Calculate distances and find nearest stations
        const stationsWithDistance = allStations.map(station => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            station.lat,
            station.lng
          );
          return { ...station, distance };
        });
        
        // Sort by distance and get top 5 nearest accessible stations
        const nearestStations = stationsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);
        
        // Format as accessible routes
        const routes = nearestStations.map((station, index) => ({
          id: index + 1,
          destination: station.name,
          type: station.type,
          line: station.line,
          distance: station.distance,
          accessibility: 'High',
          facilities: station.facilities || [],
          estimatedTime: Math.ceil(station.distance * 1.5), // rough estimate: 1.5 min per km
          color: station.line === 'Blue' ? '#3B82F6' : '#10B981'
        }));
        
        setAccessibleRoutes(routes);
      } catch (error) {
        console.error('Error fetching location:', error);
        // Set default location to Chennai Central if geolocation fails
        setCurrentLocation({ lat: 13.0836, lng: 80.2750 });
        // Provide some default routes
        setAccessibleRoutes([
          {
            id: 1,
            destination: 'Chennai Central Metro Station',
            type: 'metro',
            line: 'Blue',
            distance: 0,
            accessibility: 'High',
            facilities: ['Elevator', 'Ramps', 'Tactile Paths'],
            estimatedTime: 5,
            color: '#3B82F6'
          },
          {
            id: 2,
            destination: 'Egmore Metro Station',
            type: 'metro',
            line: 'Green',
            distance: 2.5,
            accessibility: 'High',
            facilities: ['Elevator', 'Ramps'],
            estimatedTime: 10,
            color: '#10B981'
          }
        ]);
      } finally {
        setLoadingLocation(false);
      }
    };
    
    if (user) {
      fetchAccessibleRoutes();
    }
  }, [user]);
  
  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Second useEffect: Setup voice commands for voice mode
  useEffect(() => {
    if (!isVoiceMode || !user || voiceSetupComplete || voiceSetupStartedRef.current) {
      return;
    }
    voiceSetupStartedRef.current = true;

   // Speak the simple, clear introduction first
    speak(VOICE_MODE_INTRO, true, true).then(() => {
      // After intro, start listening for commands
      if (setupSpeechRecognition) {
        setupSpeechRecognition((command) => {
          const result = processVoiceCommand(command);
          
          // Handle emergency FIRST
          if (result.action === 'emergency') {
            speak('Emergency mode activated, calling your emergency contact now', true, true).then(() => {
              // Get emergency contact
              const prefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
              if (prefs.emergencyContact) {
                navigate('/alerts', { state: { emergency: true } });
              } else {
                speak('No emergency contact found, please set up your emergency contact in the Settings page', true, true);
              }
            });
            return;
          }
          
          if (result.action === 'navigate') {
            const destination = result.destination || '/navigate';
            let pageName = 'Home';
            if (destination === '/navigate') pageName = 'Navigate';
            else if (destination === '/alerts') pageName = 'Alerts';
            else if (destination === '/community') pageName = 'Community';
            else if (destination === '/settings') pageName = 'Settings';
            
            speak(`Opening ${pageName} page`, false, true).then(() => {
              navigate(destination);
            });
          } else if (result.action === 'repeat') {
            speak(VOICE_MODE_INTRO, true, true);
          } else if (result.action === 'unknown') {
            speak('I did not understand that command, please say Navigate, Alerts, Community, or Settings', true, true);
          }
        });

        setTimeout(() => {
          startListening();
        }, 1000);
        
        setVoiceSetupComplete(true);
      }
    });
  }, [isVoiceMode, user, voiceSetupComplete, navigate, speak, setupSpeechRecognition, startListening]);

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
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '20px' : '40px',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: window.innerWidth <= 768 ? 24 : 32,
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{
            width: window.innerWidth <= 768 ? 100 : 120,
            height: window.innerWidth <= 768 ? 100 : 120,
            borderRadius: '20px',
            background: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow)',
            padding: '10px'
          }}>
            <span style={{ 
              fontSize: window.innerWidth <= 768 ? 18 : 22, 
              color: 'var(--card-bg)',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              Accessible Chennai
            </span>
          </div>
          <h1 style={{ 
            fontSize: window.innerWidth <= 768 ? 28 : 36, 
            marginBottom: 8, 
            fontWeight: 700,
            ...getTextStyles('primary')
          }}>
            Accessible Chennai
          </h1>
          <p style={{ 
            fontSize: window.innerWidth <= 768 ? 14 : 16, 
            margin: 0,
            ...getTextStyles('secondary')
          }}>
            Your inclusive navigation companion
          </p>
        </div>
        
        <div style={{ 
          width: '100%',
          maxWidth: 400, 
          padding: window.innerWidth <= 768 ? 24 : 32, 
          borderRadius: 16, 
          ...getCardStyles(),
          boxSizing: 'border-box'
        }}>
          <h2 style={{ 
            marginBottom: 16, 
            fontSize: window.innerWidth <= 768 ? 20 : 24,
            ...getTextStyles('primary')
          }}>
            Welcome!
          </h2>
          <p style={{ 
            fontSize: window.innerWidth <= 768 ? 14 : 16, 
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
              padding: window.innerWidth <= 768 ? '14px 28px' : '16px 32px', 
              fontSize: window.innerWidth <= 768 ? 15 : 16,
              fontWeight: 600,
              width: '100%',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent'
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
        fontSize: window.innerWidth <= 768 ? 16 : 18,
        padding: '20px',
        boxSizing: 'border-box',
        ...getThemeStyles()
      }}>
        {getText('loading')}
      </div>
    );
  }

  // Main home page for logged-in users
  return (
    <div style={{ 
      ...getThemeStyles(), 
      paddingBottom: window.innerWidth <= 768 ? 90 : 80, 
      position: 'relative', 
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <Navigation user={user} />

      {/* Voice Mode Indicator */}
      {isVoiceMode && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '12px',
          left: 'auto',
          zIndex: 1000,
          background: isListening ? 'var(--accent-color)' : 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s',
          maxWidth: 'calc(100vw - 24px)'
        }}>
          <FontAwesomeIcon 
            icon={faMicrophone} 
            style={{
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
          />
          <span style={{ 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {voiceFeedback || (isListening ? 'Listening...' : 'Voice Mode Active')}
          </span>
        </div>
      )}

      {/* Main Content */}
      <main style={{ 
        padding: window.innerWidth <= 768 ? '12px' : '20px', 
        maxWidth: 1200, 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Welcome Section */}
        <section style={{ 
          ...getCardStyles(),
          padding: window.innerWidth <= 768 ? '20px' : '32px', 
          borderRadius: window.innerWidth <= 768 ? '16px' : '20px', 
          marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: window.innerWidth <= 768 ? '12px' : '16px', 
              marginBottom: window.innerWidth <= 768 ? '12px' : '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: window.innerWidth <= 768 ? '48px' : '56px',
                height: window.innerWidth <= 768 ? '48px' : '56px',
                background: `linear-gradient(135deg, 
                  ${preferences.theme === 'dark' ? '#3B82F6' : '#1E40AF'} 0%, 
                  ${preferences.theme === 'dark' ? '#1D4ED8' : '#3B82F6'} 100%)`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: window.innerWidth <= 768 ? '20px' : '24px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon={faHandPaper} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: window.innerWidth <= 768 ? '1.375rem' : 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-extrabold)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: 'var(--letter-spacing-tight)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: window.innerWidth <= 768 ? '0.875rem' : 'var(--font-size-base)',
                  fontFamily: 'var(--font-secondary)',
                  fontWeight: 'var(--font-weight-medium)',
                  ...getTextStyles('secondary'),
                  lineHeight: '1.4'
                }}>
                  Your accessibility navigation hub for Chennai
                </p>
              </div>
            </div>
            
            <p style={{ 
              margin: '12px 0 0 0', 
              fontSize: window.innerWidth <= 768 ? '0.875rem' : 'var(--font-size-base)',
              fontFamily: 'var(--font-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
              ...getTextStyles('secondary'),
              display: window.innerWidth <= 480 ? 'none' : 'block'
            }}>
              Navigate Chennai with confidence using our comprehensive accessibility features
            </p>
          </div>
        </section>

        {/* Accessible Routes Section */}
        <section style={{ marginBottom: window.innerWidth <= 768 ? '20px' : '32px' }}>
          <div style={{
            ...getCardStyles(),
            padding: window.innerWidth <= 768 ? '20px' : '32px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, 
              ${preferences.theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'} 0%, 
              ${preferences.theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)'} 100%)`,
            border: `1px solid ${preferences.theme === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
            boxShadow: preferences.theme === 'dark' ? 
              '0 8px 32px rgba(0,0,0,0.3)' : 
              '0 8px 32px rgba(59,130,246,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
              marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
              flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
              gap: window.innerWidth <= 480 ? '8px' : '12px'
            }}>
              <h3 style={{
                fontSize: window.innerWidth <= 768 ? '1.125rem' : 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-heading)',
                margin: 0,
                ...getTextStyles('primary'),
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth <= 768 ? '8px' : '12px',
                flexWrap: 'wrap'
              }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#3B82F6' }} />
                <span>Accessible Routes Near You</span>
              </h3>
              {currentLocation && (
                <span style={{
                  fontSize: window.innerWidth <= 768 ? '0.8125rem' : 'var(--font-size-sm)',
                  ...getTextStyles('secondary'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FontAwesomeIcon icon={faCircle} style={{ color: '#10B981', fontSize: '8px' }} />
                  Location Active
                </span>
              )}
            </div>

            {loadingLocation ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                ...getTextStyles('secondary')
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(59,130,246,0.2)',
                  borderTop: '4px solid #3B82F6',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Finding accessible routes near you...
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: window.innerWidth <= 768 ? '12px' : '16px'
              }}>
                {accessibleRoutes.map((route) => (
                  <div 
                    key={route.id} 
                    onClick={() => navigate('/navigate', { 
                      state: { destination: route.destination } 
                    })}
                    style={{
                      padding: window.innerWidth <= 768 ? '16px' : '20px',
                      borderRadius: '12px',
                      background: preferences.theme === 'dark' ? 
                        'rgba(255,255,255,0.05)' : 
                        'rgba(255,255,255,0.8)',
                      border: `2px solid ${preferences.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: window.innerWidth <= 768 ? '12px' : '16px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.currentTarget.style.transform = 'translateX(8px)';
                        e.currentTarget.style.borderColor = route.color;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${route.color}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.borderColor = preferences.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      width: window.innerWidth <= 768 ? '48px' : '56px',
                      height: window.innerWidth <= 768 ? '48px' : '56px',
                      borderRadius: '12px',
                      background: `${route.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: route.color,
                      fontSize: window.innerWidth <= 768 ? '20px' : '24px',
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon icon={route.type === 'metro' ? faTrain : faBus} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: window.innerWidth <= 768 ? '0.9375rem' : 'var(--font-size-lg)',
                        fontWeight: '600',
                        ...getTextStyles('primary'),
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ 
                          flex: window.innerWidth <= 480 ? '1 1 100%' : '0 1 auto',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: window.innerWidth <= 480 ? 'nowrap' : 'normal'
                        }}>
                          {route.destination}
                        </span>
                        <span style={{
                          fontSize: window.innerWidth <= 768 ? '0.6875rem' : 'var(--font-size-xs)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: `${route.color}20`,
                          color: route.color,
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {route.line} Line
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: window.innerWidth <= 768 ? '8px' : '16px',
                        fontSize: window.innerWidth <= 768 ? '0.8125rem' : 'var(--font-size-sm)',
                        ...getTextStyles('secondary'),
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <FontAwesomeIcon icon={faWalking} />
                          {route.distance < 1 
                            ? `${Math.round(route.distance * 1000)}m` 
                            : `${route.distance.toFixed(1)}km`}
                        </span>
                        <span>•</span>
                        <span style={{ whiteSpace: 'nowrap' }}>~{route.estimatedTime} min</span>
                        <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>•</span>
                        <span style={{
                          color: '#10B981',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          display: window.innerWidth <= 480 ? 'none' : 'inline'
                        }}>
                          {route.accessibility} Accessibility
                        </span>
                      </div>
                      
                      {route.facilities.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {route.facilities.slice(0, window.innerWidth <= 480 ? 2 : 3).map((facility, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: window.innerWidth <= 768 ? '0.6875rem' : 'var(--font-size-xs)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: preferences.theme === 'dark' ? 
                                  'rgba(16,185,129,0.2)' : 
                                  'rgba(16,185,129,0.1)',
                                color: '#10B981',
                                fontWeight: '500'
                              }}
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {window.innerWidth > 480 && (
                      <FontAwesomeIcon 
                        icon={faRoute} 
                        style={{
                          fontSize: '20px',
                          color: route.color,
                          opacity: 0.6,
                          flexShrink: 0
                        }}
                      />
                    )}
                  </div>
                ))}
                
                {accessibleRoutes.length === 0 && !loadingLocation && (
                  <div style={{
                    textAlign: 'center',
                    padding: window.innerWidth <= 768 ? '32px 16px' : '40px 20px',
                    ...getTextStyles('secondary')
                  }}>
                    <FontAwesomeIcon 
                      icon={faMapMarkerAlt} 
                      style={{ 
                        fontSize: window.innerWidth <= 768 ? '40px' : '48px', 
                        marginBottom: '16px', 
                        opacity: 0.5 
                      }}
                    />
                    <p style={{ 
                      fontSize: window.innerWidth <= 768 ? '0.875rem' : '1rem',
                      margin: 0
                    }}>
                      No accessible routes found nearby. Try enabling location access.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => navigate('/navigate')}
                  style={{
                    ...getButtonStyles('primary'),
                    marginTop: '8px',
                    padding: window.innerWidth <= 768 ? '12px 20px' : '14px 24px',
                    borderRadius: '10px',
                    fontSize: window.innerWidth <= 768 ? '0.9375rem' : 'var(--font-size-base)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <FontAwesomeIcon icon={faRoute} />
                  Plan Custom Route
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Tips Section */}
        <section>
          <div style={{
            ...getCardStyles(),
            padding: window.innerWidth <= 768 ? '18px' : '24px',
            borderRadius: '16px',
            background: preferences.theme === 'dark' ? 
              'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)' : 
              'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)',
            border: `1px solid ${preferences.theme === 'dark' ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`
          }}>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1rem' : 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-heading)',
              marginBottom: window.innerWidth <= 768 ? '12px' : '16px',
              ...getTextStyles('primary'),
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: window.innerWidth <= 768 ? '18px' : '20px' }}>💡</span>
              Pro Tip of the Day
            </h3>
            <p style={{
              fontSize: window.innerWidth <= 768 ? '0.875rem' : 'var(--font-size-base)',
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
        
        @keyframes spin {
          0% { 
            transform: rotate(0deg); 
          }
          100% { 
            transform: rotate(360deg); 
          }
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
          
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
          
          button, a {
            touch-action: manipulation;
          }
        }

        @media (max-width: 480px) {
          body {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
