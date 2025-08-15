import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import LocationService from '../services/LocationService';

function NavigatePage() {
  const [user, setUser] = useState(null);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [filters, setFilters] = useState({
    wheelchair: false,
    elevator: false,
    audio: false,
    braille: false
  });
  const [routes, setRoutes] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState({from: false, to: false});
  const navigate = useNavigate();

  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();

  // Chennai locations database
  const chennaiLocations = [
    // Metro Stations
    { name: 'Chennai Central Metro', category: 'Metro Station', lat: 13.0836, lng: 80.2765 },
    { name: 'Government Estate Metro', category: 'Metro Station', lat: 13.0697, lng: 80.2598 },
    { name: 'LIC Metro', category: 'Metro Station', lat: 13.0653, lng: 80.2548 },
    { name: 'Thousand Lights Metro', category: 'Metro Station', lat: 13.0607, lng: 80.2498 },
    { name: 'Anna Nagar East Metro', category: 'Metro Station', lat: 13.0850, lng: 80.2101 },
    { name: 'Shenoy Nagar Metro', category: 'Metro Station', lat: 13.0789, lng: 80.2289 },
    
    // Shopping Areas
    { name: 'T. Nagar', category: 'Shopping Area', lat: 13.0418, lng: 80.2341 },
    { name: 'Express Avenue Mall', category: 'Shopping Area', lat: 13.0673, lng: 80.2564 },
    { name: 'Phoenix MarketCity', category: 'Shopping Area', lat: 13.0843, lng: 80.2101 },
    { name: 'Spencer Plaza', category: 'Shopping Area', lat: 13.0673, lng: 80.2564 },
    
    // Hospitals
    { name: 'Apollo Hospital Greams Road', category: 'Hospital', lat: 13.0607, lng: 80.2498 },
    { name: 'Apollo Hospital Vanagaram', category: 'Hospital', lat: 13.1298, lng: 80.1547 },
    { name: 'Fortis Malar Hospital', category: 'Hospital', lat: 13.0607, lng: 80.2465 },
    { name: 'Global Hospitals', category: 'Hospital', lat: 13.0298, lng: 80.2198 },
    
    // Tourist Spots
    { name: 'Marina Beach', category: 'Tourist Spot', lat: 13.0487, lng: 80.2824 },
    { name: 'Kapaleeshwarar Temple', category: 'Tourist Spot', lat: 13.0336, lng: 80.2698 },
    { name: 'San Thome Cathedral', category: 'Tourist Spot', lat: 13.0336, lng: 80.2769 },
    { name: 'Government Museum', category: 'Tourist Spot', lat: 13.0673, lng: 80.2598 },
    
    // Transport Hubs
    { name: 'Chennai Central Railway Station', category: 'Transport Hub', lat: 13.0836, lng: 80.2765 },
    { name: 'Chennai Egmore Railway Station', category: 'Transport Hub', lat: 13.0789, lng: 80.2598 },
    { name: 'Chennai International Airport', category: 'Transport Hub', lat: 12.9941, lng: 80.1709 },
    { name: 'Koyambedu Bus Terminus', category: 'Transport Hub', lat: 13.0789, lng: 80.1956 }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchSavedRoutes();
    }
  }, [navigate]);

  const fetchSavedRoutes = async () => {
    try {
      const res = await fetch('/api/routes');
      const data = await res.json();
      setSavedRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const getCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      const address = await LocationService.reverseGeocode(location.lat, location.lng);
      setCurrentLocation(location);
      setFromLocation({...location, name: address});
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get current location: ' + error.message);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) return;
    setLoading(true);
    
    try {
      const routeOptions = LocationService.generateRouteOptions(fromLocation, toLocation, filters);
      setRoutes(routeOptions);
      setSelectedRoute(routeOptions[0]);

      if (voiceMode && routeOptions.length > 0) {
        announceRoutes(routeOptions);
      }
    } catch (error) {
      console.error('Error searching routes:', error);
      alert('Error finding routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const announceRoutes = (routeOptions) => {
    if ('speechSynthesis' in window) {
      const text = `Found ${routeOptions.length} route options. ${routeOptions[0].mode} taking ${routeOptions[0].duration} for ${routeOptions[0].cost}. Accessibility score: ${routeOptions[0].accessibilityScore} percent.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleStartNavigation = (route) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  const handleBackFromNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  const handleSaveRoute = async (route) => {
    if (!user) return;
    try {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          start_location: fromLocation?.name || 'Unknown',
          destination: toLocation?.name || 'Unknown',
          accessibility_filters: filters,
        }),
      });
      fetchSavedRoutes();
      alert('Route saved successfully!');
    } catch (err) {
      console.error('Error saving route:', err);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Metro Station': '🚇',
      'Shopping Area': '🛍️',
      'Hospital': '🏥',
      'Educational Institution': '🎓',
      'IT Park': '🏢',
      'Tourist Spot': '🏛️',
      'Transport Hub': '🚂',
      'Popular Area': '🏘️',
      'Beach': '🏖️'
    };
    return icons[category] || '📍';
  };

  // Location dropdown component
  const LocationDropdown = ({ selectedLocation, onLocationSelect, placeholder, showCurrentLocation, isOpen, setIsOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredLocations = chennaiLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '12px 16px',
            border: '2px solid var(--border-color)',
            borderRadius: 12,
            fontSize: 16,
            transition: 'all 0.2s',
            cursor: 'pointer',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: isOpen ? 'var(--accent-color)' : 'var(--border-color)'
          }}
        >
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            {selectedLocation ? selectedLocation.name : placeholder}
          </span>
          <span style={{
            marginLeft: 8,
            fontSize: 12,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▼
          </span>
        </div>

        {showCurrentLocation && (
          <button
            onClick={getCurrentLocation}
            disabled={gpsLoading}
            style={{
              position: 'absolute',
              right: 40,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 12,
              cursor: gpsLoading ? 'not-allowed' : 'pointer',
              opacity: gpsLoading ? 0.6 : 1,
              zIndex: 10
            }}
            title="Use current location"
          >
            {gpsLoading ? '...' : '📍'}
          </button>
        )}

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            ...getCardStyles(),
            border: '2px solid var(--accent-color)',
            borderRadius: 12,
            maxHeight: 320,
            overflowY: 'auto'
          }}>
            <div style={{ padding: 12, borderBottom: '1px solid var(--border-color)' }}>
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)'
                }}
                autoFocus
              />
            </div>

            {showCurrentLocation && (
              <div
                onClick={getCurrentLocation}
                style={{
                  padding: '12px 16px',
                  cursor: gpsLoading ? 'not-allowed' : 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: gpsLoading ? 'var(--hover-bg)' : 'transparent',
                  opacity: gpsLoading ? 0.6 : 1
                }}
              >
                <span style={{ fontSize: 16 }}>📍</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, ...getTextStyles('primary') }}>
                    {gpsLoading ? 'Getting location...' : 'Use Current Location'}
                  </div>
                  <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                    GPS Location
                  </div>
                </div>
              </div>
            )}

            {filteredLocations.map((location, index) => (
              <div
                key={index}
                onClick={() => {
                  onLocationSelect(location);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < filteredLocations.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 16 }}>
                  {getCategoryIcon(location.category)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, ...getTextStyles('primary') }}>
                    {location.name}
                  </div>
                  <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                    {location.category}
                  </div>
                </div>
              </div>
            ))}

            {filteredLocations.length === 0 && searchTerm && (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                ...getTextStyles('secondary')
              }}>
                No locations found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Enhanced Map component
  const SimpleMap = ({ fromLocation, toLocation, routes }) => {
    const [currentStep, setCurrentStep] = useState(0);
    
    return (
      <div style={{
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid var(--accent-color)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Map Header */}
        <div style={{
          padding: 12,
          background: 'var(--accent-color)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🗺️</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Live Route Map</span>
          </div>
          {routes.length > 0 && (
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12 }}>
              {routes.length} route(s)
            </span>
          )}
        </div>
        
        {/* Map Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {fromLocation && toLocation ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              {/* Route Visualization */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 16
              }}>
                {/* From Location */}
                <div style={{
                  background: '#4caf50',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span>🚩</span>
                  {fromLocation.name?.split(' ')[0] || 'Start'}
                </div>
                
                {/* Route Line */}
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, #4caf50, #2196f3, #ff9800)',
                  width: 100,
                  borderRadius: 1,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ff9800',
                    borderRadius: '50%',
                    width: 10,
                    height: 10,
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
                
                {/* To Location */}
                <div style={{
                  background: '#f44336',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span>🎯</span>
                  {toLocation.name?.split(' ')[0] || 'End'}
                </div>
              </div>
              
              {/* Route Info */}
              <div style={{ fontSize: 14, ...getTextStyles('primary'), marginBottom: 8 }}>
                <strong>Route: </strong>{fromLocation.name} → {toLocation.name}
              </div>
              
              {routes.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 16,
                  fontSize: 12,
                  ...getTextStyles('secondary')
                }}>
                  <span>⏱️ {routes[0].duration}</span>
                  <span>📏 {routes[0].distance}</span>
                  <span>♿ {routes[0].accessibilityScore}%</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🗺️</div>
              <h3 style={{ margin: 0, ...getTextStyles('primary') }}>Interactive Route Map</h3>
              <p style={{ margin: '8px 0 0 0', ...getTextStyles('secondary') }}>
                Select locations to view route
              </p>
            </div>
          )}
        </div>
        
        {/* Animation CSS */}
        <style>{`
          @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); opacity: 1; }
            50% { transform: translateX(-50%) scale(1.2); opacity: 0.7; }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  // Enhanced Navigation View Component with Interactive Map
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
          border: isNavigating ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: isNavigating ? 'var(--accent-color)' : '#ccc',
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
          padding: 20,
          marginBottom: 16
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 16, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            Route Steps
          </h3>
          
          {route.steps && route.steps.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {route.steps.map((step, index) => (
                <li key={index} style={{ 
                  marginBottom: 8, 
                  fontSize: 14, 
                  ...getTextStyles('secondary')
                }}>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <p style={getTextStyles('secondary')}>No steps available</p>
          )}
        </div>

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
            Route Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>⏱️</div>
              <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>Duration</div>
              <div style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {route.duration || 'Unknown'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📏</div>
              <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>Distance</div>
              <div style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {route.distance || 'Unknown'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>💰</div>
              <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>Cost</div>
              <div style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {route.cost || 'Unknown'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>♿</div>
              <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>Accessibility</div>
              <div style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {route.accessibilityScore || 0}%
              </div>
            </div>
          </div>

          {route.accessibility && route.accessibility.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: 14, 
                fontWeight: 600,
                ...getTextStyles('primary')
              }}>
                Accessibility Features
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {route.accessibility.map((feature, i) => (
                  <span key={i} style={{
                    background: 'var(--accent-color)',
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
      </div>
    );
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
          marginBottom: 24
        }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 28, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            🗺️ Find Your Route
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 16,
            ...getTextStyles('secondary')
          }}>
            Discover accessible routes tailored to your needs
          </p>
        </section>

        {/* Search Form */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginBottom: 20 }}>
            {/* From Location */}
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
                selectedLocation={fromLocation}
                onLocationSelect={(location) => setFromLocation(location)}
                placeholder="Select starting location"
                showCurrentLocation={true}
                isOpen={searchOpen.from}
                setIsOpen={(open) => setSearchOpen({...searchOpen, from: open})}
              />
            </div>
            
            {/* To Location */}
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
                selectedLocation={toLocation}
                onLocationSelect={(location) => setToLocation(location)}
                placeholder="Select destination"
                showCurrentLocation={false}
                isOpen={searchOpen.to}
                setIsOpen={(open) => setSearchOpen({...searchOpen, to: open})}
              />
            </div>

            {/* Voice Mode Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                style={{
                  background: voiceMode ? 'var(--accent-color)' : 'transparent',
                  color: voiceMode ? 'white' : 'var(--accent-color)',
                  border: '2px solid var(--accent-color)',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Toggle voice mode"
              >
                🎤
              </button>
              <span style={{ fontSize: 10, marginTop: 4, ...getTextStyles('secondary') }}>
                Voice
              </span>
            </div>
          </div>

          {/* Accessibility Filters */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: 16, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Accessibility Requirements
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Object.entries({
                wheelchair: 'Wheelchair Access',
                elevator: 'Elevator Available',
                audio: 'Audio Announcements',
                braille: 'Braille/Tactile Signs'
              }).map(([key, label]) => (
                <label key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: filters[key] ? 'var(--accent-color)' : 'var(--card-bg)',
                  border: `2px solid ${filters[key] ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  transition: 'all 0.2s',
                  color: filters[key] ? 'var(--card-bg)' : 'var(--text-primary)'
                }}>
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={e => setFilters({...filters, [key]: e.target.checked})}
                    style={{ margin: 0 }}
                  />
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold'
                  }}>
                    {key[0].toUpperCase()}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!fromLocation || !toLocation || loading}
            style={{
              ...getButtonStyles(!fromLocation || !toLocation ? 'ghost' : 'primary'),
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: !fromLocation || !toLocation ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: !fromLocation || !toLocation ? 0.5 : 1
            }}
          >
            {loading ? 'Searching...' : 'Find Routes'}
          </button>
        </section>

        {/* Map Section */}
        {(fromLocation || toLocation || routes.length > 0) && (
          <section style={{ 
            ...getCardStyles(),
            padding: 24, 
            borderRadius: 16,
            marginBottom: 24
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Route Map
            </h3>
            
            <SimpleMap
              fromLocation={fromLocation}
              toLocation={toLocation}
              routes={routes}
            />
          </section>
        )}

        {/* Results */}
        {routes.length > 0 && (
          <section style={{ 
            ...getCardStyles(),
            padding: 24, 
            borderRadius: 16,
            marginBottom: 24
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: 20, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Available Routes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {routes.map((route, index) => (
                <div 
                  key={route.id} 
                  style={{
                    padding: 20,
                    background: index === 0 ? '#e8f5e8' : 'var(--card-bg)',
                    borderRadius: 12,
                    border: `2px solid ${index === 0 ? '#4caf50' : 'var(--border-color)'}`,
                    position: 'relative'
                  }}
                >
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -8,
                      left: 20,
                      background: '#4caf50',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      RECOMMENDED
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: 16, 
                          fontWeight: 600,
                          ...getTextStyles('primary')
                        }}>
                          {route.mode}
                        </h4>
                        <div style={{
                          background: route.accessibilityScore >= 80 ? '#4caf50' : route.accessibilityScore >= 60 ? '#ff9800' : '#f44336',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {route.accessibilityScore}% Accessible
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, fontSize: 14, marginBottom: 8, ...getTextStyles('secondary') }}>
                        <span>⏱️ {route.duration}</span>
                        <span>📏 {route.distance}</span>
                        <span>💰 {route.cost}</span>
                        <span>🌱 {route.carbonFootprint}</span>
                        <span>👥 {route.crowdLevel} crowd</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      {voiceMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if ('speechSynthesis' in window) {
                              const text = `Route ${index + 1}: ${route.mode}, ${route.duration}, ${route.cost}, accessibility score ${route.accessibilityScore} percent`;
                              const utterance = new SpeechSynthesisUtterance(text);
                              speechSynthesis.speak(utterance);
                            }
                          }}
                          style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 8px',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                          title="Read route details"
                        >
                          🔊
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleStartNavigation(route)}
                        style={{
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Start Navigation
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRoute(route);
                        }}
                        style={{
                          ...getButtonStyles('primary'),
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 14, 
                      fontWeight: 600,
                      ...getTextStyles('primary')
                    }}>
                      Steps
                    </h5>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      {route.steps.map((step, i) => (
                        <li key={i} style={{ 
                          marginBottom: 4, 
                          fontSize: 14, 
                          ...getTextStyles('secondary')
                        }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h5 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 14, 
                      fontWeight: 600,
                      ...getTextStyles('primary')
                    }}>
                      Accessibility Features
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {route.accessibility.map((feature, i) => (
                        <span key={i} style={{
                          background: 'var(--accent-color)',
                          color: 'var(--card-bg)',
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <section style={{ 
            ...getCardStyles(),
            padding: 24, 
            borderRadius: 16
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: 20, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Your Saved Routes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedRoutes.map(route => (
                <div key={route.id} style={{
                  padding: 16,
                  background: 'var(--card-bg)',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: 14, 
                        fontWeight: 600,
                        ...getTextStyles('primary')
                      }}>
                        {route.start_location} → {route.destination}
                      </h4>
                      <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                        Saved on {new Date(route.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default NavigatePage;
