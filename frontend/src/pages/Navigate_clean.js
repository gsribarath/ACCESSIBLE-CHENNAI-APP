import React, { useState, useEffect, useContext } from 'react';
import Navigation from '../components/Navigation';
import LocationService from '../services/LocationService';
import { PreferencesContext } from '../context/PreferencesContext';

const Navigate = () => {
  const { theme } = useContext(PreferencesContext);
  const [user] = useState({ name: 'User' });
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });

  const handleLogout = () => {
    console.log('Logout');
  };

  // Get theme styles
  const getThemeStyles = () => ({
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    minHeight: '100vh'
  });

  const getCardStyles = () => ({
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
    borderRadius: '12px',
    boxShadow: theme === 'dark' 
      ? '0 4px 8px rgba(0,0,0,0.3)' 
      : '0 2px 8px rgba(0,0,0,0.1)'
  });

  const getTextStyles = (type) => ({
    color: type === 'primary' 
      ? (theme === 'dark' ? '#ffffff' : '#000000')
      : (theme === 'dark' ? '#cccccc' : '#666666')
  });

  const getButtonStyles = (variant) => {
    const baseStyles = {
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: '#007bff',
          color: 'white'
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`
        };
      default:
        return baseStyles;
    }
  };

  // Location Dropdown Component
  const LocationDropdown = ({ value, onChange, placeholder, suggestions, onInputChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onInputChange(newValue);
      setIsOpen(newValue.length > 0);
    };

    const handleSelect = (suggestion) => {
      setInputValue(suggestion);
      onChange(suggestion);
      setIsOpen(false);
    };

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}
          onFocus={() => setIsOpen(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        
        {isOpen && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelect(suggestion)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 
                    ? `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}` 
                    : 'none',
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme === 'dark' ? '#404040' : '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Enhanced Interactive Map Component
  const SimpleMap = ({ route }) => {
    const [animationProgress, setAnimationProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setAnimationProgress(prev => (prev + 1) % 100);
      }, 100);
      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{
        ...getCardStyles(),
        padding: 0,
        marginBottom: 16,
        overflow: 'hidden',
        borderRadius: 16
      }}>
        <div style={{
          height: 250,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Map Header */}
          <div style={{
            padding: 12,
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🗺️</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Route Map</span>
            </div>
            {route && (
              <div style={{ fontSize: 12 }}>
                {route.duration} • {route.cost}
              </div>
            )}
          </div>
          
          {/* Route Visualization */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 20,
            position: 'relative'
          }}>
            {route ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                color: 'white',
                textAlign: 'center'
              }}>
                {/* Route Path */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 24
                }}>
                  <div style={{
                    background: '#4caf50',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    animation: 'pulse 2s infinite'
                  }} />
                  
                  <div style={{
                    width: 120,
                    height: 3,
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: '30%',
                      background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                      borderRadius: 2,
                      transform: `translateX(${animationProgress * 2}%)`,
                      transition: 'transform 0.1s ease'
                    }} />
                  </div>
                  
                  <div style={{
                    background: '#ff5722',
                    borderRadius: '50%',
                    width: 16,
                    height: 16
                  }} />
                </div>
                
                {/* Route Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '12px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {route.mode} Route: {route.distance}
                </div>
                
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Accessibility Score: {route.accessibilityScore}%
                </div>
              </div>
            ) : (
              <div style={{
                color: 'white',
                textAlign: 'center',
                opacity: 0.7
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                <div style={{ fontSize: 14 }}>Select route to view map</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                ▶️ Start Navigation
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
                ⏹️ Stop
              </button>
            )}
          </div>
        </div>

        {/* Interactive Navigation Map */}
        <div style={{
          ...getCardStyles(),
          padding: 0,
          marginBottom: 16,
          overflow: 'hidden',
          borderRadius: 16
        }}>
          <div style={{
            height: 300,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Map Header */}
            <div style={{
              padding: 12,
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🗺️</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Live Navigation</span>
                {isNavigating && (
                  <span style={{
                    background: '#4caf50',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 600,
                    animation: 'blink 1s infinite'
                  }}>
                    LIVE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12 }}>
                Step {currentStep + 1} of {route.steps?.length || 0}
              </div>
            </div>
            
            {/* Navigation Progress */}
            <div style={{
              padding: '0 12px 12px 12px'
            }}>
              <div style={{
                width: '100%',
                height: 4,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: isNavigating ? 'linear-gradient(90deg, #4caf50, #8bc34a)' : '#4caf50',
                  transition: 'width 0.5s ease',
                  borderRadius: 2
                }} />
              </div>
            </div>
            
            {/* Route Visualization */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                color: 'white'
              }}>
                {/* Current Step Indicator */}
                <div style={{
                  background: isNavigating ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'center',
                  minWidth: 200,
                  border: isNavigating ? '2px solid #4caf50' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isNavigating ? '0 0 20px rgba(76, 175, 80, 0.5)' : 'none'
                }}>
                  {isNavigating ? '🚶‍♂️ ' : '📍 '}
                  {route.steps?.[currentStep] || 'Ready to navigate'}
                </div>
                
                {/* Progress Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 12
                }}>
                  <span>🚩 Start</span>
                  <div style={{
                    width: 100,
                    height: 2,
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 1,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${progress}%`,
                      top: -4,
                      width: 10,
                      height: 10,
                      background: isNavigating ? '#4caf50' : '#fff',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      animation: isNavigating ? 'pulse 1s infinite' : 'none'
                    }} />
                  </div>
                  <span>🎯 Destination</span>
                </div>
                
                {/* Status */}
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {isNavigating ? `${Math.round(progress)}% Complete` : 'Tap Start Navigation to begin'}
                </div>
              </div>
            </div>
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
              <h3 style={{ 
                margin: 0, 
                fontSize: 16, 
                fontWeight: 600,
                ...getTextStyles('primary')
              }}>
                Step {currentStep + 1} of {route.steps?.length || 0}
              </h3>
              {isNavigating && (
                <div style={{
                  background: '#4caf50',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 4,
                  display: 'inline-block'
                }}>
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

  // Handle input changes and get suggestions
  const handleFromInputChange = (value) => {
    setFromLocation(value);
    if (value.length > 0) {
      const filtered = LocationService.getLocationSuggestions(value);
      setSuggestions(prev => ({ ...prev, from: filtered }));
    } else {
      setSuggestions(prev => ({ ...prev, from: [] }));
    }
  };

  const handleToInputChange = (value) => {
    setToLocation(value);
    if (value.length > 0) {
      const filtered = LocationService.getLocationSuggestions(value);
      setSuggestions(prev => ({ ...prev, to: filtered }));
    } else {
      setSuggestions(prev => ({ ...prev, to: [] }));
    }
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
            fontSize: 28, 
            fontWeight: 700 
          }}>
            🧭 Navigate Chennai
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 16, 
            opacity: 0.9 
          }}>
            Find accessible routes with real-time navigation
          </p>
        </section>

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            marginBottom: 20
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: 500,
                ...getTextStyles('primary')
              }}>
                From
              </label>
              <LocationDropdown
                value={fromLocation}
                onChange={setFromLocation}
                placeholder="Enter starting location"
                suggestions={suggestions.from}
                onInputChange={handleFromInputChange}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: 500,
                ...getTextStyles('primary')
              }}>
                To
              </label>
              <LocationDropdown
                value={toLocation}
                onChange={setToLocation}
                placeholder="Enter destination"
                suggestions={suggestions.to}
                onInputChange={handleToInputChange}
              />
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
              opacity: (isLoading || !fromLocation || !toLocation) ? 0.6 : 1,
              cursor: (isLoading || !fromLocation || !toLocation) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Searching...' : '🔍 Find Routes'}
          </button>
        </section>

        {/* Route Map */}
        {selectedRoute && <SimpleMap route={selectedRoute} />}

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
                    : `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedRoute(route)}
                >
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

                  <div style={{ 
                    display: 'flex', 
                    gap: 8, 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      fontSize: 12,
                      ...getTextStyles('secondary')
                    }}>
                      {route.steps?.length || 0} steps
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartNavigation(route);
                      }}
                      style={{
                        ...getButtonStyles('primary'),
                        padding: '8px 16px',
                        fontSize: 12
                      }}
                    >
                      Start Navigation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {routes.length === 0 && fromLocation && toLocation && !isLoading && (
          <section style={{ 
            ...getCardStyles(),
            padding: 40, 
            borderRadius: 16, 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              No Routes Found
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              Try different locations or check your spelling
            </p>
          </section>
        )}
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Navigate;
