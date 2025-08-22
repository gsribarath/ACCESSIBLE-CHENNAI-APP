import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHome, faMapMarkedAlt, faExclamationTriangle, faUsers, faCog } from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

function Navigation({ showBottomNav = true, user = null, onLogout = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getText, getButtonStyles, getTextStyles } = usePreferences();
  
  // Mock notification count (in real app, this would come from API or context)
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    // Simulate live notifications (in real app, this would be WebSocket or polling)
    const interval = setInterval(() => {
      // Randomly update notification count to simulate real-time updates
      const randomCount = Math.floor(Math.random() * 10);
      setNotificationCount(randomCount);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
        
        {user && (
          <button 
            onClick={() => navigate('/alerts')}
            style={{ 
              background: 'none',
              border: 'none',
              padding: '8px 12px', 
              borderRadius: 8, 
              fontSize: 'var(--font-size-lg)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="View Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
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
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 20, marginBottom: 2 }} />
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
