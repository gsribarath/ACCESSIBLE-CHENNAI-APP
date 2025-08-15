import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

// Interactive Map Component
const InteractiveMapComponent = ({ 
  center, 
  zoom, 
  routes, 
  fromLocation, 
  toLocation, 
  accessibilityMarkers 
}) => {
  const { getTextStyles, preferences } = usePreferences();
  const [animationProgress, setAnimationProgress] = useState(0);
  const currentRoute = routes[0] || null;
  
  // Animation for route visualization
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  // Chennai landmarks for visual representation
  const chennaiBounds = {
    north: 13.2847,
    south: 12.8348,
    east: 80.3317,
    west: 80.1278
  };
  
  // Generate visual route path
  const generateRoutePath = () => {
    if (!currentRoute) return [];
    
    const steps = 8; // Number of route points
    const path = [];
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const lat = chennaiBounds.south + (chennaiBounds.north - chennaiBounds.south) * (0.3 + progress * 0.4);
      const lng = chennaiBounds.west + (chennaiBounds.east - chennaiBounds.west) * (0.2 + progress * 0.6);
      path.push({ lat, lng, step: i });
    }
    
    return path;
  };
  
  const routePath = generateRoutePath();
  
  // Convert coordinates to SVG positions
  const coordToSVG = (lat, lng) => {
    const x = ((lng - chennaiBounds.west) / (chennaiBounds.east - chennaiBounds.west)) * 360;
    const y = ((chennaiBounds.north - lat) / (chennaiBounds.north - chennaiBounds.south)) * 280;
    return { x, y };
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 360 280"
        style={{ 
          background: `linear-gradient(135deg, ${preferences.theme === 'dark' ? '#0f4c75, #3282b8' : '#e3f2fd, #bbdefb'})`,
          display: 'block'
        }}
      >
        {/* Background city grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path 
              d="M 20 0 L 0 0 0 20" 
              fill="none" 
              stroke={preferences.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chennai landmarks */}
        <g>
          {/* Marina Beach */}
          <rect x="280" y="140" width="60" height="8" fill="#4fc3f7" rx="2" />
          <text x="310" y="155" textAnchor="middle" fontSize="8" fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
            Marina Beach
          </text>
          
          {/* Central Railway Station */}
          <rect x="150" y="120" width="12" height="12" fill="#ff7043" rx="2" />
          <text x="156" y="140" textAnchor="middle" fontSize="8" fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
            Central
          </text>
          
          {/* Airport */}
          <circle cx="80" cy="200" r="8" fill="#4caf50" />
          <text x="80" y="215" textAnchor="middle" fontSize="8" fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
            Airport
          </text>
          
          {/* T. Nagar */}
          <rect x="140" y="160" width="20" height="15" fill="#9c27b0" rx="2" />
          <text x="150" y="182" textAnchor="middle" fontSize="8" fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
            T.Nagar
          </text>
        </g>
        
        {/* Route Path */}
        {routePath.length > 1 && (
          <g>
            {/* Route line */}
            <path
              d={`M ${routePath.map(point => {
                const pos = coordToSVG(point.lat, point.lng);
                return `${pos.x},${pos.y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="#2196f3"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8,4"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))'
              }}
            />
            
            {/* Animated progress indicator */}
            {routePath.map((point, index) => {
              const pos = coordToSVG(point.lat, point.lng);
              const isActive = index <= (animationProgress / 100) * (routePath.length - 1);
              return (
                <circle
                  key={index}
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? "4" : "2"}
                  fill={isActive ? "#4caf50" : "#90a4ae"}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isActive ? 'drop-shadow(0 0 6px #4caf50)' : 'none'
                  }}
                />
              );
            })}
            
            {/* Start marker */}
            <g>
              <circle cx={coordToSVG(routePath[0]?.lat, routePath[0]?.lng).x} 
                     cy={coordToSVG(routePath[0]?.lat, routePath[0]?.lng).y} 
                     r="6" fill="#4caf50" stroke="#fff" strokeWidth="2" />
              <text x={coordToSVG(routePath[0]?.lat, routePath[0]?.lng).x} 
                   y={coordToSVG(routePath[0]?.lat, routePath[0]?.lng).y - 12} 
                   textAnchor="middle" fontSize="10" fontWeight="bold"
                   fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
                START
              </text>
            </g>
            
            {/* End marker */}
            <g>
              <circle cx={coordToSVG(routePath[routePath.length-1]?.lat, routePath[routePath.length-1]?.lng).x} 
                     cy={coordToSVG(routePath[routePath.length-1]?.lat, routePath[routePath.length-1]?.lng).y} 
                     r="6" fill="#f44336" stroke="#fff" strokeWidth="2" />
              <text x={coordToSVG(routePath[routePath.length-1]?.lat, routePath[routePath.length-1]?.lng).x} 
                   y={coordToSVG(routePath[routePath.length-1]?.lat, routePath[routePath.length-1]?.lng).y - 12} 
                   textAnchor="middle" fontSize="10" fontWeight="bold"
                   fill={preferences.theme === 'dark' ? '#fff' : '#000'}>
                END
              </text>
            </g>
          </g>
        )}
        
        {/* Accessibility markers */}
        {accessibilityMarkers.map((marker, index) => (
          <g key={index}>
            <circle 
              cx={120 + index * 40} 
              cy={100} 
              r="5" 
              fill="#ff9800" 
              stroke="#fff" 
              strokeWidth="1"
            />
            <text 
              x={120 + index * 40} 
              y={115} 
              textAnchor="middle" 
              fontSize="7"
              fill={preferences.theme === 'dark' ? '#fff' : '#000'}
            >
              ♿
            </text>
          </g>
        ))}
      </svg>
      
      {/* Map overlay info */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        background: preferences.theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        padding: 12,
        borderRadius: 8,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ 
              fontSize: 'var(--font-size-xs)', 
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-ui)',
              ...getTextStyles('primary') 
            }}>
              {(typeof fromLocation === 'string' ? fromLocation : fromLocation?.name) || 'Start'} → {(typeof toLocation === 'string' ? toLocation : toLocation?.name) || 'Destination'}
            </div>
            {currentRoute && (
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                fontFamily: 'var(--font-secondary)',
                ...getTextStyles('secondary'), 
                marginTop: 2 
              }}>
                {currentRoute.distance} • Accessibility: {currentRoute.accessibilityScore || 85}%
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#4caf50',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: 10, ...getTextStyles('secondary') }}>
              Interactive Map
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Map component - using only the interactive map implementation
function Map({ 
  center = { lat: 13.0827, lng: 80.2707 },
  zoom = 12,
  routes = [],
  fromLocation,
  toLocation,
  accessibilityMarkers = [],
  onLocationSelect
}) {
  const { getTextStyles, preferences } = usePreferences();
  
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
        background: preferences.theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${preferences.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FontAwesomeIcon icon={faMap} style={{ fontSize: 16 }} />
          <span style={{ fontSize: 14, fontWeight: 600, ...getTextStyles('primary') }}>
            Interactive Route Map
          </span>
          <div style={{
            background: '#2196F3',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600
          }}>
            LIVE
          </div>
        </div>
        
        {fromLocation && toLocation && (
          <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
            {typeof fromLocation === 'string' ? fromLocation : fromLocation.name} → {typeof toLocation === 'string' ? toLocation : toLocation.name}
          </div>
        )}
      </div>
      
      {/* Map Content */}
      <div style={{ paddingTop: '50px', height: '100%' }}>
        <InteractiveMapComponent
          center={center}
          zoom={zoom}
          routes={routes}
          fromLocation={fromLocation}
          toLocation={toLocation}
          accessibilityMarkers={accessibilityMarkers}
        />
      </div>
    </div>
  );
}

export default Map;
