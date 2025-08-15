import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle,
  faMapMarkerAlt,
  faLocationArrow,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';

function Community() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [location, setLocation] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();

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

  const categories = [
    { value: 'general', label: 'General', color: '#1976d2' },
    { value: 'accessibility', label: 'Accessibility Updates', color: '#4caf50' },
    { value: 'emergency', label: 'Emergency Help', color: '#f44336' }
  ];

  const filters = [
    { value: 'all', label: 'All Posts' },
    { value: 'general', label: 'General' },
    { value: 'accessibility', label: 'Accessibility Updates' },
    { value: 'emergency', label: 'Emergency Help' }
  ];

  // Mock data for posts with comments and reactions
  const generateMockPosts = () => {
    const mockPosts = [
      {
        id: 1,
        username: 'Priya S.',
        content: 'The new ramp at Central Metro Station is working great! Much easier access now.',
        category: 'accessibility',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        likes: 12,
        helpful: 8,
        comments: [
          { id: 1, username: 'Raj M.', content: 'Thanks for the update! This helps a lot.', timestamp: new Date(Date.now() - 20 * 60 * 1000) },
          { id: 2, username: 'Maya T.', content: 'Finally! I was waiting for this.', timestamp: new Date(Date.now() - 15 * 60 * 1000) }
        ],
        location: 'Central Metro Station',
        userLiked: false,
        userMarkedHelpful: false,
        image: null
      },
      {
        id: 2,
        username: 'Arjun K.',
        content: 'Does anyone know if the audio announcements are working on the Blue Line today?',
        category: 'general',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 5,
        helpful: 3,
        comments: [
          { id: 3, username: 'Sneha R.', content: 'Yes, they were working when I traveled this morning.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }
        ],
        userLiked: false,
        userMarkedHelpful: false,
        image: null
      },
      {
        id: 3,
        username: 'Emergency User',
        content: 'URGENT: Stuck in elevator at Express Avenue Mall. Need immediate assistance!',
        category: 'emergency',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        likes: 0,
        helpful: 15,
        comments: [
          { id: 4, username: 'Security Team', content: 'Help is on the way. Stay calm.', timestamp: new Date(Date.now() - 5 * 60 * 1000) }
        ],
        location: 'Express Avenue Mall',
        userLiked: false,
        userMarkedHelpful: true,
        image: null
      }
    ];
    return mockPosts.sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      setPosts(generateMockPosts());
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    navigate('/login');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image (basic implementation)
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage({
          file: file,
          preview: event.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock location name for demo
          setLocation('Current Location (GPS)');
          setShareLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter manually.');
        }
      );
    }
  };

  const handleEmergencyPost = () => {
    setIsEmergency(true);
    setSelectedCategory('emergency');
    setNewPost('URGENT: ');
    
    // Prompt for location sharing
    if (window.confirm('Share your current location for emergency assistance?')) {
      getCurrentLocation();
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) return;

    const postData = {
      id: Date.now(),
      username: user.name,
      content: newPost.trim(),
      category: selectedCategory,
      timestamp: new Date(),
      likes: 0,
      helpful: 0,
      comments: [],
      location: shareLocation ? location : null,
      userLiked: false,
      userMarkedHelpful: false,
      image: attachedImage
    };

    try {
      // Add to local state (in real app, this would be an API call)
      setPosts(prevPosts => [postData, ...prevPosts]);
      
      // Reset form
      setNewPost('');
      setSelectedCategory('general');
      setAttachedImage(null);
      setLocation('');
      setShareLocation(false);
      setIsEmergency(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // In a real app, send to backend
      // await fetch('/api/community/posts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(postData)
      // });

    } catch (err) {
      console.error('Error posting:', err);
      alert('Failed to post. Please try again.');
    }
  };

  const handleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.userLiked ? post.likes - 1 : post.likes + 1,
              userLiked: !post.userLiked 
            }
          : post
      )
    );
  };

  const handleHelpful = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              helpful: post.userMarkedHelpful ? post.helpful - 1 : post.helpful + 1,
              userMarkedHelpful: !post.userMarkedHelpful 
            }
          : post
      )
    );
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleComment = (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    const comment = {
      id: Date.now(),
      username: user.name,
      content: commentText.trim(),
      timestamp: new Date()
    };

    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setNewComment(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getCategoryStyle = (category) => {
    const cat = categories.find(c => c.value === category);
    return {
      backgroundColor: cat?.color || '#1976d2',
      color: '#fff'
    };
  };

  const filteredPosts = filterCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === filterCategory);

  const filteredPlaces = location 
    ? chennaiPlaces.filter(place => 
        place.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 10)
    : [];

  if (!user) return <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    ...getThemeStyles()
  }}>
    {getText('loading')}
  </div>;

  return (
    <div style={{ ...getThemeStyles(), paddingBottom: 80 }}>
      <Navigation user={user} onLogout={handleLogout} />

      <main style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24
        }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            ...getTextStyles('primary')
          }}>
            Community Feed
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-secondary)',
            lineHeight: 'var(--line-height-normal)',
            ...getTextStyles('secondary')
          }}>
            Connect, share experiences, and help each other navigate Chennai accessibly
          </p>
        </section>

        {/* Two-column layout on desktop */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 400px' : '1fr', 
          gap: 24 
        }}>
          
          {/* Main Feed Column */}
          <div>
            {/* Emergency Help Button */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handleEmergencyPost}
                style={{
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 24px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseOver={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.4)';
                }}
                onMouseOut={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(244, 67, 54, 0.3)';
                }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} /> Emergency Help
              </button>
            </div>

            {/* Category Filter */}
            <div style={{
              background: '#fff',
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16, fontWeight: 600 }}>Filter Posts</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {filters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterCategory(filter.value)}
                    style={{
                      background: filterCategory === filter.value ? '#1976d2' : '#f5f5f5',
                      color: filterCategory === filter.value ? '#fff' : '#666',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {filteredPosts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40, 
                  color: '#666',
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <p>No posts yet. Be the first to share something with the community!</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <article
                    key={post.id}
                    style={{
                      background: '#fff',
                      padding: 24,
                      borderRadius: 16,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderLeft: post.category === 'emergency' ? '4px solid #f44336' : 
                                 post.category === 'accessibility' ? '4px solid #4caf50' : 
                                 '4px solid #1976d2'
                    }}
                  >
                    {/* Post Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#333' }}>{post.username}</span>
                          <span 
                            style={{
                              ...getCategoryStyle(post.category),
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}
                          >
                            {categories.find(c => c.value === post.category)?.label}
                          </span>
                          {post.category === 'emergency' && (
                            <span style={{ 
                              background: '#ff9800', 
                              color: '#fff', 
                              padding: '2px 8px', 
                              borderRadius: 12, 
                              fontSize: 10, 
                              fontWeight: 600 
                            }}>
                              URGENT
                            </span>
                          )}
                        </div>
                        {post.location && (
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {post.location}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {formatTimeAgo(post.timestamp)}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div style={{ marginBottom: 16, lineHeight: 1.6, color: '#333', fontSize: 15 }}>
                      {post.content}
                    </div>

                    {/* Post Image */}
                    {post.image && (
                      <div style={{ marginBottom: 16 }}>
                        <img 
                          src={post.image.preview} 
                          alt="Post attachment"
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto', 
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div style={{ display: 'flex', gap: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: post.userLiked ? '#1976d2' : '#666',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontWeight: post.userLiked ? 600 : 400,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        onMouseOver={e => e.target.style.background = '#e3f2fd'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        {post.userLiked ? '👍' : '👍'} Like ({post.likes})
                      </button>
                      
                      <button
                        onClick={() => handleHelpful(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: post.userMarkedHelpful ? '#4caf50' : '#666',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontWeight: post.userMarkedHelpful ? 600 : 400,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        onMouseOver={e => e.target.style.background = '#e8f5e8'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        ✓ Helpful ({post.helpful})
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '8px 12px',
                          borderRadius: 8,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        onMouseOver={e => e.target.style.background = '#f5f5f5'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        💬 Comments ({post.comments.length})
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
                        {/* Existing Comments */}
                        {post.comments.map(comment => (
                          <div key={comment.id} style={{ 
                            marginBottom: 12, 
                            padding: 12, 
                            background: '#f8f9fa', 
                            borderRadius: 8 
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
                                {comment.username}
                              </span>
                              <span style={{ fontSize: 12, color: '#999' }}>
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>
                              {comment.content}
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment[post.id] || ''}
                            onChange={e => setNewComment(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              border: '1px solid #ddd',
                              borderRadius: 8,
                              fontSize: 14,
                              outline: 'none'
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                handleComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            style={{
                              background: newComment[post.id]?.trim() ? '#1976d2' : '#ccc',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: 8,
                              fontSize: 14,
                              cursor: newComment[post.id]?.trim() ? 'pointer' : 'not-allowed',
                              transition: 'all 0.2s'
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Post Creation */}
          <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
            <section style={{ 
              background: '#fff', 
              padding: 24, 
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: 18, fontWeight: 600 }}>
                Create Post
              </h3>
              
              <form onSubmit={handlePost}>
                {/* Category Selection */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                    Category
                  </label>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    disabled={isEmergency}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      backgroundColor: isEmergency ? '#ffebee' : '#fff',
                      outline: 'none'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Post Content */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                    What's on your mind?
                  </label>
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={isEmergency ? "Describe your emergency situation..." : "Share your thoughts, ask questions, or report accessibility updates..."}
                    required
                    style={{
                      width: '100%',
                      minHeight: 120,
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 16,
                      lineHeight: 1.5,
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      backgroundColor: isEmergency ? '#ffebee' : '#fff'
                    }}
                  />
                </div>

                {/* Location */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                    Location (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Search Chennai locations..."
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      style={{
                        background: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                      title="Use current location"
                    >
                      <FontAwesomeIcon icon={faLocationArrow} /> GPS
                    </button>
                  </div>
                  
                  {/* Location suggestions */}
                  {location && filteredPlaces.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: 200,
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {filteredPlaces.map((place, i) => (
                        <div
                          key={place}
                          onClick={() => setLocation(place)}
                          style={{
                            padding: '8px 12px',
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

                {/* Image Upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: 14, fontWeight: 500 }}>
                    Attach Image (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                  {attachedImage && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img 
                        src={attachedImage.preview} 
                        alt="Preview"
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <span style={{ fontSize: 12, color: '#666' }}>{attachedImage.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f44336',
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Share Location Checkbox */}
                {location && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={shareLocation}
                        onChange={e => setShareLocation(e.target.checked)}
                      />
                      <span style={{ fontSize: 14, color: '#666' }}>
                        Share location with post
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={!newPost.trim()}
                  style={{
                    background: !newPost.trim() ? '#ccc' : 
                               isEmergency ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 
                               'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: !newPost.trim() ? 'not-allowed' : 'pointer',
                    width: '100%',
                    transition: 'all 0.2s',
                    boxShadow: !newPost.trim() ? 'none' : '0 4px 16px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  {isEmergency ? <><FontAwesomeIcon icon={faExclamationTriangle} /> Post Emergency</> : <><FontAwesomeIcon icon={faEdit} /> Post Message</>}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Community;
