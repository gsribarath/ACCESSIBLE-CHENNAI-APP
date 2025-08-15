import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import OpenStreetMap from './OpenStreetMap';

// Main Map component - using FREE OpenStreetMap (no API key needed!)
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
  
  // Check if we have valid from and to locations
  const hasValidLocations = fromLocation && toLocation;
  
  return (
    <div style={{
      width: '100%',
      marginBottom: '20px'
    }}>
      {hasValidLocations ? (
        <OpenStreetMap
          center={center}
          zoom={zoom}
          fromLocation={fromLocation}
          toLocation={toLocation}
          routes={routes}
          accessibilityMarkers={accessibilityMarkers}
          onLocationSelect={onLocationSelect}
        />
      ) : (
        // Fallback when no route is selected
        <div style={{
          width: '100%',
          height: '400px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: preferences.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
        }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <FontAwesomeIcon 
              icon={faMap} 
              style={{ 
                fontSize: 48, 
                color: preferences.theme === 'dark' ? '#666' : '#ccc',
                marginBottom: 16 
              }} 
            />
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Select Route to View Map
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              Enter your starting location and destination to see the route on our FREE map powered by OpenStreetMap
            </p>
            <div style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#4caf50',
              color: 'white',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-block'
            }}>
              🎉 100% FREE - No API Key Required!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
