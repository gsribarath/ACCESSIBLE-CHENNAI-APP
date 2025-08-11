import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function NavigatePage() {
  const [user, setUser] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState({
    wheelchair: false,
    elevator: false,
    audio: false,
    braille: false
  });
  const [routes, setRoutes] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchSavedRoutes();
    }
  }, [navigate]);

  const fetchSavedRoutes = async () => {
    try {
      const res = await fetch('/api/routes');
      const data = await res.json();
      setSavedRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const handleSearch = async () => {
    if (!from || !to) return;
    setLoading(true);
    // Simulate API call for route search
    setTimeout(() => {
      setRoutes([
        { 
          id: 1, 
          duration: '45 mins', 
          steps: ['Walk 5 mins to Central Metro', 'Blue Line to Guindy (20 mins)', 'Walk 8 mins to destination'],
          accessibility: ['Wheelchair accessible', 'Audio announcements', 'Tactile indicators'],
          cost: '₹25'
        },
        { 
          id: 2, 
          duration: '52 mins', 
          steps: ['Bus 21G to T.Nagar (25 mins)', 'Walk 12 mins to destination'],
          accessibility: ['Low-floor bus', 'Audio announcements'],
          cost: '₹15'
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  const handleSaveRoute = async (route) => {
    if (!user) return;
    try {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          start_location: from,
          destination: to,
          accessibility_filters: filters,
        }),
      });
      fetchSavedRoutes();
      alert('Route saved successfully!');
    } catch (err) {
      console.error('Error saving route:', err);
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: 80 }}>
      <Navigation user={user} onLogout={handleLogout} />

      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 28, fontWeight: 600 }}>
            🗺️ Find Your Route
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
            Discover accessible routes tailored to your needs
          </p>
        </section>

        {/* Search Form */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                From
              </label>
              <input
                type="text"
                placeholder="Enter starting location"
                value={from}
                onChange={e => setFrom(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 16,
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#1976d2';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                To
              </label>
              <input
                type="text"
                placeholder="Enter destination"
                value={to}
                onChange={e => setTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 16,
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#1976d2';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
              />
            </div>
          </div>

          {/* Accessibility Filters */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16, fontWeight: 600 }}>
              Accessibility Requirements
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Object.entries({
                wheelchair: 'Wheelchair Access',
                elevator: 'Elevator Available',
                audio: 'Audio Announcements',
                braille: 'Braille/Tactile Signs'
              }).map(([key, label]) => {
                // Icon components have been removed
                
                return (
                <label key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: filters[key] ? '#e3f2fd' : '#f8f9fa',
                  border: `2px solid ${filters[key] ? '#1976d2' : '#e0e0e0'}`,
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={e => setFilters({...filters, [key]: e.target.checked})}
                    style={{ margin: 0 }}
                  />
                  <span style={{ 
                    fontSize: 14, 
                    color: filters[key] ? '#1976d2' : '#666',
                    fontWeight: 'bold'
                  }}>
                    {key[0].toUpperCase()}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{label}</span>
                </label>
              );
              })}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!from || !to || loading}
            style={{
              background: !from || !to ? '#ccc' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: !from || !to ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: !from || !to ? 'none' : '0 4px 16px rgba(25, 118, 210, 0.3)'
            }}
          >
            {loading ? (
              <>
                Searching...
              </>
            ) : (
              <>
                Find Routes
              </>
            )}
          </button>
        </section>

        {/* Results */}
        {routes.length > 0 && (
          <section style={{ 
            background: '#fff', 
            padding: 24, 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: 24
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 20, fontWeight: 600 }}>
              Available Routes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {routes.map((route, index) => (
                <div key={route.id} style={{
                  padding: 20,
                  background: index === 0 ? '#e8f5e8' : '#f8f9fa',
                  borderRadius: 12,
                  border: `2px solid ${index === 0 ? '#4caf50' : '#e0e0e0'}`,
                  position: 'relative'
                }}>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -8,
                      left: 20,
                      background: '#4caf50',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      RECOMMENDED
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 16, fontWeight: 600 }}>
                        Route {route.id}
                      </h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666' }}>
                        <span>⏱️ {route.duration}</span>
                        <span>💰 {route.cost}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveRoute(route)}
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 14, fontWeight: 600 }}>
                      Steps
                    </h5>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      {route.steps.map((step, i) => (
                        <li key={i} style={{ marginBottom: 4, fontSize: 14, color: '#666' }}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 14, fontWeight: 600 }}>
                      Accessibility Features
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {route.accessibility.map((feature, i) => (
                        <span key={i} style={{
                          background: '#1976d2',
                          color: '#fff',
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <section style={{ 
            background: '#fff', 
            padding: 24, 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 20, fontWeight: 600 }}>
              Your Saved Routes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedRoutes.map(route => (
                <div key={route.id} style={{
                  padding: 16,
                  background: '#f8f9fa',
                  borderRadius: 12,
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 14, fontWeight: 600 }}>
                        {route.start_location} → {route.destination}
                      </h4>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        Saved on {new Date(route.created_at).toLocaleDateString()}
                      </div>
                      {route.accessibility_filters && Object.values(route.accessibility_filters).some(v => v) && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 12, color: '#666' }}>Filters: </span>
                          {Object.entries(route.accessibility_filters)
                            .filter(([k, v]) => v)
                            .map(([k]) => k)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default NavigatePage;
