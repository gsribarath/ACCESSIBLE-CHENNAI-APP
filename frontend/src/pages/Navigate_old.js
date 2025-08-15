import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import Map from '../components/Map';
import LocationDropdown from '../components/LocationDropdown';
import NavigationView from '../components/NavigationView';
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
  const [frequentDestinations, setFrequentDestinations] = useState([]);
  const [accessibilityMarkers, setAccessibilityMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const navigate = useNavigate();

  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchSavedRoutes();
      loadFrequentDestinations(JSON.parse(userData).user_id);
      loadAccessibilityMarkers();
    }
  }, [navigate]);

  const loadFrequentDestinations = (userId) => {
    const destinations = LocationService.getFrequentDestinations(userId);
    setFrequentDestinations(destinations);
  };

  const loadAccessibilityMarkers = () => {
    const markers = LocationService.getAccessibilityMarkers();
    setAccessibilityMarkers(markers);
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

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) return;
    setLoading(true);
    
    try {
      // Generate route options with accessibility data
      const routeOptions = LocationService.generateRouteOptions(fromLocation, toLocation, filters);
      setRoutes(routeOptions);
      setSelectedRoute(routeOptions[0]);

      // Save as frequent destination
      if (user && toLocation) {
        await LocationService.saveFrequentDestination(user.user_id, toLocation);
        loadFrequentDestinations(user.user_id);
      }

      // Voice announcement if voice mode is enabled
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

  const handleLocationSelect = (location, isFrom = true) => {
    if (isFrom) {
      setFromLocation(location);
    } else {
      setToLocation(location);
    }
  };

  const handleMapLocationSelect = async (latLng) => {
    const location = { lat: latLng.lat(), lng: latLng.lng() };
    const address = await LocationService.reverseGeocode(location.lat, location.lng);
    
    if (!fromLocation) {
      setFromLocation({ ...location, name: address });
    } else if (!toLocation) {
      setToLocation({ ...location, name: address });
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

  const announceRoutes = (routeOptions) => {
    if ('speechSynthesis' in window) {
      const text = `Found ${routeOptions.length} route options. ${routeOptions[0].mode} taking ${routeOptions[0].duration} for ${routeOptions[0].cost}. Accessibility score: ${routeOptions[0].accessibilityScore} percent.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
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

  if (!user) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      ...getThemeStyles()
    }}>
      <span style={getTextStyles('primary')}>{getText('loading')}</span>
    </div>
  );

  // Show navigation view when navigating
  if (isNavigating && selectedRoute) {
    return (
      <NavigationView
        route={selectedRoute}
        fromLocation={fromLocation}
        toLocation={toLocation}
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
            🗺️ {getText('findRoute')}
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 16,
            ...getTextStyles('secondary')
          }}>
            {getText('discoverAccessibleRoutes')}
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
                {getText('from')}
              </label>
              <LocationDropdown
                selectedLocation={fromLocation}
                onLocationSelect={(location) => handleLocationSelect(location, true)}
                placeholder="Select starting location"
                showCurrentLocation={true}
              />
            </div>            {/* To Location */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: 500,
                ...getTextStyles('primary')
              }}>
                {getText('to')}
              </label>
              <LocationDropdown
                selectedLocation={toLocation}
                onLocationSelect={(location) => handleLocationSelect(location, false)}
                placeholder="Select destination"
                showCurrentLocation={false}
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
              {getText('accessibilityRequirements')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Object.entries({
                wheelchair: getText('wheelchairAccess'),
                elevator: getText('elevatorAvailable'),
                audio: getText('audioAnnouncements'),
                braille: getText('brailleTactileSigns')
              }).map(([key, label]) => {
                return (
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
              );
              })}
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
            {loading ? getText('searching') : getText('findRoutes')}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: 18, 
                fontWeight: 600,
                ...getTextStyles('primary')
              }}>
                Route Map
              </h3>
            </div>
            
            <Map
              center={fromLocation || currentLocation || { lat: 13.0827, lng: 80.2707 }}
              zoom={fromLocation || currentLocation ? 14 : 12}
              routes={routes}
              fromLocation={fromLocation}
              toLocation={toLocation}
              accessibilityMarkers={accessibilityMarkers}
              onLocationSelect={handleMapLocationSelect}
            />
            
            {accessibilityMarkers.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: 14, 
                  fontWeight: 600,
                  ...getTextStyles('primary')
                }}>
                  Accessibility Features
                </h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#4caf50' }}>♿</span>
                    <span style={getTextStyles('secondary')}>Wheelchair Access</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#2196f3' }}>🛗</span>
                    <span style={getTextStyles('secondary')}>Elevator</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#ff9800' }}>🔊</span>
                    <span style={getTextStyles('secondary')}>Audio Signals</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#9c27b0' }}>⠃</span>
                    <span style={getTextStyles('secondary')}>Braille</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#f44336' }}>⚠️</span>
                    <span style={getTextStyles('secondary')}>Barriers</span>
                  </div>
                </div>
              </div>
            )}
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
              {getText('availableRoutes')}
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
                      {getText('recommended')}
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
                        {getText('save')}
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
                      {getText('steps')}
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
                      {getText('accessibilityFeatures')}
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
              {getText('yourSavedRoutes')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedRoutes.map(route => (
                <div key={route.id} style={{
                  padding: 16,
                  background: 'var(--card-bg)',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
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
                        {getText('savedOn')} {new Date(route.created_at).toLocaleDateString()}
                      </div>
                      {route.accessibility_filters && Object.values(route.accessibility_filters).some(v => v) && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 12, ...getTextStyles('secondary') }}>{getText('filters')}: </span>
                          {Object.entries(route.accessibility_filters)
                            .filter(([k, v]) => v)
                            .map(([k]) => k)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default NavigatePage;
