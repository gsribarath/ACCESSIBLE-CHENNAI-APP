import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapMarkedAlt, faExclamationTriangle, faUsers, faCog } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

function Navigation({ showBottomNav = true, user = null, onLogout = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getText, getButtonStyles, getTextStyles } = usePreferences();

  const navItems = [
    { label: getText('home'), path: '/', icon: faHome },
    { label: getText('navigate'), path: '/navigate', icon: faMapMarkedAlt },
    { label: getText('alerts'), path: '/alerts', icon: faExclamationTriangle },
    { label: getText('community'), path: '/community', icon: faUsers },
    { label: getText('settings'), path: '/settings', icon: faCog }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header style={{ 
        background: 'var(--nav-bg)', 
        padding: window.innerWidth <= 768 ? '10px 16px' : '12px 20px', 
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
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: window.innerWidth <= 768 ? 10 : 12, 
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Accessibility Logo */}
          <div style={{
            width: window.innerWidth <= 768 ? 36 : 40,
            height: window.innerWidth <= 768 ? 36 : 40,
            borderRadius: '50%',
            background: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
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
            fontSize: window.innerWidth <= 768 ? 'var(--font-size-lg)' : 'var(--font-size-xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            ...getTextStyles('primary'),
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {window.innerWidth <= 480 ? 'AC' : 'Accessible Chennai'}
          </h1>
        </div>
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
          padding: window.innerWidth <= 768 ? '6px 0' : '8px 0',
          display: 'flex',
          justifyContent: 'space-around',
          boxShadow: 'var(--shadow)',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)'
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
                  padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
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
                  minWidth: window.innerWidth <= 768 ? 50 : 60,
                  flex: 1,
                  maxWidth: window.innerWidth <= 768 ? 80 : 100,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
                onMouseOver={e => {
                  if (!active && window.innerWidth > 768) {
                    e.target.style.background = 'var(--border-color)';
                    e.target.style.color = 'var(--accent-color)';
                  }
                }}
                onMouseOut={e => {
                  if (!active && window.innerWidth > 768) {
                    e.target.style.background = 'none';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  style={{ 
                    fontSize: window.innerWidth <= 768 ? 18 : 20, 
                    marginBottom: 2 
                  }} 
                />
                <span style={{ 
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  fontSize: window.innerWidth <= 768 ? '0.6875rem' : 'var(--font-size-sm)',
                  fontFamily: 'var(--font-ui)',
                  letterSpacing: 'var(--letter-spacing-wide)',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
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
