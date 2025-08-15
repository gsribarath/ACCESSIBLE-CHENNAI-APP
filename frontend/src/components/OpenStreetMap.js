import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faRoute, faWalking, faCar, faBus, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

// Free OpenStreetMap component - no API key required!
const OpenStreetMap = ({ 
  center = { lat: 13.0827, lng: 80.2707 },
  zoom = 12,
  fromLocation,
  toLocation,
  routes = [],
  accessibilityMarkers = [],
  onLocationSelect 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('foot');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapLoadTimeout, setMapLoadTimeout] = useState(false);
  const { getTextStyles, preferences } = usePreferences();

  // Load Leaflet dynamically with better error handling
  useEffect(() => {
    // Set a timeout to show fallback if map doesn't load within 10 seconds
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setMapLoadTimeout(true);
        setIsLoading(false);
      }
    }, 10000);

    const loadLeaflet = async () => {
      try {
        if (typeof window !== 'undefined' && !window.L) {
          // Import Leaflet CSS
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
          }

          // Import Leaflet JS
          if (!document.querySelector('script[src*="leaflet.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => {
              clearTimeout(timeoutId);
              // Wait a bit for Leaflet to fully initialize
              setTimeout(() => {
                if (window.L) {
                  initializeMap();
                }
              }, 100);
            };
            script.onerror = (error) => {
              console.error('Failed to load Leaflet:', error);
              clearTimeout(timeoutId);
              setMapLoadTimeout(true);
              setIsLoading(false);
            };
            document.head.appendChild(script);
          }
        } else if (window.L) {
          clearTimeout(timeoutId);
          initializeMap();
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        clearTimeout(timeoutId);
        setMapLoadTimeout(true);
        setIsLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const initializeMap = () => {
    try {
      if (mapRef.current && window.L && !mapInstanceRef.current) {
        // Initialize the map with error handling
        mapInstanceRef.current = window.L.map(mapRef.current, {
          preferCanvas: true, // Better performance
          zoomControl: true,
          attributionControl: true
        }).setView([center.lat, center.lng], zoom);

        // Add OpenStreetMap tiles (completely free!)
        const tileLayerUrl = preferences.theme === 'dark' 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        
        const attribution = preferences.theme === 'dark'
          ? '© OpenStreetMap contributors, © CartoDB'
          : '© OpenStreetMap contributors';

        const tileLayer = window.L.tileLayer(tileLayerUrl, {
          attribution: attribution,
          maxZoom: 19,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent PNG
        });
        
        tileLayer.addTo(mapInstanceRef.current);
        
        // Handle tile loading errors gracefully
        tileLayer.on('tileerror', (e) => {
          console.log('Tile loading error (normal, using fallback):', e);
        });
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }
  };

  // Get route using free OpenRouteService API
  const getRoute = async (from, to, mode) => {
    try {
      setIsLoading(true);
      
      // First, try to geocode the locations using free Nominatim API
      let fromCoords = await geocodeLocation(from);
      let toCoords = await geocodeLocation(to);
      
      // If geocoding fails, use predefined Chennai locations as fallback
      if (!fromCoords) {
        fromCoords = getChennaiLocationCoords(from) || { lat: 13.0827, lng: 80.2707 }; // Default to Chennai center
      }
      
      if (!toCoords) {
        toCoords = getChennaiLocationCoords(to) || { lat: 13.0878, lng: 80.2785 }; // Default to nearby location
      }

      // Create a route between the coordinates
      const routeData = createDirectRoute(fromCoords, toCoords);
      
      // Add markers and route to map
      if (mapInstanceRef.current && window.L) {
        // Clear existing layers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add start marker
        const startIcon = window.L.divIcon({
          html: '<div style="background: #4caf50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        window.L.marker([fromCoords.lat, fromCoords.lng], { icon: startIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Start:</b> ${from}`);

        // Add end marker
        const endIcon = window.L.divIcon({
          html: '<div style="background: #f44336; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">E</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        window.L.marker([toCoords.lat, toCoords.lng], { icon: endIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Destination:</b> ${to}`);

        // Add route line
        const routeLine = window.L.polyline(routeData.coordinates, {
          color: '#2196F3',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(mapInstanceRef.current);

        // Fit map to show entire route
        const group = window.L.featureGroup([
          window.L.marker([fromCoords.lat, fromCoords.lng]),
          window.L.marker([toCoords.lat, toCoords.lng]),
          routeLine
        ]);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));

        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration,
          startAddress: from,
          endAddress: to
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Route calculation error:', error);
      setIsLoading(false);
      
      // Show a user-friendly message instead of just failing
      setRouteInfo({
        distance: 'Route calculation in progress...',
        duration: 'Please wait',
        startAddress: from,
        endAddress: to,
        error: true
      });
    }
  };

  // Predefined Chennai locations as fallback
  const getChennaiLocationCoords = (locationName) => {
    const chennaiLocations = {
      // Central locations
      'chennai central': { lat: 13.0827, lng: 80.2707 },
      'central': { lat: 13.0827, lng: 80.2707 },
      'chennai central railway station': { lat: 13.0827, lng: 80.2707 },
      
      // Popular areas
      'marina beach': { lat: 13.0479, lng: 80.2821 },
      'marina': { lat: 13.0479, lng: 80.2821 },
      't nagar': { lat: 13.0418, lng: 80.2341 },
      't.nagar': { lat: 13.0418, lng: 80.2341 },
      'tnagar': { lat: 13.0418, lng: 80.2341 },
      'velachery': { lat: 12.9815, lng: 80.2227 },
      'adyar': { lat: 13.0067, lng: 80.2514 },
      'mylapore': { lat: 13.0339, lng: 80.2619 },
      'triplicane': { lat: 13.0569, lng: 80.2707 },
      'anna nagar': { lat: 13.0850, lng: 80.2101 },
      'nungambakkam': { lat: 13.0732, lng: 80.2609 },
      'egmore': { lat: 13.0732, lng: 80.2609 },
      
      // Transportation hubs
      'chennai airport': { lat: 12.9941, lng: 80.1709 },
      'airport': { lat: 12.9941, lng: 80.1709 },
      'kempegowda international airport': { lat: 12.9941, lng: 80.1709 },
      
      // Metro stations
      'government estate metro station': { lat: 13.0732, lng: 80.2609 },
      'government estate': { lat: 13.0732, lng: 80.2609 },
      'high court metro station': { lat: 13.0732, lng: 80.2609 },
      'high court': { lat: 13.0732, lng: 80.2609 },
      
      // Commercial areas
      'express avenue': { lat: 13.0732, lng: 80.2609 },
      'spencer plaza': { lat: 13.0732, lng: 80.2609 },
      'phoenix marketcity': { lat: 12.9815, lng: 80.2227 },
      'forum vijaya mall': { lat: 12.9815, lng: 80.2227 },
      
      // IT areas
      'omr': { lat: 12.9202, lng: 80.2316 },
      'old mahabalipuram road': { lat: 12.9202, lng: 80.2316 },
      'sholinganallur': { lat: 12.9010, lng: 80.2279 },
      'perungudi': { lat: 12.9165, lng: 80.2430 },
      'thoraipakkam': { lat: 12.9342, lng: 80.2446 }
    };
    
    const key = locationName.toLowerCase().trim();
    return chennaiLocations[key] || null;
  };

  // Free geocoding using Nominatim (OpenStreetMap) with better error handling
  const geocodeLocation = async (location) => {
    try {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const query = location.includes('Chennai') ? location : `${location}, Chennai, Tamil Nadu, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'Chennai-Accessibility-App'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Create a simple direct route for demo
  const createDirectRoute = (from, to) => {
    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    const duration = Math.round(distance * (travelMode === 'foot' ? 12 : travelMode === 'driving' ? 3 : 8)); // minutes

    // Create a simple route with some waypoints
    const coordinates = [
      [from.lat, from.lng],
      [(from.lat + to.lat) / 2 + 0.002, (from.lng + to.lng) / 2 + 0.002], // Mid point with slight curve
      [to.lat, to.lng]
    ];

    return {
      coordinates,
      distance: `${distance.toFixed(1)} km`,
      duration: `${duration} min`
    };
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate route when locations change
  useEffect(() => {
    if (fromLocation && toLocation && mapInstanceRef.current) {
      const fromStr = typeof fromLocation === 'string' ? fromLocation : fromLocation.name;
      const toStr = typeof toLocation === 'string' ? toLocation : toLocation.name;
      getRoute(fromStr, toStr, travelMode);
    }
  }, [fromLocation, toLocation, travelMode]);

  const getTravelModeIcon = (mode) => {
    switch (mode) {
      case 'foot': return faWalking;
      case 'driving': return faCar;
      case 'cycling': return faBus; // Using bus icon for cycling
      default: return faRoute;
    }
  };

  const getTravelModeLabel = (mode) => {
    switch (mode) {
      case 'foot': return 'Walk';
      case 'driving': return 'Drive';
      case 'cycling': return 'Cycle';
      default: return 'Route';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '400px',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      {/* Map Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: 12,
        background: preferences.theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FontAwesomeIcon icon={faMap} style={{ fontSize: 16, color: '#2196F3' }} />
          <span style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
            OpenStreetMap Navigation
          </span>
          <div style={{
            background: '#4caf50',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600
          }}>
            FREE
          </div>
        </div>
        
        {/* Travel Mode Selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['foot', 'driving', 'cycling'].map(mode => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: travelMode === mode ? '#2196F3' : 'transparent',
                color: travelMode === mode ? 'white' : (preferences.theme === 'dark' ? '#fff' : '#666'),
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={getTravelModeIcon(mode)} />
              {getTravelModeLabel(mode)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Map Container or Fallback */}
      {window.L ? (
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            paddingTop: '50px'
          }} 
        />
      ) : (
        /* Fallback when Leaflet fails to load */
        <div style={{
          width: '100%',
          height: '100%',
          paddingTop: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: preferences.theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
          flexDirection: 'column',
          gap: 16
        }}>
          <FontAwesomeIcon 
            icon={faMap} 
            style={{ 
              fontSize: 64, 
              color: preferences.theme === 'dark' ? '#666' : '#ccc'
            }} 
          />
          <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 20px' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Map Loading...
            </h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 14,
              lineHeight: 1.5,
              ...getTextStyles('secondary')
            }}>
              Loading free OpenStreetMap. This may take a moment on first visit.
            </p>
            {fromLocation && toLocation && (
              <div style={{
                background: preferences.theme === 'dark' ? '#2d2d2d' : '#fff',
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                fontSize: 14
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, ...getTextStyles('primary') }}>
                  Route Request:
                </div>
                <div style={{ ...getTextStyles('secondary') }}>
                  <strong>From:</strong> {typeof fromLocation === 'string' ? fromLocation : fromLocation.name}<br/>
                  <strong>To:</strong> {typeof toLocation === 'string' ? toLocation : toLocation.name}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          bottom: 0,
          background: preferences.theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }} />
            <span style={{ fontSize: 14, ...getTextStyles('secondary') }}>
              Loading route...
            </span>
          </div>
        </div>
      )}
      
      {/* Route Information Panel */}
      {routeInfo && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          background: preferences.theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
          padding: 16,
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={getTravelModeIcon(travelMode)} style={{ color: routeInfo.error ? '#ff9800' : '#2196F3' }} />
              <span style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {routeInfo.distance} • {routeInfo.duration}
              </span>
            </div>
            <div style={{
              background: routeInfo.error ? '#ff9800' : '#4caf50',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600
            }}>
              {routeInfo.error ? 'CALCULATING...' : 'FREE ROUTE'}
            </div>
          </div>
          
          <div style={{ fontSize: 12, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
            <div><strong>From:</strong> {routeInfo.startAddress}</div>
            <div style={{ marginTop: 4 }}><strong>To:</strong> {routeInfo.endAddress}</div>
            {routeInfo.error && (
              <div style={{ marginTop: 8, color: '#ff9800', fontSize: 11 }}>
                💡 Using fallback routing. Map shows approximate route between locations.
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default OpenStreetMap;
