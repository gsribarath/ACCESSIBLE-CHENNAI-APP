import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

function Navigation({ showBottomNav = true, user = null, onLogout = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getText, getButtonStyles, getTextStyles } = usePreferences();

  const navItems = [
    { label: getText('home'), path: '/' },
    { label: getText('navigate'), path: '/navigate' },
    { label: getText('alerts'), path: '/alerts' },
    { label: getText('community'), path: '/community' },
    { label: getText('settings'), path: '/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header style={{ 
        background: 'var(--nav-bg)', 
        padding: '12px 20px', 
        boxShadow: 'var(--shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          {/* Accessibility Logo */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img 
              src="/accessibility-logo.png" 
              alt="Accessible Chennai Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            ...getTextStyles('primary')
          }}>
            Accessible Chennai
          </h1>
        </div>
        
        {user && onLogout && (
          <button 
            onClick={onLogout}
            style={{ 
              ...getButtonStyles('ghost'),
              padding: '8px 16px', 
              borderRadius: 6, 
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--font-weight-medium)',
              letterSpacing: 'var(--letter-spacing-wide)',
              transition: 'all 0.2s'
            }}
          >
            {getText('logout')}
          </button>
        )}
      </header>

      {/* Bottom Navigation */}
      {showBottomNav && user && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--border-color)',
          padding: '8px 0',
          display: 'flex',
          justifyContent: 'space-around',
          boxShadow: 'var(--shadow)',
          zIndex: 1000
        }}>
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  letterSpacing: 'var(--letter-spacing-wide)',
                  transition: 'all 0.2s',
                  borderRadius: 8,
                  minWidth: 60
                }}
                onMouseOver={e => {
                  if (!active) {
                    e.target.style.background = 'var(--border-color)';
                    e.target.style.color = 'var(--accent-color)';
                  }
                }}
                onMouseOut={e => {
                  if (!active) {
                    e.target.style.background = 'none';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ 
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-ui)',
                  letterSpacing: 'var(--letter-spacing-wide)',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}

export default Navigation;
