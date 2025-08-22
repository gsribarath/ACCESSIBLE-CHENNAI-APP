import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle,
  faMapMarkerAlt,
  faLocationArrow,
  faEdit,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import { useVoiceInterface } from '../utils/voiceUtils';

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

  const { preferences, getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();
  const isVoiceMode = preferences.mode === 'voice';

  // Voice interface
  const {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening
  } = useVoiceInterface();

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
    { value: 'general', label: getText('general'), color: '#1976d2' },
    { value: 'accessibility', label: getText('accessibility') + ' ' + getText('updates'), color: '#4caf50' },
    { value: 'emergency', label: getText('emergency') + ' ' + getText('help'), color: '#f44336' }
  ];

  const filters = [
    { value: 'all', label: getText('allPosts') },
    { value: 'general', label: getText('general') },
    { value: 'accessibility', label: getText('accessibility') + ' ' + getText('updates') },
    { value: 'emergency', label: getText('emergency') + ' ' + getText('help') }
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

  // Voice command setup
  useEffect(() => {
    if (isVoiceMode && speak) {
      speak(getText('welcomeToCommunity', 'Welcome to Community page. You can say: post, filter, home, back, or help'));

      if (setupSpeechRecognition) {
        setupSpeechRecognition((command) => {
          const cleanCommand = command.toLowerCase().trim();
          
          if (cleanCommand.includes('home') || cleanCommand.includes(getText('home'))) {
            speak(getText('goingHome', 'Going to Home'));
            navigate('/');
          } else if (cleanCommand.includes('back') || cleanCommand.includes('திरும்பு')) {
            speak(getText('goingBack', 'Going back'));
            navigate(-1);
          } else if (cleanCommand.includes('post') || cleanCommand.includes('புதிய')) {
            speak(getText('createPost', 'Creating new post'));
            document.querySelector('textarea')?.focus();
          } else if (cleanCommand.includes('filter') || cleanCommand.includes('வடிகட்டு')) {
            speak(getText('changeFilter', 'Changing filter'));
            const filterSelect = document.querySelector('select');
            if (filterSelect) filterSelect.focus();
          } else if (cleanCommand.includes('general') || cleanCommand.includes('பொது')) {
            setFilterCategory('general');
            speak(getText('showingGeneral', 'Showing general posts'));
          } else if (cleanCommand.includes('access') || cleanCommand.includes('அணुகல்')) {
            setFilterCategory('accessibility');
            speak(getText('showingAccessibility', 'Showing accessibility posts'));
          } else if (cleanCommand.includes('emergency') || cleanCommand.includes('அவசर')) {
            setFilterCategory('emergency');
            speak(getText('showingEmergency', 'Showing emergency posts'));
          } else if (cleanCommand.includes('help') || cleanCommand.includes('உதவி')) {
            speak(getText('communityHelp', 'Community page. Say: post to create new post, filter to change category, general for general posts, access for accessibility posts, emergency for emergency posts, home to go to home page, or back to go back'));
          }
        });

        setTimeout(() => {
          startListening();
        }, 1000);
      }
    }
  }, [navigate, isVoiceMode, speak, setupSpeechRecognition, startListening]);

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
      <Navigation user={user} />

      <main style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '8px'
          }}>
            <h1 style={{ 
              margin: '0', 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: 'var(--letter-spacing-tight)',
              ...getTextStyles('primary')
            }}>
              {getText('community')}
            </h1>
            {isVoiceMode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: isListening ? '#4caf50' : '#2196f3',
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                animation: isListening ? 'pulse 2s infinite' : 'none'
              }}>
                <FontAwesomeIcon icon={faMicrophone} />
                {isListening ? 'Listening...' : 'Voice Ready'}
              </div>
            )}
          </div>
          <p style={{ 
            margin: '0 auto', 
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-secondary)',
            lineHeight: 'var(--line-height-normal)',
            maxWidth: '600px',
            ...getTextStyles('secondary')
          }}>
            {getText('communityDescription')}
          </p>
          {isVoiceMode && voiceFeedback && (
            <div style={{
              margin: '12px auto 0',
              padding: '8px 16px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1976d2',
              maxWidth: '400px'
            }}>
              {voiceFeedback}
            </div>
          )}
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
                  border: preferences.theme === 'high-contrast' ? '2px solid #ffffff' : 'none',
                  padding: '16px 24px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: preferences.theme === 'dark' 
                    ? '0 4px 16px rgba(244, 67, 54, 0.5)' 
                    : preferences.theme === 'high-contrast'
                    ? '0 4px 16px rgba(255, 255, 255, 0.3)'
                    : '0 4px 16px rgba(244, 67, 54, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseOver={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = preferences.theme === 'dark' 
                    ? '0 6px 20px rgba(244, 67, 54, 0.6)' 
                    : preferences.theme === 'high-contrast'
                    ? '0 6px 20px rgba(255, 255, 255, 0.4)'
                    : '0 6px 20px rgba(244, 67, 54, 0.4)';
                }}
                onMouseOut={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = preferences.theme === 'dark' 
                    ? '0 4px 16px rgba(244, 67, 54, 0.5)' 
                    : preferences.theme === 'high-contrast'
                    ? '0 4px 16px rgba(255, 255, 255, 0.3)'
                    : '0 4px 16px rgba(244, 67, 54, 0.3)';
                }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} /> {getText('emergency')} {getText('help')}
              </button>
            </div>

            {/* Category Filter */}
            <div style={{
              ...getCardStyles(),
              padding: 20,
              marginBottom: 24
            }}>
              <h4 style={{ margin: '0 0 12px 0', ...getTextStyles('primary'), fontSize: 16, fontWeight: 600 }}>{getText('filters')} {getText('posts')}</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {filters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterCategory(filter.value)}
                    style={{
                      background: filterCategory === filter.value ? 'var(--accent-color)' : 'var(--bg-secondary)',
                      color: filterCategory === filter.value ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid var(--border-color)`,
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
                  ...getTextStyles('secondary'),
                  ...getCardStyles()
                }}>
                  <p>No posts yet. Be the first to share something with the community!</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <article
                    key={post.id}
                    style={{
                      ...getCardStyles(),
                      padding: 24,
                      borderLeft: post.category === 'emergency' ? '4px solid #f44336' : 
                                 post.category === 'accessibility' ? '4px solid #4caf50' : 
                                 '4px solid var(--accent-color)'
                    }}
                  >
                    {/* Post Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, ...getTextStyles('primary') }}>{post.username}</span>
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
                          <div style={{ fontSize: 12, ...getTextStyles('secondary'), marginBottom: 4 }}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {post.location}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                        {formatTimeAgo(post.timestamp)}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div style={{ marginBottom: 16, lineHeight: 1.6, ...getTextStyles('primary'), fontSize: 15 }}>
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
                    <div style={{ display: 'flex', gap: 16, paddingTop: 16, borderTop: `1px solid var(--border-color)` }}>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: post.userLiked ? 'var(--accent-color)' : 'var(--text-secondary)',
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
                        onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        {post.userLiked ? '👍' : '👍'} Like ({post.likes})
                      </button>
                      
                      <button
                        onClick={() => handleHelpful(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: post.userMarkedHelpful ? '#4caf50' : 'var(--text-secondary)',
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
                        onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        ✓ Helpful ({post.helpful})
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '8px 12px',
                          borderRadius: 8,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
                        onMouseOut={e => e.target.style.background = 'none'}
                      >
                        💬 Comments ({post.comments.length})
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid var(--border-color)` }}>
                        {/* Existing Comments */}
                        {post.comments.map(comment => (
                          <div key={comment.id} style={{ 
                            marginBottom: 12, 
                            padding: 12, 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 8,
                            border: `1px solid var(--border-color)`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: 14, ...getTextStyles('primary') }}>
                                {comment.username}
                              </span>
                              <span style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <div style={{ fontSize: 14, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
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
                              border: `1px solid var(--border-color)`,
                              borderRadius: 8,
                              fontSize: 14,
                              outline: 'none',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)'
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
                              background: newComment[post.id]?.trim() ? 'var(--accent-color)' : 'var(--border-color)',
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
              ...getCardStyles(),
              padding: 24
            }}>
              <h3 style={{ margin: '0 0 20px 0', ...getTextStyles('primary'), fontSize: 18, fontWeight: 600 }}>
                {getText('createPost')}
              </h3>
              
              <form onSubmit={handlePost}>
                {/* Category Selection */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, ...getTextStyles('primary'), fontSize: 14, fontWeight: 500 }}>
                    {getText('category')}
                  </label>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    disabled={isEmergency}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: 8,
                      fontSize: 14,
                      backgroundColor: isEmergency ? '#ffebee' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
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
                  <label style={{ display: 'block', marginBottom: 8, ...getTextStyles('primary'), fontSize: 14, fontWeight: 500 }}>
                    {getText('whatsOnYourMind')}
                  </label>
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={isEmergency ? getText('describeEmergency') : getText('shareThoughts')}
                    required
                    style={{
                      width: '100%',
                      minHeight: 120,
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: 8,
                      fontSize: 16,
                      lineHeight: 1.5,
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      backgroundColor: isEmergency ? '#ffebee' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Location */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 8, ...getTextStyles('primary'), fontSize: 14, fontWeight: 500 }}>
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
                        border: `1px solid var(--border-color)`,
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
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
                      background: 'var(--card-bg)',
                      border: `1px solid var(--border-color)`,
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: 200,
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: 'var(--shadow)'
                    }}>
                      {filteredPlaces.map((place, i) => (
                        <div
                          key={place}
                          onClick={() => setLocation(place)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: i < filteredPlaces.length - 1 ? `1px solid var(--border-color)` : 'none',
                            fontSize: 14,
                            color: 'var(--text-primary)'
                          }}
                          onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
                          onMouseOut={e => e.target.style.background = 'transparent'}
                        >
                          {place}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, ...getTextStyles('primary'), fontSize: 14, fontWeight: 500 }}>
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
                      border: `1px solid var(--border-color)`,
                      borderRadius: 8,
                      fontSize: 14,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {attachedImage && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img 
                        src={attachedImage.preview} 
                        alt="Preview"
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <span style={{ fontSize: 12, ...getTextStyles('secondary') }}>{attachedImage.name}</span>
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
                      <span style={{ fontSize: 14, ...getTextStyles('secondary') }}>
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

            {/* Emergency Contacts Section */}
            <section style={{ 
              ...getCardStyles(),
              padding: 24,
              marginTop: 20
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#f44336', 
                fontSize: 18, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Emergency Contacts
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Disability Services */}
                <div style={{ 
                  padding: 16, 
                  border: `1px solid var(--border-color)`, 
                  borderRadius: 12,
                  background: 'var(--bg-secondary)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#4caf50', fontSize: 14, fontWeight: 600 }}>
                    Disability Services
                  </h4>
                  <div style={{ fontSize: 13, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>National Helpline:</strong> <a href="tel:18001804444" style={{ color: 'var(--accent-color)' }}>1800-180-4444</a>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Tamil Nadu Disability Board:</strong> <a href="tel:04426433636" style={{ color: 'var(--accent-color)' }}>044-2643-3636</a>
                    </div>
                    <div>
                      <strong>Accessibility Support:</strong> <a href="tel:18004251966" style={{ color: 'var(--accent-color)' }}>1800-425-1966</a>
                    </div>
                  </div>
                </div>

                {/* Metro Services */}
                <div style={{ 
                  padding: 16, 
                  border: `1px solid var(--border-color)`, 
                  borderRadius: 12,
                  background: 'var(--bg-secondary)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2196f3', fontSize: 14, fontWeight: 600 }}>
                    Chennai Metro
                  </h4>
                  <div style={{ fontSize: 13, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Customer Care:</strong> <a href="tel:04428225500" style={{ color: 'var(--accent-color)' }}>044-2822-5500</a>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Emergency Helpline:</strong> <a href="tel:04442334455" style={{ color: 'var(--accent-color)' }}>044-4233-4455</a>
                    </div>
                    <div>
                      <strong>Accessibility Help:</strong> <a href="tel:04428341234" style={{ color: 'var(--accent-color)' }}>044-2834-1234</a>
                    </div>
                  </div>
                </div>

                {/* MTC Bus Services */}
                <div style={{ 
                  padding: 16, 
                  border: `1px solid var(--border-color)`, 
                  borderRadius: 12,
                  background: 'var(--bg-secondary)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ff9800', fontSize: 14, fontWeight: 600 }}>
                    MTC Bus Service
                  </h4>
                  <div style={{ fontSize: 13, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>MTC Helpline:</strong> <a href="tel:04424792600" style={{ color: 'var(--accent-color)' }}>044-2479-2600</a>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Route Enquiry:</strong> <a href="tel:04442321010" style={{ color: 'var(--accent-color)' }}>044-4232-1010</a>
                    </div>
                    <div>
                      <strong>Lost & Found:</strong> <a href="tel:04428541234" style={{ color: 'var(--accent-color)' }}>044-2854-1234</a>
                    </div>
                  </div>
                </div>

                {/* Volunteer & Transit Staff */}
                <div style={{ 
                  padding: 16, 
                  border: `1px solid var(--border-color)`, 
                  borderRadius: 12,
                  background: 'var(--bg-secondary)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#9c27b0', fontSize: 14, fontWeight: 600 }}>
                    Volunteer Support
                  </h4>
                  <div style={{ fontSize: 13, ...getTextStyles('secondary'), lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Transit Volunteers:</strong> <a href="tel:09876543210" style={{ color: 'var(--accent-color)' }}>+91 98765-43210</a>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Accessibility Guide:</strong> <a href="tel:09876543211" style={{ color: 'var(--accent-color)' }}>+91 98765-43211</a>
                    </div>
                    <div>
                      <strong>Emergency Escort:</strong> <a href="tel:09876543212" style={{ color: 'var(--accent-color)' }}>+91 98765-43212</a>
                    </div>
                  </div>
                </div>

                {/* General Emergency */}
                <div style={{ 
                  padding: 16, 
                  border: '2px solid #f44336', 
                  borderRadius: 12,
                  background: '#ffebee'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#f44336', fontSize: 14, fontWeight: 600 }}>
                    General Emergency
                  </h4>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Police:</strong> <a href="tel:100" style={{ color: '#1976d2', fontWeight: 600 }}>100</a>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Ambulance:</strong> <a href="tel:108" style={{ color: '#1976d2', fontWeight: 600 }}>108</a>
                    </div>
                    <div>
                      <strong>Fire:</strong> <a href="tel:101" style={{ color: '#1976d2', fontWeight: 600 }}>101</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Community;
