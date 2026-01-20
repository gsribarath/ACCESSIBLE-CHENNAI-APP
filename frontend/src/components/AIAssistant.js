import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faTimes, 
  faPaperPlane, 
  faMicrophone,
  faVolumeUp,
  faVolumeMute,
  faWheelchair,
  faBus,
  faTrain,
  faRoute,
  faUsers,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';

// AI Assistant Response Generator
const generateAIResponse = (userMessage, isVoiceMode) => {
  const message = userMessage.toLowerCase().trim();
  
  // Greeting patterns
  if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening|namaste)/)) {
    return {
      text: isVoiceMode 
        ? "Hello! I am your Accessible Chennai assistant. I can help you with accessible routes, bus and metro information, and navigation support. How can I help you today?"
        : "Hello! 👋 I'm your Accessible Chennai assistant. I can help you with:\n• Accessible route planning\n• Bus & Metro information\n• Navigation support\n• Community help\n\nHow can I assist you?",
      suggestions: ['Find accessible route', 'Bus information', 'Metro stations', 'Need help']
    };
  }
  
  // Route/Navigation queries
  if (message.match(/route|direction|navigate|go to|how to reach|way to|path/)) {
    return {
      text: isVoiceMode
        ? "I can help you plan an accessible route. Would you like a wheelchair-friendly route, or a general accessible route? Please tell me your starting point and destination."
        : "🗺️ I can help you plan an accessible route!\n\n**Options:**\n• Wheelchair-friendly routes\n• Step-free access routes\n• Voice-guided navigation\n\nPlease tell me your **starting point** and **destination**, or tap the Navigate button below.",
      suggestions: ['Wheelchair route', 'Voice navigation', 'Open Navigate page'],
      action: { type: 'navigate', path: '/navigate' }
    };
  }
  
  // Bus queries
  if (message.match(/bus|mtc|stop|bus stop|bus number|which bus/)) {
    return {
      text: isVoiceMode
        ? "I can help you with bus information. Chennai has many accessible MTC buses with ramps and priority seating. Would you like to find accessible buses near you, or get information about a specific bus route?"
        : "🚌 **MTC Bus Information**\n\nChennai's accessible buses include:\n• Low-floor buses with ramps\n• Priority seating for disabled passengers\n• Audio announcements\n\nWould you like to:\n• Find accessible buses near you\n• Check a specific route\n• Find nearest bus stop",
      suggestions: ['Accessible buses near me', 'Bus route info', 'Nearest bus stop']
    };
  }
  
  // Metro queries
  if (message.match(/metro|train|station|cmrl|chennai metro/)) {
    return {
      text: isVoiceMode
        ? "Chennai Metro is fully accessible. All stations have lifts, ramps, tactile paths, and wheelchair spaces in trains. Which metro station would you like information about?"
        : "🚇 **Chennai Metro Accessibility**\n\nAll CMRL stations feature:\n• ♿ Lifts & Ramps\n• Tactile paths for visually impaired\n• Wheelchair spaces in trains\n• Audio-visual announcements\n• Accessible toilets\n\nWhich station do you need info about?",
      suggestions: ['Nearest metro station', 'Metro route planner', 'Station facilities']
    };
  }
  
  // Wheelchair/Accessibility specific
  if (message.match(/wheelchair|ramp|lift|elevator|accessible|disability|disabled/)) {
    return {
      text: isVoiceMode
        ? "I understand you need wheelchair-accessible options. Chennai has many accessible facilities including metro stations with lifts, low-floor buses, and accessible public spaces. What specific accessibility information do you need?"
        : "♿ **Accessibility Support**\n\nI can help you find:\n• Wheelchair-friendly routes\n• Locations with ramps & lifts\n• Accessible public transport\n• Accessible restrooms\n• Step-free paths\n\nWhat do you need help with?",
      suggestions: ['Wheelchair routes', 'Accessible stations', 'Ramp locations']
    };
  }
  
  // Help/Emergency
  if (message.match(/help|emergency|support|assist|volunteer|staff/)) {
    return {
      text: isVoiceMode
        ? "I'm here to help you. If you need immediate assistance, you can connect with community volunteers or transit staff through our app. Would you like me to guide you to the help section?"
        : "🆘 **Help & Support**\n\nOptions available:\n• Connect with volunteers\n• Contact transit staff\n• Community support\n• Emergency guidance\n\nHow can I assist you?",
      suggestions: ['Connect volunteer', 'Transit staff', 'Community help'],
      action: { type: 'navigate', path: '/community' }
    };
  }
  
  // Community queries
  if (message.match(/community|connect|share|people|friends|volunteer/)) {
    return {
      text: isVoiceMode
        ? "Our community feature connects you with other users, volunteers, and support staff. You can share experiences, get help, or offer assistance to others. Would you like to open the community page?"
        : "👥 **Community Support**\n\nOur community features:\n• Connect with volunteers\n• Share accessibility tips\n• Get peer support\n• Help other users\n\nWant to join the community?",
      suggestions: ['Open Community', 'Find volunteers', 'Share experience'],
      action: { type: 'navigate', path: '/community' }
    };
  }
  
  // Settings/Preferences
  if (message.match(/setting|preference|theme|mode|voice|language|change/)) {
    return {
      text: isVoiceMode
        ? "You can customize your app experience in Settings. Options include voice mode, theme selection, language, and notification preferences. Would you like to go to Settings?"
        : "⚙️ **App Settings**\n\nYou can customize:\n• Voice/Normal mode\n• Light/Dark theme\n• Language preference\n• Notifications\n\nGo to Settings?",
      suggestions: ['Open Settings', 'Change theme', 'Voice mode'],
      action: { type: 'navigate', path: '/settings' }
    };
  }
  
  // App info/features
  if (message.match(/what can you do|features|about|tell me|app|how does/)) {
    return {
      text: isVoiceMode
        ? "I am your Accessible Chennai assistant. I can help you plan accessible routes, find wheelchair-friendly transport, get real-time transit information, connect with community support, and navigate Chennai independently. Just tell me what you need!"
        : "🌟 **What I Can Do**\n\n• 🗺️ Plan accessible routes\n• 🚌 Find accessible buses\n• 🚇 Metro station info\n• ♿ Wheelchair-friendly paths\n• 👥 Community support\n• 🎙️ Voice assistance\n\nHow can I help you today?",
      suggestions: ['Plan a route', 'Find transport', 'Get help']
    };
  }
  
  // Thank you
  if (message.match(/thank|thanks|ok|okay|great|perfect|good/)) {
    return {
      text: isVoiceMode
        ? "You're welcome! I'm always here to help. Is there anything else you need assistance with?"
        : "You're welcome! 😊 Is there anything else I can help you with?",
      suggestions: ['Plan route', 'Find bus', 'More help', 'No, thanks']
    };
  }
  
  // Goodbye
  if (message.match(/bye|goodbye|exit|close|done|finish/)) {
    return {
      text: isVoiceMode
        ? "Goodbye! Have a safe journey. Remember, I'm always here if you need help navigating Chennai."
        : "Goodbye! 👋 Have a safe journey. I'm always here when you need help!",
      suggestions: [],
      shouldClose: true
    };
  }
  
  // Default fallback
  return {
    text: isVoiceMode
      ? "I'm not sure I understood that. I can help you with accessible routes, bus and metro information, finding wheelchair-friendly places, or connecting with community support. Could you please tell me what you need?"
      : "I'm not sure I understood. 🤔\n\nI can help with:\n• Accessible route planning\n• Bus & Metro info\n• Wheelchair-friendly locations\n• Community support\n\nCould you please rephrase your question?",
    suggestions: ['Accessible routes', 'Bus info', 'Metro info', 'Help']
  };
};

