import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationArrow, 
  faTimes, 
  faDirections,
  faMapMarkerAlt,
  faCrosshairs,
  faRoute,
  faPlay,
  faStop,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

const FullScreenMap = ({ 
  isOpen, 
  onClose, 
  route, 
  fromLocation, 
  toLocation, 
  onStartNavigation,
  isNavigating,
  onStopNavigation 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { preferences } = usePreferences();

  // Chennai-exclusive locations database with precise coordinates
  const chennaiLocations = {
    // Railway Stations
    'Chennai Central': [13.0827, 80.2707],
    'Central': [13.0827, 80.2707],
    'Egmore': [13.0732, 80.2609],
    'Park Town': [13.0732, 80.2609],
    
    // Major Commercial Areas
    'T.Nagar': [13.0430, 80.2343],
    'T Nagar': [13.0430, 80.2343],
    'Express Avenue': [13.0732, 80.2609],
    'Phoenix MarketCity': [13.0430, 80.2343],
    'Forum Mall': [13.0430, 80.2343],
    
    // Residential Areas
    'Adyar': [13.0067, 80.2566],
    'Velachery': [12.9756, 80.2229],
    'Anna Nagar': [13.0850, 80.2101],
    'Mylapore': [13.0339, 80.2619],
    'Nungambakkam': [13.0626, 80.2423],
    'Vadapalani': [13.0522, 80.2101],
    'Guindy': [13.0067, 80.2206],
    'Tambaram': [12.9249, 80.1000],
    'Chrompet': [12.9516, 80.1462],
    
    // IT Corridor (OMR)
    'OMR': [12.8406, 80.2282],
    'Sholinganallur': [12.9010, 80.2279],
    'Perungudi': [12.9618, 80.2428],
    'Thoraipakkam': [12.9394, 80.2347],
    'Karapakkam': [12.9264, 80.2384],
    
    // Special Locations
    'Airport': [12.9941, 80.1709],
    'Chennai Airport': [12.9941, 80.1709],
    'Marina Beach': [13.0484, 80.2824],
    'ECR': [12.9406, 80.2429],
    
    // Metro Stations
    'Alandur': [12.9516, 80.2006],
    'Koyambedu': [13.0697, 80.1943],
    'Chennai Airport Metro': [12.9941, 80.1709]
  };

  // Get precise coordinates for Chennai locations
  const getLocationCoordinates = useCallback((locationName) => {
    if (!locationName) return [13.0827, 80.2707]; // Default to Chennai Central
    
    const cleanLocation = locationName.toString().trim();
    
    // Direct match
    if (chennaiLocations[cleanLocation]) {
      return chennaiLocations[cleanLocation];
    }
    
    // Case insensitive match
    const exactMatch = Object.keys(chennaiLocations).find(key => 
      key.toLowerCase() === cleanLocation.toLowerCase()
    );
    if (exactMatch) {
      return chennaiLocations[exactMatch];
    }
    
    // Partial match
    const partialMatch = Object.keys(chennaiLocations).find(key => 
      key.toLowerCase().includes(cleanLocation.toLowerCase()) ||
      cleanLocation.toLowerCase().includes(key.toLowerCase())
    );
    if (partialMatch) {
      return chennaiLocations[partialMatch];
    }
    
    return [13.0827, 80.2707]; // Default to Chennai Central
  }, []);

  // Clear map layers
  const clearMapLayers = useCallback(() => {
    if (!mapInstanceRef.current) return;
    
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    
    markersRef.current.forEach(marker => {
      if (marker && mapInstanceRef.current.hasLayer(marker)) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  }, []);

  // Add Chennai route with Leaflet
  const addChennaiRoute = useCallback((startCoords, endCoords) => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      clearMapLayers();

      // Create start marker with custom Chennai icon
      const startIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: #4CAF50;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            position: relative;
          ">
            S
            <div style="
              position: absolute;
              top: -35px;
              left: 50%;
              transform: translateX(-50%);
              background: #4CAF50;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              white-space: nowrap;
              font-weight: 600;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">START</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Create end marker with custom Chennai icon
      const endIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: #F44336;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            position: relative;
          ">
            E
            <div style="
              position: absolute;
              top: -35px;
              left: 50%;
              transform: translateX(-50%);
              background: #F44336;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              white-space: nowrap;
              font-weight: 600;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">END</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Add markers to map
      const startMarker = window.L.marker(startCoords, { icon: startIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;">🚀 START POINT</h4>
            <p style="margin: 0; font-size: 12px; color: #333; font-weight: 600;">${fromLocation}</p>
            <div style="margin-top: 8px; font-size: 10px; color: #666;">Chennai Navigation</div>
          </div>
        `);

      const endMarker = window.L.marker(endCoords, { icon: endIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #F44336; font-size: 14px;">🎯 DESTINATION</h4>
            <p style="margin: 0; font-size: 12px; color: #333; font-weight: 600;">${toLocation}</p>
            <div style="margin-top: 8px; font-size: 10px; color: #666;">Chennai Navigation</div>
          </div>
        `);

      markersRef.current = [startMarker, endMarker];

      // Create realistic Chennai route with curves
      const routeCoordinates = generateChennaiRoute(startCoords, endCoords);
      
      // Create route line with Chennai styling
      const routeLine = window.L.polyline(routeCoordinates, {
        color: isNavigating ? '#007AFF' : '#4285F4',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: isNavigating ? '10, 5' : null
      });

      routeLayerRef.current = routeLine;
      routeLine.addTo(mapInstanceRef.current);

      // Fit map to show the route with proper bounds
      const group = new window.L.featureGroup([startMarker, endMarker, routeLine]);
      mapInstanceRef.current.fitBounds(group.getBounds(), { 
        padding: [50, 50],
        maxZoom: 14 
      });

    } catch (error) {
      console.error('Error adding Chennai route:', error);
    }
  }, [fromLocation, toLocation, isNavigating, clearMapLayers]);

  // Generate realistic Chennai route with proper curves
  const generateChennaiRoute = useCallback((start, end) => {
    const coordinates = [start];
    const steps = 12; // More steps for smoother route
    
    // Calculate distance for curve intensity
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    );
    
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      
      // Add realistic Chennai road curves
      const curveIntensity = distance * 0.002; // Adjust curve based on distance
      const curve1 = Math.sin(progress * Math.PI * 2) * curveIntensity;
      const curve2 = Math.cos(progress * Math.PI * 1.5) * curveIntensity * 0.5;
      
      coordinates.push([
        lat + curve1, 
        lng + curve2
      ]);
    }
    
    coordinates.push(end);
    return coordinates;
  }, []);

  // Initialize Chennai-focused Leaflet Map
  const initializeChennaiMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current || !window.L) return;

    try {
      const startCoords = getLocationCoordinates(fromLocation);
      const endCoords = getLocationCoordinates(toLocation);

      // Calculate Chennai center point
      const centerLat = (startCoords[0] + endCoords[0]) / 2;
      const centerLng = (startCoords[1] + endCoords[1]) / 2;

      // Create Chennai-focused Leaflet map
      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.5,
        wheelPxPerZoomLevel: 100,
        doubleClickZoom: true,
        maxBounds: [
          [12.7, 79.9],  // Southwest bounds of Chennai
          [13.3, 80.5]   // Northeast bounds of Chennai
        ],
        maxBoundsViscosity: 1.0
      });

      // Add Chennai-optimized tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | Chennai Navigation',
        detectRetina: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(mapInstanceRef.current);

      // Add custom zoom control
      window.L.control.zoom({ 
        position: 'bottomright',
        zoomInTitle: 'Zoom in to Chennai',
        zoomOutTitle: 'Zoom out of Chennai'
      }).addTo(mapInstanceRef.current);

      // Add Chennai route with delay for smooth loading
      setTimeout(() => {
        addChennaiRoute(startCoords, endCoords);
        setIsMapReady(true);
        setIsLoading(false);
      }, 200);

    } catch (error) {
      console.error('Error initializing Chennai map:', error);
      setMapError(true);
      setIsLoading(false);
    }
  }, [fromLocation, toLocation, getLocationCoordinates, addChennaiRoute]);

  // Load Leaflet API with Chennai optimization
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setIsLoading(true);
    setMapError(false);

    const loadLeafletForChennai = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          cssLink.crossOrigin = '';
          document.head.appendChild(cssLink);
          
          // Wait for CSS to load
          await new Promise(resolve => {
            cssLink.onload = resolve;
            setTimeout(resolve, 500); // Fallback timeout
          });
        }

        // Load Leaflet JavaScript
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize Chennai map after Leaflet loads
        if (mounted && mapRef.current) {
          setTimeout(() => {
            initializeChennaiMap();
          }, 100);
        }

      } catch (error) {
        console.error('Error loading Leaflet for Chennai:', error);
        if (mounted) {
          setMapError(true);
          setIsLoading(false);
        }
      }
    };

    loadLeafletForChennai();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initializeChennaiMap]);

  // Handle navigation start
  const handleStartNavigation = useCallback(() => {
    if (onStartNavigation) onStartNavigation();
    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({ 
        color: '#007AFF', 
        weight: 7,
        dashArray: '10, 5'
      });
    }
  }, [onStartNavigation]);

  // Handle navigation stop
  const handleStopNavigation = useCallback(() => {
    if (onStopNavigation) onStopNavigation();
    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({ 
        color: '#4285F4', 
        weight: 6,
        dashArray: null
      });
    }
  }, [onStopNavigation]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              color: '#666',
              cursor: 'pointer',
              padding: 8
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: 16, 
              fontWeight: 600, 
              color: '#1976D2'
            }}>
              <FontAwesomeIcon icon={faDirections} style={{ marginRight: 8 }} />
              Chennai Navigation
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              {fromLocation} → {toLocation}
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={() => {
              const start = encodeURIComponent(fromLocation);
              const end = encodeURIComponent(toLocation);
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}`, '_blank');
            }}
            style={{
              background: '#4285F4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 6 }} />
            View on Map
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            <div style={{ textAlign: 'center' }}>
              <FontAwesomeIcon 
                icon={faSpinner} 
                spin
                style={{ fontSize: 48, color: '#007AFF', marginBottom: 16 }} 
              />
              <h3 style={{ color: '#333', margin: '0 0 8px 0' }}>Loading Chennai Map</h3>
              <p style={{ color: '#666', margin: 0 }}>Please wait...</p>
            </div>
          </div>
        ) : mapError ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            <div style={{ textAlign: 'center' }}>
              <FontAwesomeIcon 
                icon={faMapMarkerAlt} 
                style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} 
              />
              <h3 style={{ color: '#666', margin: '0 0 8px 0' }}>Map Error</h3>
              <p style={{ color: '#999', margin: 0 }}>Unable to load map</p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        )}

        {/* Route Info */}
        {route && isMapReady && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: 16, 
                  fontWeight: 600, 
                  color: '#1976D2'
                }}>
                  <FontAwesomeIcon icon={faRoute} style={{ marginRight: 8 }} />
                  {route.mode}
                </h4>
                <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                  {route.duration} • {route.distance} • {route.cost}
                </p>
              </div>
              
              {isNavigating && (
                <div style={{
                  background: '#007AFF',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  NAVIGATING
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullScreenMap;
