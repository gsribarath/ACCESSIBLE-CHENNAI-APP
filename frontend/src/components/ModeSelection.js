import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

const ModeSelection = () => {
  const { preferences, updatePreferences, getText } = usePreferences();
  const [selectedMode, setSelectedMode] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [spokenText, setSpokenText] = useState(''); // Real-time spoken text display
  const [isSaving, setIsSaving] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false); // Track if welcome message was spoken
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple processing
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const hasRedirectedRef = useRef(false); // Prevent multiple redirects
  const navigate = useNavigate();

  // Speech synthesis setup - with callback when speech ends
  const speak = useCallback((text, onEnd = null) => {
    if ('speechSynthesis' in window) {
      // Clear any previous timeout
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferences.language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      
      window.speechSynthesis.speak(utterance);
      
      // Set timeout to clear the speech instance after it finishes
      speakTimeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
        if (onEnd) onEnd();
      }, 15000); // 15 seconds max for any speech
    } else if (onEnd) {
      onEnd();
    }
  }, [preferences.language]);

  // Process voice command - called immediately on recognition
  const processVoiceCommand = useCallback((transcript) => {
    if (isProcessing || hasRedirectedRef.current) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Check for voice mode keywords
    if (lowerTranscript.includes('voice') || lowerTranscript.includes('குரல்') || 
        lowerTranscript.includes('speak') || lowerTranscript.includes('vocal')) {
      setIsProcessing(true);
      hasRedirectedRef.current = true;
      return 'voice';
    }
    
    // Check for normal/touch mode keywords
    if (lowerTranscript.includes('normal') || lowerTranscript.includes('touch') || 
        lowerTranscript.includes('click') || lowerTranscript.includes('சாதாரண') || 
        lowerTranscript.includes('தொடு') || lowerTranscript.includes('standard')) {
      setIsProcessing(true);
      hasRedirectedRef.current = true;
      return 'normal';
    }
    
    return null;
  }, [isProcessing]);

  // Speech recognition setup
  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedbackMessage('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = preferences.language === 'ta' ? 'ta-IN' : 'en-IN';
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setFeedbackMessage('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      if (hasRedirectedRef.current) return;
      
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      const transcript = result[0].transcript;
      
      // Always show real-time spoken text
      setSpokenText(transcript);
      
      if (result.isFinal) {
        // Process the command immediately on final result
        const detectedMode = processVoiceCommand(transcript);
        
        if (detectedMode) {
          // Immediately handle mode selection
          handleModeSelect(detectedMode, transcript);
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // Silently restart for no-speech
        if (!hasRedirectedRef.current) {
          setTimeout(() => startListening(), 500);
        }
      } else if (event.error !== 'aborted') {
        setIsListening(false);
        // Try to restart after other errors
        if (!hasRedirectedRef.current) {
          setTimeout(() => startListening(), 1000);
        }
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Auto-restart if not redirected
      if (!hasRedirectedRef.current && !isProcessing) {
        setTimeout(() => startListening(), 300);
      }
    };
  }, [preferences.language, processVoiceCommand, isProcessing]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !hasRedirectedRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Already started, ignore
      }
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Already stopped, ignore
      }
    }
  }, []);

  // Initial setup - Welcome and start listening
  useEffect(() => {
    // Check if user should be on this page
    const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
    if (!userData || !userData.user_id) {
      navigate('/login');
      return;
    }

    // For existing users who already have a mode preference, redirect to home
    const savedPrefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
    if (savedPrefs.mode && savedPrefs.mode !== null) {
      navigate('/');
      return;
    }

    // Setup speech recognition first
    setupSpeechRecognition();
    
    // Welcome message and start listening after speech ends
    if (!hasSpoken) {
      const welcomeMessage = "Welcome to Accessible Chennai. Please say Voice Mode or Normal Mode to continue.";
      
      const timer = setTimeout(() => {
        speak(welcomeMessage, () => {
          // Start listening immediately after welcome message ends
          setHasSpoken(true);
          startListening();
        });
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (speakTimeoutRef.current) {
          clearTimeout(speakTimeoutRef.current);
        }
        window.speechSynthesis.cancel();
        stopListening();
      };
    }
  }, [setupSpeechRecognition, speak, navigate, hasSpoken, startListening, stopListening]);

  // Handle mode selection - immediate redirect
  const handleModeSelect = async (mode, spokenTranscript = '') => {
    if (hasRedirectedRef.current && selectedMode) return; // Already processing
    
    hasRedirectedRef.current = true;
    setSelectedMode(mode);
    setIsProcessing(true);
    
    // Stop listening immediately
    stopListening();
    
    // Show what was spoken
    if (spokenTranscript) {
      setSpokenText(spokenTranscript);
    }
    
    // Quick feedback
    const feedbackMsg = mode === 'voice' 
      ? 'Voice Mode selected. Redirecting...' 
      : 'Normal Mode selected. Redirecting...';
    setFeedbackMessage(feedbackMsg);
    
    // Speak confirmation briefly
    speak(mode === 'voice' ? 'Voice Mode activated' : 'Normal Mode activated');
    
    setIsSaving(true);
    
    try {
      // Update preferences
      await updatePreferences({ mode });
      
      // Save to database if user is logged in
      const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
      if (userData && userData.user_id) {
        try {
          await fetch(`/api/user/${userData.user_id}/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
          });
        } catch (serverError) {
          console.error('Server error:', serverError);
        }
      }
      
      // Quick redirect - 1.5 seconds to hear feedback
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save mode preference:', error);
      setFeedbackMessage('Error saving preferences. Please try again.');
      setIsSaving(false);
      setIsProcessing(false);
      hasRedirectedRef.current = false;
    }
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (event, mode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleModeSelect(mode);
    }
  };

  // Manual voice activation button
  const handleVoiceActivation = () => {
    if (isListening) {
      stopListening();
      setFeedbackMessage('Voice recognition paused');
    } else {
      speak("Please say Voice Mode or Normal Mode", () => {
        startListening();
      });
      setFeedbackMessage('Starting voice recognition...');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      transition: 'var(--transition)'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '500px',
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <img 
          src="/accessibility-logo.png" 
          alt="Accessible Chennai Logo" 
          style={{ 
            width: '120px', 
            height: '120px', 
            marginBottom: '16px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid var(--accent-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        
        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '8px',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          Select Your Interaction Mode
        </h1>
        
        {/* Voice Recognition Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          background: isListening ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          border: isListening ? '1px solid #4CAF50' : '1px solid transparent'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isListening ? '#4CAF50' : '#ccc',
            animation: isListening ? 'pulse-dot 1s infinite' : 'none'
          }} />
          <span style={{
            fontSize: '14px',
            color: isListening ? '#4CAF50' : 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {isListening ? 'Voice recognition ready' : 'Voice recognition ready'}
          </span>
        </div>
        
        {/* Mode Selection Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%'
        }}>
          {/* Touch/Click Mode Option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleModeSelect('normal')}
            onKeyDown={(e) => handleKeyDown(e, 'normal')}
            style={{
              padding: '20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background-color 0.3s',
              background: selectedMode === 'normal' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: selectedMode === 'normal' ? '#ffffff' : 'var(--text-primary)',
              border: `2px solid ${selectedMode === 'normal' ? 'var(--accent-color)' : 'var(--border-color)'}`,
              transform: selectedMode === 'normal' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedMode === 'normal' ? 'var(--shadow)' : 'none'
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.02-.24-.02-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.43 1.04.43h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.89-1.38z" 
                fill={selectedMode === 'normal' ? '#ffffff' : 'currentColor'}
              />
            </svg>
            <p style={{ 
              marginTop: '12px', 
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              Touch/Click
            </p>
          </div>
          
          {/* Voice Mode Option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleModeSelect('voice')}
            onKeyDown={(e) => handleKeyDown(e, 'voice')}
            style={{
              padding: '20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background-color 0.3s',
              background: selectedMode === 'voice' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: selectedMode === 'voice' ? '#ffffff' : 'var(--text-primary)',
              border: `2px solid ${selectedMode === 'voice' ? 'var(--accent-color)' : 'var(--border-color)'}`,
              transform: selectedMode === 'voice' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedMode === 'voice' ? 'var(--shadow)' : 'none'
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" 
                fill={selectedMode === 'voice' ? '#ffffff' : 'currentColor'}
              />
            </svg>
            <p style={{ 
              marginTop: '12px', 
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              Voice Mode
            </p>
          </div>
        </div>
        
        {/* Voice Activation Button */}
        <button
          onClick={handleVoiceActivation}
          disabled={isProcessing}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            borderRadius: '50px',
            background: isListening ? 'var(--accent-color)' : 'transparent',
            color: isListening ? '#ffffff' : 'var(--accent-color)',
            border: '2px solid var(--accent-color)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            opacity: isProcessing ? 0.6 : 1,
            fontSize: '15px',
            fontWeight: '500'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" 
              fill={isListening ? '#ffffff' : 'var(--accent-color)'}
            />
          </svg>
          <span>Start Voice Recognition</span>
        </button>
        
        {/* Real-time Spoken Text Display - Large and Prominent */}
        <div style={{
          marginTop: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: spokenText ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.03)',
          border: spokenText ? '2px solid var(--accent-color)' : '2px solid transparent',
          textAlign: 'center',
          width: '100%',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          <span style={{
            fontSize: spokenText ? '18px' : '15px',
            fontWeight: spokenText ? '600' : '400',
            color: spokenText ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontStyle: spokenText ? 'normal' : 'italic'
          }}>
            {spokenText || (isListening ? 'Listening...' : 'Listening...')}
          </span>
        </div>
        
        {/* Feedback Message */}
        {feedbackMessage && (
          <div style={{
            padding: '10px 16px',
            borderRadius: '8px',
            background: isProcessing ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
            width: '100%',
            animation: 'fadeIn 0.3s',
            color: isProcessing ? '#4CAF50' : 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            {feedbackMessage}
          </div>
        )}
        
        {/* Loading Indicator during save */}
        {isSaving && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '10px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderTop: '3px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Redirecting...
            </span>
          </div>
        )}
      </div>
      
      {/* Global animations */}
      <style>
        {`
          @keyframes pulse-dot {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.5; 
              transform: scale(1.2);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ModeSelection;