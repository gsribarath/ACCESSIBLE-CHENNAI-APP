import React from 'react';
import { usePreferences } from '../context/PreferencesContext';

function NavigationView({ route, fromLocation, toLocation, onBack }) {
  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles } = usePreferences();

  // Safety check
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
            {route.mode || 'Navigation'} 
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: 14,
            ...getTextStyles('secondary')
          }}>
            {route.duration || 'Unknown'} • {route.cost || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Simple Steps Display */}
      <div style={{
        ...getCardStyles(),
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

      {/* Route Info */}
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
}

export default NavigationView;