function AIAssistant({ isOpen = false, onClose = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  
  const { preferences } = usePreferences();
  const isVoiceMode = preferences.mode === 'voice';
  const theme = preferences.theme || 'light';
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = isVoiceMode
        ? {
            type: 'bot',
            text: "Hello! I am your Accessible Chennai assistant. I'm here to help you navigate Chennai safely and independently. You can speak to me or type your question. How can I help you today?",
            suggestions: ['Find accessible route', 'Bus information', 'Metro stations', 'Need help']
          }
        : {
            type: 'bot',
            text: "Hello! 👋 I'm your **Accessible Chennai AI Assistant**.\n\nI can help you with:\n• ♿ Accessible route planning\n• 🚌 Bus & Metro information\n• 🗺️ Navigation guidance\n• 👥 Community support\n\nHow can I assist you today?",
            suggestions: ['Plan accessible route', 'Find bus', 'Metro info', 'Get help']
          };
      
      setMessages([welcomeMessage]);
      
      // Speak welcome message in voice mode
      if (isVoiceMode) {
        speakText(welcomeMessage.text);
      }
    }
  }, [isOpen, isVoiceMode]);
  
  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, ''));
      utterance.lang = 'en-IN';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  
  // Speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Auto-send after voice input
      setTimeout(() => handleSendMessage(transcript), 500);
    };
    
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.start();
  };
  
  // Handle sending message
  const handleSendMessage = (voiceText = null) => {
    const messageText = voiceText || inputValue.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage = { type: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Generate AI response with delay for natural feel
    setTimeout(() => {
      const response = generateAIResponse(messageText, isVoiceMode);
      const botMessage = { 
        type: 'bot', 
        text: response.text,
        suggestions: response.suggestions,
        action: response.action
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Speak response in voice mode
      if (isVoiceMode) {
        speakText(response.text);
      }
      
      // Auto close if suggested
      if (response.shouldClose) {
        setTimeout(() => onClose(), 2000);
      }
    }, 800);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Open Navigate page' || suggestion === 'Plan accessible route' || suggestion === 'Plan a route') {
      navigate('/navigate');
      onClose();
    } else if (suggestion === 'Open Community' || suggestion === 'Connect volunteer') {
      navigate('/community');
      onClose();
    } else if (suggestion === 'Open Settings') {
      navigate('/settings');
      onClose();
    } else if (suggestion === 'No, thanks') {
      onClose();
    } else {
      setInputValue(suggestion);
      handleSendMessage(suggestion);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Styles - Chat window positioned from top right corner (below header)
  const chatWindowStyle = {
    position: 'fixed',
    top: '70px',
    right: '20px',
    width: '380px',
    maxWidth: 'calc(100vw - 40px)',
    height: 'calc(100vh - 160px)',
    maxHeight: '600px',
    borderRadius: '20px',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
    animation: 'slideDown 0.3s ease'
  };
  
  const headerStyle = {
    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };
  
  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: theme === 'dark' ? '#0f172a' : '#f8fafc'
  };
  
  const userMessageStyle = {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '80%',
    fontSize: '14px',
    lineHeight: '1.5'
  };
  
  const botMessageStyle = {
    alignSelf: 'flex-start',
    background: theme === 'dark' ? '#334155' : '#ffffff',
    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    maxWidth: '85%',
    fontSize: '14px',
    lineHeight: '1.6',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    whiteSpace: 'pre-wrap'
  };
  
  const inputContainerStyle = {
    padding: '12px 16px',
    borderTop: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };
  
  const inputStyle = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: `1px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };
  
  const iconButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: theme === 'dark' ? '#334155' : '#e2e8f0',
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };
  
  const sendButtonStyle = {
    ...iconButtonStyle,
    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    color: 'white'
  };
  
  const suggestionStyle = {
    display: 'inline-block',
    padding: '8px 14px',
    margin: '4px',
    borderRadius: '16px',
    background: theme === 'dark' ? '#1e293b' : '#e0f2fe',
    color: theme === 'dark' ? '#60a5fa' : '#0369a1',
    fontSize: '13px',
    cursor: 'pointer',
    border: `1px solid ${theme === 'dark' ? '#3b82f6' : '#7dd3fc'}`,
    transition: 'all 0.2s'
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9998
        }}
      />
      
      {/* Chat Window */}
      <div style={chatWindowStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Accessible Chennai AI
              </h3>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>
                {isVoiceMode ? '🎙️ Voice Mode Active' : 'Your accessibility companion'}
              </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  style={{ ...iconButtonStyle, background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  title="Stop speaking"
                >
                  <FontAwesomeIcon icon={faVolumeMute} />
                </button>
              )}
              <button
                onClick={onClose}
                style={{ ...iconButtonStyle, background: 'rgba(255,255,255,0.2)', color: 'white' }}
                title="Close chat"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div style={messagesContainerStyle}>
            {messages.map((msg, index) => (
              <div key={index}>
                <div style={msg.type === 'user' ? userMessageStyle : botMessageStyle}>
                  {msg.text}
                </div>
                {/* Suggestions */}
                {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ marginTop: '8px', marginLeft: '4px' }}>
                    {msg.suggestions.map((suggestion, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={suggestionStyle}
                        onMouseOver={(e) => {
                          e.target.style.background = theme === 'dark' ? '#3b82f6' : '#0ea5e9';
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = theme === 'dark' ? '#1e293b' : '#e0f2fe';
                          e.target.style.color = theme === 'dark' ? '#60a5fa' : '#0369a1';
                        }}
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div style={{ ...botMessageStyle, padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#94a3b8',
                    animation: 'bounce 1s infinite'
                  }} />
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#94a3b8',
                    animation: 'bounce 1s infinite 0.2s'
                  }} />
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#94a3b8',
                    animation: 'bounce 1s infinite 0.4s'
                  }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div style={inputContainerStyle}>
            {isVoiceMode && (
              <button
                onClick={startListening}
                style={{
                  ...iconButtonStyle,
                  background: isListening ? '#ef4444' : (theme === 'dark' ? '#334155' : '#e2e8f0'),
                  color: isListening ? 'white' : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                  animation: isListening ? 'pulse 1s infinite' : 'none'
                }}
                title="Voice input"
              >
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              style={inputStyle}
            />
            <button
              onClick={() => handleSendMessage()}
              style={sendButtonStyle}
              disabled={!inputValue.trim()}
              title="Send message"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}
      
      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}

export default AIAssistant;
