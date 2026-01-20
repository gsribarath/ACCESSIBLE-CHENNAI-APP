import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRoute, 
  faMapMarkerAlt, 
  faWalking, 
  faCar, 
  faBus, 
  faTrain,
  faLocationArrow,
  faCompass,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

// Memoized map component to prevent unnecessary re-renders
const EnhancedMap = memo(({ route, fromLocation, toLocation, routeCoordinates, isNavigating, currentStep }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [useVisualMap, setUseVisualMap] = useState(false);
  const { preferences, getTextStyles } = usePreferences();

  // Add CSS for animations
  useEffect(() => {
    if (!document.querySelector('#enhanced-map-styles')) {
      const style = document.createElement('style');
      style.id = 'enhanced-map-styles';
      style.textContent = `
        @keyframes route-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 40; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .route-line {
          animation: route-dash 2s linear infinite;
        }
        .pulse-marker {
          animation: pulse-dot 2s infinite;
        }
        .floating-icon {
          animation: floating 3s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    
    const initializeMap = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        
        // Faster fallback - 2 seconds instead of 3
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('Switching to visual map representation');
            setUseVisualMap(true);
            setIsLoading(false);
          }
        }, 2000);

        if (await loadLeaflet()) {
          clearTimeout(timeoutId);
          if (isMounted) createLeafletMap();
        } else {
          clearTimeout(timeoutId);
          if (isMounted) {
            setUseVisualMap(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Map initialization error:', error);
        clearTimeout(timeoutId);
        setUseVisualMap(true);
        setIsLoading(false);
      }
    };

    const loadLeaflet = async () => {
      try {
        if (window.L) {
          return true;
        }

        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load JS
        return new Promise((resolve) => {
          if (document.querySelector('script[src*="leaflet.js"]')) {
            resolve(!!window.L);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => {
            setTimeout(() => resolve(!!window.L), 200);
          };
          script.onerror = () => resolve(false);
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Leaflet loading error:', error);
        return false;
      }
    };

    const createLeafletMap = () => {
      try {
        if (!mapRef.current || !window.L || mapInstanceRef.current) {
          return;
        }

        const map = window.L.map(mapRef.current).setView([13.0827, 80.2707], 12);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add route visualization
        addRouteVisualization(map);
        
        mapInstanceRef.current = map;
        setMapReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Leaflet map creation error:', error);
        setUseVisualMap(true);
        setIsLoading(false);
      }
    };

    const addRouteVisualization = (map) => {
      if (!window.L) return;

      try {
        // Default Chennai route if no coordinates provided
        const coordinates = routeCoordinates && routeCoordinates.length > 0 
          ? routeCoordinates 
          : [
              { lat: 13.0522, lng: 80.2126 }, // Vadapalani
              { lat: 13.0732, lng: 80.2609 }, // Egmore
              { lat: 13.0827, lng: 80.2707 }, // Chennai Central
              { lat: 13.0430, lng: 80.2422 }  // T.Nagar
            ];

        // Create custom markers
        const startIcon = window.L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 28px; height: 28px; background: #22C55E; 
                border: 4px solid white; border-radius: 50%;
                box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
              "></div>
              <div style="
                position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                background: #059669; color: white; padding: 2px 6px;
                border-radius: 3px; font-size: 10px; font-weight: bold;
                white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              ">START</div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const endIcon = window.L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 28px; height: 28px; background: #EF4444; 
                border: 4px solid white; border-radius: 50%;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
              "></div>
              <div style="
                position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                background: #DC2626; color: white; padding: 2px 6px;
                border-radius: 3px; font-size: 10px; font-weight: bold;
                white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              ">END</div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        // Add markers
        const startMarker = window.L.marker([coordinates[0].lat, coordinates[0].lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 8px; font-family: Arial, sans-serif;">
              <div style="font-weight: bold; color: #059669; margin-bottom: 4px;">Starting Point</div>
              <div style="font-size: 12px; color: #666;">${fromLocation || 'Source Location'}</div>
            </div>
          `);

        const endMarker = window.L.marker([coordinates[coordinates.length - 1].lat, coordinates[coordinates.length - 1].lng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 8px; font-family: Arial, sans-serif;">
              <div style="font-weight: bold; color: #DC2626; margin-bottom: 4px;">Destination</div>
              <div style="font-size: 12px; color: #666;">${toLocation || 'Destination Location'}</div>
            </div>
          `);

        // Add route line
        const routeLine = coordinates.map(coord => [coord.lat, coord.lng]);
        const polyline = window.L.polyline(routeLine, {
          color: '#2563EB',
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isNavigating ? '15, 10' : null
        }).addTo(map);

        // Fit map to route
        const group = new window.L.featureGroup([startMarker, endMarker, polyline]);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });

      } catch (error) {
        console.error('Route visualization error:', error);
      }
    };

    initializeMap();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Map cleanup error:', error);
        }
      }
    };
  }, [routeCoordinates, fromLocation, toLocation, isNavigating]);

  // Visual Map Component (fallback that looks like Google Maps)
  const VisualMap = () => {
    const coordinates = routeCoordinates && routeCoordinates.length > 0 
      ? routeCoordinates 
      : [
          { lat: 13.0522, lng: 80.2126 }, // Vadapalani
          { lat: 13.0732, lng: 80.2609 }, // Egmore
          { lat: 13.0827, lng: 80.2707 }, // Chennai Central
          { lat: 13.0430, lng: 80.2422 }  // T.Nagar
        ];

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #E8F4FD 0%, #D1E7DD 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8
      }}>
        {/* Background grid pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.3
        }} />

        {/* Route path */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          <path
            d={`M 80 120 Q 200 80 320 160 Q 420 200 520 180`}
            stroke="url(#routeGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isNavigating ? "20 10" : "0"}
            className={isNavigating ? "route-line" : ""}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          />
        </svg>

        {/* Start marker */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '12%',
          zIndex: 2
        }}>
          <div className="pulse-marker floating-icon" style={{
            width: 36,
            height: 36,
            background: '#22C55E',
            border: '4px solid white',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <FontAwesomeIcon icon={faFlag} style={{ color: 'white', fontSize: 14 }} />
            <div style={{
              position: 'absolute',
              top: -35,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#059669',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              START
            </div>
          </div>
        </div>

        {/* End marker */}
        <div style={{
          position: 'absolute',
          top: '45%',
          right: '15%',
          zIndex: 2
        }}>
          <div className="pulse-marker floating-icon" style={{
            width: 36,
            height: 36,
            background: '#EF4444',
            border: '4px solid white',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'white', fontSize: 14 }} />
            <div style={{
              position: 'absolute',
              top: -35,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#DC2626',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              END
            </div>
          </div>
        </div>

        {/* Intermediate waypoints */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '35%',
          zIndex: 2
        }}>
          <div style={{
            width: 12,
            height: 12,
            background: '#2563EB',
            border: '2px solid white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
          }} />
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '60%',
          zIndex: 2
        }}>
          <div style={{
            width: 12,
            height: 12,
            background: '#2563EB',
            border: '2px solid white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
          }} />
        </div>

        {/* Route info overlay */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 8,
          padding: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>FROM</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                {fromLocation || 'Starting Point'}
              </div>
            </div>
            
            <div style={{
              flex: 1,
              margin: '0 16px',
              height: 3,
              background: 'linear-gradient(to right, #22C55E, #2563EB, #EF4444)',
              borderRadius: 2,
              position: 'relative'
            }}>
              <FontAwesomeIcon 
                icon={route?.mode?.includes('Bus') ? faBus : 
                      route?.mode?.includes('Metro') ? faTrain : 
                      route?.mode?.includes('Walk') ? faWalking : faCar}
                style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#2563EB',
                  background: 'white',
                  padding: 4,
                  borderRadius: '50%',
                  fontSize: 12,
                  border: '2px solid #2563EB'
                }}
              />
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>TO</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>
                {toLocation || 'Destination'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation status */}
        {isNavigating && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: '#22C55E',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}>
            <div className="pulse-marker">
              <FontAwesomeIcon icon={faLocationArrow} />
            </div>
            NAVIGATING
          </div>
        )}
      </div>
    );
  };

  // Loading component
  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: preferences.theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
        borderRadius: 8
      }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon 
            icon={faCompass} 
            style={{ 
              fontSize: 32, 
              color: '#2563EB',
              marginBottom: 12,
              animation: 'spin 2s linear infinite'
            }} 
          />
          <p style={{ 
            margin: 0, 
            fontSize: 14,
            color: '#666',
            fontWeight: 500
          }}>
            Loading interactive map...
          </p>
        </div>
      </div>
    );
  }

  // Render visual map or leaflet map
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {useVisualMap ? (
        <VisualMap />
      ) : (
        <>
          <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
          
          {/* Map controls overlay */}
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
            minWidth: 160
          }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#2563EB',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FontAwesomeIcon 
                icon={route?.mode?.includes('Bus') ? faBus : 
                      route?.mode?.includes('Metro') ? faTrain : 
                      route?.mode?.includes('Walk') ? faWalking : faCar} 
              />
              {route?.mode || 'Route'}
            </div>
            
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <strong>Duration:</strong> {route?.duration || 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <strong>Distance:</strong> {route?.distance || 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
              <strong>Cost:</strong> {route?.cost || 'N/A'}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default EnhancedMap;
