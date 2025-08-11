import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function Alerts() {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [category, setCategory] = useState('transport');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [metroAlerts, setMetroAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Chennai Metro Lines and Stations
  const metroLines = {
    'Blue Line': {
      color: '#1976d2',
      stations: [
        'Washermanpet', 'Mannadi', 'High Court', 'Central', 'Government Estate',
        'LIC', 'Thousand Lights', 'AG-DMS', 'Teynampet', 'Nandanam',
        'Saidapet', 'Little Mount', 'Guindy', 'Alandur', 'Nanganallur',
        'Meenambakkam', 'Airport'
      ]
    },
    'Green Line': {
      color: '#4caf50',
      stations: [
        'Central', 'Egmore', 'Nehru Park', 'Kilpauk', 'Pachaiyappa\'s College',
        'Shenoy Nagar', 'Anna Nagar East', 'Anna Nagar Tower', 'Thirumangalam',
        'Koyambedu', 'CMBT', 'Arumbakkam', 'Vadapalani', 'Ashok Nagar',
        'Ekkattuthangal', 'Arignar Anna Alandur', 'Nanganallur Road',
        'Meenambakkam', 'St. Thomas Mount'
      ]
    }
  };

  // Real-time metro alerts simulation
  const generateMetroAlerts = () => {
    const alertTypes = [
      { type: 'delay', severity: 'medium' },
      { type: 'maintenance', severity: 'high' },
      { type: 'crowding', severity: 'low' },
      { type: 'service', severity: 'medium' },
      { type: 'accessibility', severity: 'high' }
    ];

    const sampleAlerts = [
      {
        id: 1,
        line: 'Blue Line',
        stations: ['Central', 'Government Estate'],
        type: 'delay',
        message: '5-minute delay due to technical issues',
        severity: 'medium',
        timestamp: new Date(Date.now() - 10 * 60000),
        estimated: '15 mins'
      },
      {
        id: 2,
        line: 'Green Line',
        stations: ['Koyambedu'],
        type: 'maintenance',
        message: 'Elevator maintenance in progress - use alternate routes',
        severity: 'high',
        timestamp: new Date(Date.now() - 30 * 60000),
        estimated: '2 hours'
      },
      {
        id: 3,
        line: 'Blue Line',
        stations: ['Airport', 'Meenambakkam'],
        type: 'crowding',
        message: 'High passenger volume during peak hours',
        severity: 'low',
        timestamp: new Date(Date.now() - 5 * 60000),
        estimated: '1 hour'
      },
      {
        id: 4,
        line: 'Green Line',
        stations: ['Anna Nagar East'],
        type: 'accessibility',
        message: 'Tactile path under repair - assistance available',
        severity: 'high',
        timestamp: new Date(Date.now() - 45 * 60000),
        estimated: '3 hours'
      }
    ];

    return sampleAlerts.map(alert => ({
      ...alert,
      icon: alertTypes.find(t => t.type === alert.type)?.icon || null
    }));
  };

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchAlerts();
      // Generate initial metro alerts
      setMetroAlerts(generateMetroAlerts());
      
      // Simulate real-time updates every 30 seconds
      const interval = setInterval(() => {
        setMetroAlerts(generateMetroAlerts());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category, 
          message: `${location ? `📍 ${location}: ` : ''}${message}`,
          location 
        }),
      });
      setMessage('');
      setLocation('');
      fetchAlerts();
    } catch (err) {
      console.error('Error posting alert:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff5722';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  // Icon functions removed

  const getTimeDifference = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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
            Real-Time Alerts
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
            Stay updated with live transport and accessibility alerts across Chennai
          </p>
        </section>

        {/* Metro Alerts - Real-time */}
        <section style={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
          color: '#fff',
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>M</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Chennai Metro Live</h2>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600
            }}>
              LIVE
            </div>
          </div>

          {metroAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: 0.8 }}>
              <span style={{ fontSize: 32, marginBottom: 8, display: 'block', fontWeight: 'bold', color: '#4caf50' }}>✓</span>
              <p>All metro services running normally</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {metroAlerts.map(alert => (
                <div 
                  key={alert.id}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: 16,
                    borderRadius: 12,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    animation: 'slideIn 0.3s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, color: '#fff', fontWeight: 'bold' }}>
                      {alert.type[0].toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{
                          padding: '2px 8px',
                          background: metroLines[alert.line]?.color || '#fff',
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {alert.line}
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          background: getSeverityColor(alert.severity),
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {alert.severity}
                        </div>
                      </div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600 }}>
                        {alert.stations.join(' ↔ ')}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: 13, opacity: 0.9 }}>
                        {alert.message}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, opacity: 0.8 }}>
                        <span>
                          {getTimeDifference(alert.timestamp)} ago
                        </span>
                        <span>
                          Est. {alert.estimated}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Post Alert Form */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 18, fontWeight: 600 }}>
            Report an Issue
          </h3>
          
          <form onSubmit={handlePost}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                  Category
                </label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
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
                >
                  <option value="transport">Transport</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="roadway">Roadway</option>
                  <option value="weather">Weather</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Central Metro Station"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                Alert Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the issue or alert..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 16,
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fafafa',
                  minHeight: 80,
                  resize: 'vertical',
                  fontFamily: 'inherit'
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

            <button
              type="submit"
              disabled={!message.trim()}
              style={{
                background: !message.trim() ? '#ccc' : 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: !message.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: !message.trim() ? 'none' : '0 4px 16px rgba(255, 87, 34, 0.3)'
              }}
            >
              Post Alert
            </button>
          </form>
        </section>

        {/* Community Alerts */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: 18, fontWeight: 600 }}>
              Community Reports
            </h3>
            <button 
              onClick={fetchAlerts}
              disabled={loading}
              style={{
                background: 'none',
                border: '1px solid #1976d2',
                color: '#1976d2',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                if (!loading) {
                  e.target.style.background = '#1976d2';
                  e.target.style.color = '#fff';
                }
              }}
              onMouseOut={e => {
                if (!loading) {
                  e.target.style.background = 'none';
                  e.target.style.color = '#1976d2';
                }
              }}
            >
              {loading ? (
                <>
                  Loading...
                </>
              ) : (
                <>
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              <span style={{ fontSize: 32, marginBottom: 16, opacity: 0.5, display: 'block' }}>!</span>
              <p>No community alerts yet. Be the first to report an issue!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  style={{
                    padding: 16,
                    background: '#f8f9fa',
                    borderRadius: 12,
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#1976d2';
                    e.currentTarget.style.background = '#e3f2fd';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ 
                      fontSize: 18, 
                      flexShrink: 0, 
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}>
                      {alert.category[0].toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          background: '#1976d2',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {alert.category}
                        </span>
                        <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        color: '#333', 
                        fontSize: 15, 
                        lineHeight: 1.5 
                      }}>
                        {alert.message}
                      </p>
                      {alert.location && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                          Location: {alert.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
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

export default Alerts;
