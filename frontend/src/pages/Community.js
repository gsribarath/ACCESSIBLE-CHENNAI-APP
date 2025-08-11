import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
// Icons have been removed

function Community() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('chat');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const navigate = useNavigate();

  // Comprehensive list of Chennai places
  const chennaiPlaces = [
    // Metro Stations
    'Airport Metro Station', 'Alandur Metro Station', 'Arumbakkam Metro Station', 'Ashok Nagar Metro Station',
    'Central Metro Station', 'Egmore Metro Station', 'Government Estate Metro Station', 'Guindy Metro Station',
    'High Court Metro Station', 'Koyambedu Metro Station', 'LIC Metro Station', 'Mannadi Metro Station',
    'Nehru Park Metro Station', 'Pachaiyappa\'s College Metro Station', 'Puratchi Thalaivar Dr. M.G. Ramachandran Central Railway Station Metro',
    'Saidapet Metro Station', 'St. Thomas Mount Metro Station', 'Thousand Lights Metro Station', 'Tirumangalam Metro Station',
    'Vadapalani Metro Station', 'Washermanpet Metro Station',
    
    // Railway Stations
    'Chennai Central Railway Station', 'Chennai Egmore Railway Station', 'Tambaram Railway Station',
    'Avadi Railway Station', 'Beach Railway Station', 'Chengalpattu Railway Station', 'Chromepet Railway Station',
    'Fort Railway Station', 'Guduvanchery Railway Station', 'Katpadi Railway Station', 'Mambalam Railway Station',
    'Park Town Railway Station', 'Perambur Railway Station', 'St. Thomas Mount Railway Station',
    'Tiruvallur Railway Station', 'Velachery Railway Station',
    
    // Bus Terminuses
    'Koyambedu Bus Terminus', 'Broadway Bus Terminus', 'T. Nagar Bus Terminus', 'Adyar Depot',
    'Anna Nagar Depot', 'Avadi Depot', 'Ambattur Depot', 'Perambur Depot', 'Poonamallee Depot',
    
    // Major Areas & Neighborhoods
    'Adyar', 'Alwarpet', 'Ambattur', 'Anna Nagar', 'Ashok Nagar', 'Avadi', 'Besant Nagar',
    'Boat Club', 'Chepauk', 'Chetpet', 'Chromepet', 'Egmore', 'Guindy', 'Harrington Road',
    'Indira Nagar', 'Kilpauk', 'Kodambakkam', 'Kotturpuram', 'Loyola College', 'Madipakkam',
    'Mylapore', 'Nandanam', 'Nungambakkam', 'Pallavaram', 'Porur', 'Purasaiwakkam',
    'R.A. Puram', 'Royapettah', 'Saidapet', 'Sholinganallur', 'T. Nagar', 'Tambaram',
    'Teynampet', 'Thiruvanmiyur', 'Thoraipakkam', 'Triplicane', 'Vadapalani', 'Velachery',
    'Villivakkam', 'West Mambalam',
    
    // Hospitals
    'Apollo Hospital', 'Fortis Malar Hospital', 'Government General Hospital', 'Institute of Mental Health',
    'Kanchi Kamakoti CHILDS Trust Hospital', 'Madras Medical College', 'MIOT International',
    'Sankara Nethralaya', 'Sri Ramachandra Medical Centre', 'Stanley Medical College',
    'Voluntary Health Services Hospital',
    
    // Educational Institutions
    'Anna University', 'IIT Madras', 'Loyola College', 'Madras Christian College', 'Presidency College',
    'Queen Mary\'s College', 'Sir Theagaraya College', 'Stella Maris College', 'University of Madras',
    'Vellore Institute of Technology',
    
    // Shopping Areas
    'Express Avenue Mall', 'Forum Vijaya Mall', 'Phoenix MarketCity', 'Spencer Plaza',
    'T. Nagar Commercial Area', 'Pondy Bazaar', 'Ritchie Street', 'Burma Bazaar', 'Sowcarpet',
    'George Town', 'Parry\'s Corner', 'Ranganathan Street',
    
    // Tourist Places
    'Marina Beach', 'Elliot\'s Beach', 'Mahabalipuram', 'Kapaleeshwarar Temple', 'San Thome Cathedral',
    'Fort St. George', 'Government Museum', 'Valluvar Kottam', 'Birla Planetarium',
    'Crocodile Bank', 'Dakshina Chitra', 'Guindy National Park', 'Arignar Anna Zoological Park',
    'Theosophical Society', 'Little Mount Church', 'Parthasarathy Temple',
    
    // IT Parks & Business Areas
    'TIDEL Park', 'DLF IT Park', 'RMZ Millenia Business Park', 'ASV Suntech Park',
    'Olympia Technology Park', 'Sipcot IT Park', 'Mahindra World City', 'OMR IT Corridor',
    'Thoraipakkam IT Hub', 'Perungudi IT Park',
    
    // Residential Areas
    'Besant Nagar', 'Boat Club Road', 'Cathedral Road', 'ECR Road', 'GST Road',
    'Harrington Road', 'Khader Nawaz Khan Road', 'OMR', 'Poes Garden', 'Raj Bhavan',
    'Sterling Road', 'TTK Road', 'Uttamar Gandhi Salai', 'Walajah Road',
    
    // Other Important Places
    'Chennai Port', 'Ennore Port', 'Chennai Airport', 'Ripon Building', 'Secretariat',
    'High Court of Madras', 'Raj Bhavan', 'Anna Centenary Library', 'Music Academy',
    'Kalakshetra', 'Chennai Trade Centre', 'YMCA', 'Club House'
  ].sort();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchMessages();
    }
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
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
      await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.user_id, 
          message: `${location ? `${location}: ` : ''}${message}`, 
          type 
        }),
      });
      setMessage('');
      setLocation('');
      fetchMessages();
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  const filteredPlaces = location 
    ? chennaiPlaces.filter(place => 
        place.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 10)
    : [];

  const getMessageTypeIcon = (type) => {
    return null;
  };

  const getMessageTypeColor = (type) => {
    switch(type) {
      case 'emergency': return '#ffebee';
      case 'review': return '#fff3e0';
      case 'help': return '#e8f5e8';
      case 'info': return '#e3f2fd';
      default: return '#f8f9fa';
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
            Community Hub
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
            Connect with fellow travelers, share experiences, and help each other navigate Chennai
          </p>
        </section>

        {/* Post Form */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 18, fontWeight: 600 }}>
            Share with Community
          </h3>
          
          <form onSubmit={handlePost}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Search Chennai locations..."
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    setShowLocationSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowLocationSuggestions(location.length > 0)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
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
                />
                
                {/* Location Suggestions */}
                {showLocationSuggestions && filteredPlaces.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '2px solid #e0e0e0',
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: 200,
                    overflowY: 'auto'
                  }}>
                    {filteredPlaces.map((place, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setLocation(place);
                          setShowLocationSuggestions(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: i < filteredPlaces.length - 1 ? '1px solid #eee' : 'none',
                          fontSize: 14
                        }}
                        onMouseOver={e => e.target.style.background = '#f5f5f5'}
                        onMouseOut={e => e.target.style.background = '#fff'}
                      >
                        {place}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                  Message Type
                </label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
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
                  <option value="chat">General Chat</option>
                  <option value="review">Place Review</option>
                  <option value="help">Need Help</option>
                  <option value="info">Share Info</option>
                  <option value="emergency">Emergency Alert</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                Your Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Share your experience, ask for help, or provide useful information..."
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
                  minHeight: 100,
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
                background: !message.trim() ? '#ccc' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: !message.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: !message.trim() ? 'none' : '0 4px 16px rgba(25, 118, 210, 0.3)'
              }}
            >
              Post Message
            </button>
          </form>
        </section>

        {/* Messages Feed */}
        <section style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 18, fontWeight: 600 }}>
            Community Messages
          </h3>
          
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              <p>No messages yet. Be the first to share something with the community!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    padding: 20,
                    background: getMessageTypeColor(msg.type),
                    borderRadius: 12,
                    border: `2px solid ${msg.type === 'emergency' ? '#f44336' : '#e0e0e0'}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    if (msg.type !== 'emergency') {
                      e.currentTarget.style.borderColor = '#1976d2';
                    }
                  }}
                  onMouseOut={e => {
                    if (msg.type !== 'emergency') {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                      <span style={{
                        background: msg.type === 'emergency' ? '#f44336' : '#1976d2',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {msg.type}
                      </span>
                      {msg.type === 'emergency' && (
                        <span style={{
                          background: '#ff9800',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 600,
                          animation: 'pulse 2s infinite'
                        }}>
                          URGENT
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    color: '#333', 
                    fontSize: 15, 
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.message}
                  </p>
                  
                  <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#e3f2fd';
                      e.target.style.color = '#1976d2';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#666';
                    }}>
                      Helpful
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#e3f2fd';
                      e.target.style.color = '#1976d2';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#666';
                    }}>
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Community;
