import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

const ModeSelection = () => {
  const { preferences, updatePreferences, getText } = usePreferences();
  const [selectedMode, setSelectedMode] = useState(preferences.mode || 'normal');
  const [isListening, setIsListening] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Speech synthesis setup
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      // Clear any previous timeout
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferences.language === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
      
      // Set timeout to clear the speech instance after it finishes
      speakTimeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 10000); // 10 seconds max for any speech
    }
  }, [preferences.language]);

  // Speech recognition setup
  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedbackMessage('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true; // Enable continuous listening
    recognitionRef.current.lang = preferences.language === 'ta' ? 'ta-IN' : 'en-US';
    recognitionRef.current.interimResults = true; // Show interim results

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setFeedbackMessage(getText('listening'));
    };

    recognitionRef.current.onresult = (event) => {
      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      
      if (result.isFinal) {
        const transcript = result[0].transcript.toLowerCase().trim();
        setFeedbackMessage(`"${transcript}"`);
        
        // Process voice command
        if (transcript.includes('voice') || transcript.includes('குரல்')) {
          handleModeSelect('voice');
        } else if (transcript.includes('normal') || transcript.includes('touch') || transcript.includes('click') || 
                  transcript.includes('சாதாரண') || transcript.includes('தொடு')) {
          handleModeSelect('normal');
        } else {
          // Don't show error for continuous listening, just wait for next command
          setFeedbackMessage(getText('listening'));
        }
      } else {
        // Show interim results
        const transcript = result[0].transcript;
        setFeedbackMessage(`${getText('listening')}: "${transcript}..."`);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      
      // Handle different types of errors
      if (event.error === 'no-speech') {
        // Restart listening after no speech
        setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            startListening();
          }
        }, 1000);
      } else if (event.error === 'aborted') {
        // Don't restart if aborted intentionally
        setIsListening(false);
      } else {
        setIsListening(false);
        setFeedbackMessage(getText('errorListening'));
        
        // Try to restart after other errors
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 2000);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      
      // Automatically restart listening unless mode was selected
      if (!selectedMode || selectedMode === preferences.mode) {
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 500);
      }
    };
  }, [preferences.language, getText, selectedMode, isListening]);

  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition error on start:', error);
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Speech recognition error on stop:', error);
      }
    }
  };

  // Initial setup
  useEffect(() => {
    // Check if user should be on this page
    const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
    if (!userData || !userData.user_id) {
      // No user logged in, redirect to login
      navigate('/login');
      return;
    }

    // For existing users who already have a mode preference, redirect to home
    const savedPrefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
    if (savedPrefs.mode && savedPrefs.mode !== null) {
      navigate('/');
      return;
    }

    setupSpeechRecognition();
    
    // Welcome message for new users and start listening
    const timer = setTimeout(() => {
      speak(getText('selectMode'));
      // Start continuous listening after welcome message
      setTimeout(() => {
        startListening();
      }, 3000);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        stopListening();
      }
    };
  }, [setupSpeechRecognition, speak, getText, navigate]);

  // Handle mode selection
  const handleModeSelect = async (mode) => {
    setSelectedMode(mode);
    
    // Feedback based on selected mode
    if (mode === 'voice') {
      speak(getText('voiceModeSelected'));
      setFeedbackMessage(getText('voiceModeSelected'));
    } else {
      speak(getText('normalModeSelected'));
      setFeedbackMessage(getText('normalModeSelected'));
    }
    
    // Stop listening when a mode is selected
    stopListening();
    
    // Prepare to save preferences
    setIsSaving(true);
    
    try {
      // Update preferences in context (which will also save to localStorage)
      await updatePreferences({ mode });
      
      // Save to database if user is logged in
      const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
      if (userData && userData.user_id) {
        try {
          const response = await fetch(`/api/user/${userData.user_id}/preferences`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode })
          });
          
          if (!response.ok) {
            console.warn('Failed to save mode preference to server, but saved locally');
          }
        } catch (serverError) {
          console.error('Server error when saving preference:', serverError);
          // Continue anyway as we've saved to localStorage
        }
      }
      
      // Navigate to home after a short delay to allow the feedback message to be heard/read
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to save mode preference:', error);
      setFeedbackMessage(getText('errorSavingPreferences'));
      setIsSaving(false);
    }
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (event, mode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleModeSelect(mode);
    }
  };

  // Handle voice activation
  const handleVoiceActivation = () => {
    if (isListening) {
      stopListening();
      setFeedbackMessage('Voice recognition stopped');
    } else {
      speak(getText('pleaseSpeak'));
      setFeedbackMessage(getText('pleaseSpeak'));
      startListening();
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
          marginBottom: '16px',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          {getText('selectMode')}
        </h1>
        
        {/* Continuous listening indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '20px',
          background: isListening ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          border: isListening ? '1px solid var(--accent-color)' : '1px solid transparent'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isListening ? 'var(--accent-color)' : '#ccc',
            animation: isListening ? 'blink 1s infinite' : 'none'
          }} />
          <span style={{
            fontSize: '14px',
            color: isListening ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {isListening ? getText('continuousListening') : 'Voice recognition ready'}
          </span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%'
        }}>
          {/* Normal Mode Option */}
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
              fontWeight: '500',
              textAlign: 'center' 
            }}>
              {getText('normal')}
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
              fontWeight: '500',
              textAlign: 'center' 
            }}>
              {getText('voice')}
            </p>
          </div>
        </div>
        
        {/* Voice Activation Button */}
        <button
          onClick={handleVoiceActivation}
          style={{
            marginTop: '20px',
            padding: '12px 20px',
            borderRadius: '50px',
            background: isListening ? 'var(--accent-color)' : 'transparent',
            color: isListening ? '#ffffff' : 'var(--text-primary)',
            border: '2px solid var(--accent-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isListening && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 1.5s infinite',
              background: 'rgba(255, 255, 255, 0.2)',
              zIndex: 0
            }} />
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
            <path 
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" 
              fill={isListening ? '#ffffff' : 'var(--accent-color)'}
            />
          </svg>
          <span style={{ position: 'relative', zIndex: 1 }}>
            {isListening ? getText('listening') + ' (Click to stop)' : getText('activateVoice')}
          </span>
        </button>
        
        {/* Feedback Message */}
        {feedbackMessage && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
            width: '100%',
            animation: 'fadeIn 0.5s',
            color: 'var(--text-primary)'
          }}>
            {feedbackMessage}
          </div>
        )}
        
        {/* Loading Indicator during save */}
        {isSaving && (
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderTop: '3px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>{getText('saving')}</span>
          </div>
        )}
      </div>
      
      {/* Global animations */}
      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
              opacity: 0.3;
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.2);
            }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
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