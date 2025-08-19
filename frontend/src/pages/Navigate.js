import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPlay, 
  faStop, 
  faCompass,
  faSearch,
  faTarget,
  faMicrophone,
  faTrain,
  faCar,
  faBus
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';
import MetroNavigation from '../components/MetroNavigation';
import MTCBusNavigation from '../components/MTCBusNavigation';
import LocationService from '../services/LocationService';
import { usePreferences } from '../context/PreferencesContext';
import { useVoiceInterface } from '../utils/voiceUtils';
import '../styles/metro.css';

const Navigate = () => {
  const { preferences, getThemeStyles, getCardStyles, getTextStyles, getButtonStyles } = usePreferences();
  const [user] = useState({ name: 'User' });
  const [transportMode, setTransportMode] = useState('general'); // 'general', 'metro', 'bus'
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });
  const [activeInput, setActiveInput] = useState(null);
  const [voiceInputMode, setVoiceInputMode] = useState(null); // 'from', 'to', or null
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionsRef = useRef(null);
  const toSuggestionsRef = useRef(null);
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
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedFromInput = fromInputRef.current && fromInputRef.current.contains(event.target);
      const clickedToInput = toInputRef.current && toInputRef.current.contains(event.target);
      const clickedFromSuggestions = fromSuggestionsRef.current && fromSuggestionsRef.current.contains(event.target);
      const clickedToSuggestions = toSuggestionsRef.current && toSuggestionsRef.current.contains(event.target);
      
      if (!clickedFromInput && !clickedToInput && !clickedFromSuggestions && !clickedToSuggestions) {
        setSuggestions({ from: [], to: [] });
        setActiveInput(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Voice commands setup
  useEffect(() => {
    if (isVoiceMode) {
      const commandHandlers = {
        // Simple location commands
        'from|start': () => {
          setVoiceInputMode('from');
          speak('Say your starting location');
          setFromLocation('');
          setTimeout(() => {
            setupLocationVoiceRecognition('from');
          }, 2000);
        },
        'to|destination|go': () => {
          setVoiceInputMode('to');
          speak('Say your destination');
          setToLocation('');
          setTimeout(() => {
            setupLocationVoiceRecognition('to');
          }, 2000);
        },
        'search|find|route': () => {
          if (fromLocation && toLocation) {
            speak('Finding routes');
            handleSearch();
          } else {
            speak('Please set starting location and destination first');
          }
        },
        'current|here|my location': () => {
          speak('Using current location');
          getCurrentLocation();
        },
        'clear|reset': () => {
          speak('Clearing all');
          setFromLocation('');
          setToLocation('');
          setRoutes([]);
          setSelectedRoute(null);
        },
        'back': () => {
          if (selectedRoute) {
            speak('Back to routes');
            setSelectedRoute(null);
          } else {
            speak('Going back');
            window.history.back();
          }
        },
        'home': () => {
          speak('Going home');
          navigate('/');
        },
        'help|commands': () => {
          const helpText = `Say: From, To, Search, Current location, Clear, or Back`;
          speak(helpText);
        }
      };
      
      setupSpeechRecognition(commandHandlers);
      
      // Simple welcome message
      setTimeout(() => {
        const welcomeMessage = `Navigation page. Say: From, To, Search, Current location, or Clear.`;
        speak(welcomeMessage).then(() => {
          startListening();
        });
      }, 1000);
    }
  }, [isVoiceMode, preferences.language, fromLocation, toLocation, selectedRoute]);

  // Location voice recognition for input fields
  const setupLocationVoiceRecognition = (type) => {
    if (!isVoiceMode) return;
    
    const locationHandlers = {
      '.*': (transcript) => { // Any speech input
        const location = transcript.trim();
        if (type === 'from') {
          setFromLocation(location);
          speak(`Starting location set to ${location}`);
        } else {
          setToLocation(location);
          speak(`Destination set to ${location}`);
        }
        setVoiceInputMode(null);
        
        // Resume normal command listening
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };
    
    setupSpeechRecognition(locationHandlers);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  // Enhanced Navigation View Component
  const NavigationView = ({ route, onBack }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      if (isNavigating) {
        const interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 2;
            if (newProgress >= 100) {
              setIsNavigating(false);
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Navigation complete! You have arrived at your destination.');
                speechSynthesis.speak(utterance);
              }
              return 100;
            }
            return newProgress;
          });
        }, 500);
        
        return () => clearInterval(interval);
      }
    }, [isNavigating]);
    
    useEffect(() => {
      const stepProgress = Math.floor(progress / (100 / (route.steps?.length || 1)));
      if (stepProgress !== currentStep && stepProgress < (route.steps?.length || 0)) {
        setCurrentStep(stepProgress);
        if (isNavigating && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(route.steps[stepProgress]);
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    }, [progress, route.steps, isNavigating, currentStep]);
    
    if (!route) {
      return (
        <div style={{ ...getThemeStyles(), padding: 20 }}>
          <h2>Navigation Error</h2>
          <p>No route data available</p>
          <button onClick={onBack} style={getButtonStyles('primary')}>
            Back to Search
          </button>
        </div>
      );
    }

    const startNavigation = () => {
      setIsNavigating(true);
      setProgress(0);
      setCurrentStep(0);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Starting navigation. ${route.mode} route to your destination.`);
        speechSynthesis.speak(utterance);
      }
    };
    
    const stopNavigation = () => {
      setIsNavigating(false);
      setProgress(0);
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };

    return (
      <div style={{ ...getThemeStyles(), padding: 20, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{
          ...getCardStyles(),
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <button
            onClick={onBack}
            style={{
              ...getButtonStyles('ghost'),
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            ← Back
          </button>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              {route.mode || 'Navigation'} Route
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              {route.duration || 'Unknown'} • {route.cost || 'Unknown'} • {route.accessibilityScore}% Accessible
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <FontAwesomeIcon icon={faPlay} /> Start Navigation
              </button>
            ) : (
              <button
                onClick={stopNavigation}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <FontAwesomeIcon icon={faStop} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Interactive Navigation Map */}
        <div style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          background: preferences.theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
          border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <FontAwesomeIcon 
              icon={faCompass} 
              style={{ 
                fontSize: 48, 
                color: preferences.theme === 'dark' ? '#666' : '#ccc',
                marginBottom: 12 
              }} 
            />
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              Navigation guidance available
            </p>
          </div>
        </div>

        {/* Current Step Details */}
        <div style={{
          ...getCardStyles(),
          padding: 20,
          marginBottom: 16,
          border: isNavigating ? '2px solid #007bff' : '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: isNavigating ? '#007bff' : '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600
            }}>
              {currentStep + 1}
            </div>
            
            <div style={{ flex: 1 }}>
              {isNavigating && (
                <div
                  style={{
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 4,
                    display: 'inline-block',
                    background: '#007bff',
                    color: 'white',
                    padding: '2px 10px',
                    letterSpacing: '1px',
                  }}
                >
                  NAVIGATING
                </div>
              )}
            </div>
          </div>

          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: 18, 
            lineHeight: 1.4,
            ...getTextStyles('primary')
          }}>
            {route.steps?.[currentStep] || 'No step information available'}
          </p>

          {/* Step Navigation */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isNavigating}
              style={{
                ...getButtonStyles('ghost'),
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                opacity: (currentStep === 0 || isNavigating) ? 0.5 : 1,
                cursor: (currentStep === 0 || isNavigating) ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.min((route.steps?.length || 1) - 1, currentStep + 1))}
              disabled={currentStep === (route.steps?.length || 1) - 1 || isNavigating}
              style={{
                ...getButtonStyles('ghost'),
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                opacity: (currentStep === (route.steps?.length || 1) - 1 || isNavigating) ? 0.5 : 1,
                cursor: (currentStep === (route.steps?.length || 1) - 1 || isNavigating) ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Route Information */}
        {route.accessibilityFeatures && route.accessibilityFeatures.length > 0 && (
          <div style={{
            ...getCardStyles(),
            padding: 20
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 16, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Accessibility Features
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {route.accessibilityFeatures.map((feature, index) => (
                <span key={index} style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Search for routes
  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      setError('Please enter both from and to locations');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const routeOptions = await LocationService.generateRouteOptions(fromLocation, toLocation);
      setRoutes(routeOptions);
    } catch (err) {
      setError('Failed to find routes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start navigation
  const handleStartNavigation = (route) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  // Back from navigation
  const handleBackFromNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        ...getThemeStyles()
      }}>
        <span style={getTextStyles('primary')}>Loading...</span>
      </div>
    );
  }

  // Show navigation view when navigating
  if (isNavigating && selectedRoute) {
    return (
      <NavigationView
        route={selectedRoute}
        onBack={handleBackFromNavigation}
      />
    );
  }

  return (
    <div style={{ ...getThemeStyles(), paddingBottom: 80 }}>
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

      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 20,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'white'
          }}>
            <FontAwesomeIcon icon={faCompass} /> Navigate Chennai
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-secondary)',
            lineHeight: 'var(--line-height-normal)',
            opacity: 0.9,
            color: 'white'
          }}>
            Find accessible routes with real-time navigation
          </p>
        </section>

        {/* Transportation Mode Tabs */}
        <section style={{
          ...getCardStyles(),
          padding: 0,
          borderRadius: 16,
          marginBottom: 20,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: preferences.theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
            borderRadius: '16px 16px 0 0'
          }}>
            <button
              onClick={() => setTransportMode('general')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'general' 
                  ? (preferences.theme === 'dark' ? '#404040' : '#ffffff')
                  : 'transparent',
                color: transportMode === 'general'
                  ? (preferences.theme === 'dark' ? '#ffffff' : '#2c3e50')
                  : (preferences.theme === 'dark' ? '#888' : '#666'),
                fontWeight: transportMode === 'general' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: transportMode === 'general' ? '16px 0 0 0' : '0',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faCar} />
              General Routes
            </button>
            
            <button
              onClick={() => setTransportMode('metro')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'metro' 
                  ? (preferences.theme === 'dark' ? '#404040' : '#ffffff')
                  : 'transparent',
                color: transportMode === 'metro'
                  ? (preferences.theme === 'dark' ? '#ffffff' : '#2c3e50')
                  : (preferences.theme === 'dark' ? '#888' : '#666'),
                fontWeight: transportMode === 'metro' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faTrain} />
              Chennai Metro
            </button>
            
            <button
              onClick={() => setTransportMode('bus')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'bus' 
                  ? (preferences.theme === 'dark' ? '#404040' : '#ffffff')
                  : 'transparent',
                color: transportMode === 'bus'
                  ? (preferences.theme === 'dark' ? '#ffffff' : '#2c3e50')
                  : (preferences.theme === 'dark' ? '#888' : '#666'),
                fontWeight: transportMode === 'bus' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: transportMode === 'bus' ? '0 16px 0 0' : '0',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faBus} />
              Bus Routes
            </button>
          </div>
        </section>

        {/* Conditional Content Based on Transport Mode */}
        {transportMode === 'metro' ? (
          <MetroNavigation />
        ) : transportMode === 'bus' ? (
          <MTCBusNavigation />
        ) : (
          // General Routes Content (existing functionality)
          <>
            {/* Location Input */}
            <section style={{ 
              ...getCardStyles(),
              padding: 24, 
              borderRadius: 16, 
              marginBottom: 20 
            }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: 20, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            Plan Your Route
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gap: 16, 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                ...getTextStyles('primary')
              }}>
                From
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    ref={fromInputRef}
                    type="text"
                    value={fromLocation}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFromLocation(value);
                      const filtered = LocationService.getLocationSuggestions(value);
                      setSuggestions(prev => ({ ...prev, from: filtered }));
                      setActiveInput('from');
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      const filtered = LocationService.getLocationSuggestions(fromLocation || '');
                      setSuggestions(prev => ({ ...prev, from: filtered }));
                      setActiveInput('from');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInput('from');
                    }}
                    placeholder="Enter starting location"
                    className="modern-input"
                    style={{
                      flex: 1,
                      boxSizing: 'border-box',
                      padding: '12px',
                      border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: preferences.theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      color: preferences.theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'var(--font-ui)',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                  
                  {isVoiceMode && (
                    <button
                      onClick={() => {
                        setVoiceInputMode('from');
                        speak('Please say your starting location');
                        setFromLocation('');
                        setTimeout(() => {
                          setupLocationVoiceRecognition('from');
                        }, 2000);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: voiceInputMode === 'from' ? 'var(--accent-color)' : 'rgba(25, 118, 210, 0.1)',
                        color: voiceInputMode === 'from' ? 'white' : 'var(--accent-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '44px',
                        transition: 'all 0.3s'
                      }}
                      title="Voice input for starting location"
                    >
                      <FontAwesomeIcon 
                        icon={faMicrophone} 
                        style={{
                          animation: voiceInputMode === 'from' ? 'pulse 1s infinite' : 'none'
                        }}
                      />
                    </button>
                  )}
                </div>
                
                {suggestions.from.length > 0 && activeInput === 'from' && (
                  <div 
                    ref={fromSuggestionsRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: preferences.theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      zIndex: 9999,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}
                  >
                    {suggestions.from.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromLocation(suggestion);
                          setSuggestions(prev => ({ ...prev, from: [] }));
                          setActiveInput(null);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = preferences.theme === 'dark' ? '#404040' : '#f0f0f0';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.from.length - 1 
                            ? `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e8e8e8'}` 
                            : 'none',
                          color: preferences.theme === 'dark' ? '#ffffff' : '#333333',
                          backgroundColor: 'transparent',
                          fontSize: '14px',
                          fontFamily: 'var(--font-ui)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={faMapMarkerAlt} 
                          style={{ 
                            color: preferences.theme === 'dark' ? '#888' : '#666',
                            fontSize: '12px',
                            minWidth: '12px'
                          }} 
                        />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                ...getTextStyles('primary')
              }}>
                To
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    ref={toInputRef}
                    type="text"
                    value={toLocation}
                    onChange={(e) => {
                      const value = e.target.value;
                      setToLocation(value);
                      const filtered = LocationService.getLocationSuggestions(value);
                      setSuggestions(prev => ({ ...prev, to: filtered }));
                      setActiveInput('to');
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      const filtered = LocationService.getLocationSuggestions(toLocation || '');
                      setSuggestions(prev => ({ ...prev, to: filtered }));
                      setActiveInput('to');
                    }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInput('to');
                  }}
                  placeholder="Enter destination"
                  className="modern-input"
                  style={{
                    flex: 1,
                    boxSizing: 'border-box',
                    padding: '12px',
                    border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: preferences.theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    color: preferences.theme === 'dark' ? '#ffffff' : '#000000',
                    fontFamily: 'var(--font-ui)',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                
                {isVoiceMode && (
                  <button
                    onClick={() => {
                      setVoiceInputMode('to');
                      speak('Please say your destination');
                      setToLocation('');
                      setTimeout(() => {
                        setupLocationVoiceRecognition('to');
                      }, 2000);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: voiceInputMode === 'to' ? 'var(--accent-color)' : 'rgba(25, 118, 210, 0.1)',
                      color: voiceInputMode === 'to' ? 'white' : 'var(--accent-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      transition: 'all 0.3s'
                    }}
                    title="Voice input for destination"
                  >
                    <FontAwesomeIcon 
                      icon={faMicrophone} 
                      style={{
                        animation: voiceInputMode === 'to' ? 'pulse 1s infinite' : 'none'
                      }}
                    />
                  </button>
                )}
              </div>
                
                {suggestions.to.length > 0 && activeInput === 'to' && (
                  <div 
                    ref={toSuggestionsRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: preferences.theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      zIndex: 9999,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}
                  >
                    {suggestions.to.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setToLocation(suggestion);
                          setSuggestions(prev => ({ ...prev, to: [] }));
                          setActiveInput(null);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = preferences.theme === 'dark' ? '#404040' : '#f0f0f0';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.to.length - 1 
                            ? `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e8e8e8'}` 
                            : 'none',
                          color: preferences.theme === 'dark' ? '#ffffff' : '#333333',
                          backgroundColor: 'transparent',
                          fontSize: '14px',
                          fontFamily: 'var(--font-ui)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={faMapMarkerAlt} 
                          style={{ 
                            color: preferences.theme === 'dark' ? '#888' : '#666',
                            fontSize: '12px',
                            minWidth: '12px'
                          }} 
                        />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: 12, 
              marginBottom: 16, 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              borderRadius: 8,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={isLoading || !fromLocation || !toLocation}
            style={{
              ...getButtonStyles('primary'),
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (isLoading || !fromLocation || !toLocation) ? 0.6 : 1,
              cursor: (isLoading || !fromLocation || !toLocation) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Searching...' : <><FontAwesomeIcon icon={faSearch} /> Find Routes</>}
          </button>
        </section>

        {/* Route Results */}
        {routes.length > 0 && (
          <section style={{ 
            ...getCardStyles(),
            padding: 24, 
            borderRadius: 16, 
            marginBottom: 20 
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              fontSize: 20, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Route Options
            </h2>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {routes.map((route, index) => (
                <div key={index} style={{
                  ...getCardStyles(),
                  padding: 20,
                  border: selectedRoute === route 
                    ? '2px solid #007bff' 
                    : `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedRoute(route)}
                >
                    {/* Route Info Block */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: 12
                    }}>
                      <div>
                        <h3 style={{ 
                          margin: '0 0 4px 0', 
                          fontSize: 16, 
                          fontWeight: 600,
                          ...getTextStyles('primary')
                        }}>
                          {route.mode} Route
                        </h3>
                        <p style={{ 
                          margin: 0, 
                          fontSize: 14,
                          ...getTextStyles('secondary')
                        }}>
                          {route.duration} • {route.distance} • {route.cost}
                        </p>
                      </div>
                      <div style={{ 
                        textAlign: 'right',
                        fontSize: 12
                      }}>
                        <div style={{ 
                          color: route.accessibilityScore >= 80 ? '#4caf50' : 
                                route.accessibilityScore >= 60 ? '#ff9800' : '#f44336',
                          fontWeight: 600
                        }}>
                          {route.accessibilityScore}% Accessible
                        </div>
                      </div>
                    </div>
                    {/* Steps Info Block (no navigation button) */}
                    <div style={{ 
                      display: 'flex', 
                      gap: 8, 
                      justifyContent: 'flex-start',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        fontSize: 12,
                        ...getTextStyles('secondary')
                      }}>
                        {route.steps?.length || 0} steps
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </main>
    </div>
  );
};

export default Navigate;
