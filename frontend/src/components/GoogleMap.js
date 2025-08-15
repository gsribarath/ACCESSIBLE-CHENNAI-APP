import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faRoute, faWalking, faCar, faBus } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

const GoogleMap = ({ 
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
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('WALKING');
  const { getTextStyles, preferences } = usePreferences();

  // Initialize Google Map
  useEffect(() => {
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps API not loaded. Please add a valid API key.');
      setIsLoading(false);
      return;
    }

    if (mapRef.current && !mapInstanceRef.current) {
      const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: preferences.theme === 'dark' ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ] : [],
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#2196F3',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      
      directionsRendererRef.current.setMap(mapInstanceRef.current);
      setIsLoading(false);
    }
  }, [center, zoom, preferences.theme]);

  // Calculate and display route when locations change
  useEffect(() => {
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
      setIsLoading(false);
      return;
    }

    if (directionsServiceRef.current && 
        directionsRendererRef.current && 
        fromLocation && 
        toLocation) {
      
      setIsLoading(true);
      
      // Convert location strings to proper format for Google Maps
      const fromLocationStr = typeof fromLocation === 'string' ? fromLocation : fromLocation.name;
      const toLocationStr = typeof toLocation === 'string' ? toLocation : toLocation.name;
      
      // Ensure locations include "Chennai" for better geocoding
      const fromQuery = fromLocationStr.includes('Chennai') ? fromLocationStr : `${fromLocationStr}, Chennai, Tamil Nadu, India`;
      const toQuery = toLocationStr.includes('Chennai') ? toLocationStr : `${toLocationStr}, Chennai, Tamil Nadu, India`;

      const request = {
        origin: fromQuery,
        destination: toQuery,
        travelMode: window.google.maps.TravelMode[travelMode],
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      };

      directionsServiceRef.current.route(request, (result, status) => {
        setIsLoading(false);
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          
          // Extract route information
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
              instruction: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
              distance: step.distance.text,
              duration: step.duration.text
            }))
          });
          
          // Fit map to show entire route
          const bounds = new window.google.maps.LatLngBounds();
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              step.path.forEach(point => {
                bounds.extend(point);
              });
            });
          });
          mapInstanceRef.current.fitBounds(bounds);
          
        } else {
          console.error('Directions request failed due to ' + status);
          setRouteInfo(null);
        }
      });
    }
  }, [fromLocation, toLocation, travelMode]);

  // Add accessibility markers
  useEffect(() => {
    if (mapInstanceRef.current && accessibilityMarkers.length > 0 && window.google && window.google.maps) {
      accessibilityMarkers.forEach(marker => {
        // Use modern AdvancedMarkerElement if available, fallback to deprecated Marker
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: marker.lat || 13.0827, lng: marker.lng || 80.2707 },
            map: mapInstanceRef.current,
            title: marker.title || 'Accessibility Feature'
          });
        } else {
          // Fallback to deprecated Marker for older API versions
          new window.google.maps.Marker({
            position: { lat: marker.lat || 13.0827, lng: marker.lng || 80.2707 },
            map: mapInstanceRef.current,
            title: marker.title || 'Accessibility Feature',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#ff9800',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 12
            }
          });
        }
      });
    }
  }, [accessibilityMarkers]);

  const getTravelModeIcon = (mode) => {
    switch (mode) {
      case 'WALKING': return faWalking;
      case 'DRIVING': return faCar;
      case 'TRANSIT': return faBus;
      default: return faRoute;
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
            {window.google && window.google.maps ? 'Google Maps Navigation' : 'Map Navigation (Demo Mode)'}
          </span>
          <div style={{
            background: window.google && window.google.maps ? '#4caf50' : '#ff9800',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600
          }}>
            {window.google && window.google.maps ? 'LIVE' : 'DEMO'}
          </div>
        </div>
        
        {/* Travel Mode Selector - only show if Google Maps is available */}
        {window.google && window.google.maps && (
          <div style={{ display: 'flex', gap: 4 }}>
            {['WALKING', 'DRIVING', 'TRANSIT'].map(mode => (
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
                {mode === 'WALKING' ? 'Walk' : mode === 'DRIVING' ? 'Drive' : 'Transit'}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Google Map Container or Fallback */}
      {window.google && window.google.maps ? (
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            paddingTop: '50px'
          }} 
        />
      ) : (
        /* Fallback when Google Maps API is not available */
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
              Google Maps API Required
            </h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 14,
              lineHeight: 1.5,
              ...getTextStyles('secondary')
            }}>
              To see real Google Maps with live directions, please add a valid Google Maps API key to the project.
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
      {isLoading && window.google && window.google.maps && (
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
              Loading directions...
            </span>
          </div>
        </div>
      )}
      
      {/* Route Information Panel */}
      {routeInfo && window.google && window.google.maps && (
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
              <FontAwesomeIcon icon={getTravelModeIcon(travelMode)} style={{ color: '#2196F3' }} />
              <span style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
                {routeInfo.distance} • {routeInfo.duration}
              </span>
            </div>
            <div style={{
              background: '#4caf50',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600
            }}>
              Best Route
            </div>
          </div>
          
          <div style={{ fontSize: 12, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
            <div><strong>From:</strong> {routeInfo.startAddress}</div>
            <div style={{ marginTop: 4 }}><strong>To:</strong> {routeInfo.endAddress}</div>
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

export default GoogleMap;
