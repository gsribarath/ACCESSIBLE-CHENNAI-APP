import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Icons have been removed

function Navigation({ showBottomNav = true, user = null, onLogout = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Navigate', path: '/navigate' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Community', path: '/community' },
    { label: 'Settings', path: '/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header style={{ 
        background: '#fff', 
        padding: '12px 20px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
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
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>AC</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, color: '#1976d2', fontWeight: 600 }}>
            Accessible Chennai
          </h1>
        </div>
        
        {user && onLogout && (
          <button 
            onClick={onLogout}
            style={{ 
              background: 'none', 
              border: '1px solid #ddd', 
              padding: '8px 16px', 
              borderRadius: 6, 
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: 14
            }}
            onMouseOver={e => {
              e.target.style.background = '#f5f5f5';
              e.target.style.borderColor = '#1976d2';
            }}
            onMouseOut={e => {
              e.target.style.background = 'none';
              e.target.style.borderColor = '#ddd';
            }}
          >
            Logout
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
          background: '#fff',
          borderTop: '1px solid #eee',
          padding: '8px 0',
          display: 'flex',
          justifyContent: 'space-around',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
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
                  color: active ? '#1976d2' : '#666',
                  fontSize: 12,
                  transition: 'all 0.2s',
                  borderRadius: 8,
                  minWidth: 60
                }}
                onMouseOver={e => {
                  if (!active) {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.color = '#1976d2';
                  }
                }}
                onMouseOut={e => {
                  if (!active) {
                    e.target.style.background = 'none';
                    e.target.style.color = '#666';
                  }
                }}
              >
                <span style={{ 
                  fontWeight: active ? '600' : '400',
                  fontSize: 14,
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s'
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
