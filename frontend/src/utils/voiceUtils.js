// Voice utilities for voice mode interaction
import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Voice Mode Introduction Message
 * Spoken automatically when Voice Mode is activated
 */
export const VOICE_MODE_INTRO = `Welcome to Accessible Chennai Voice Assistant. 
You are now in Voice Mode. 
This app helps you navigate public transport in Chennai with full accessibility support. 
You can control the entire app using only your voice. 

Here are the basic commands you can say:

Say "Home" to go to the home page.
Say "Plan Route" to start planning your journey.
Say "Nearby Bus Stop" to find bus stops near you.
Say "Accessible Routes" to get wheelchair accessible routes.
Say "Help" to connect with volunteers or transit staff.
Say "Repeat Instructions" to hear this message again.
Say "Exit Voice Mode" to switch to normal mode.

I am always listening and ready to help you. 
Please say your command now.`;

export const useVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [commandQueue, setCommandQueue] = useState([]);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const lastCommandTime = useRef(0);
  const commandDebounceMs = 300; // Debounce commands for smooth operation

  // Enhanced Speech synthesis with accessibility-optimized settings - optimized for performance
  const speak = useCallback((text, priority = false) => {
    if (!('speechSynthesis' in window)) return Promise.resolve();

    return new Promise((resolve) => {
      // Use requestAnimationFrame for smooth UI updates
      requestAnimationFrame(() => {
        if (speakTimeoutRef.current) {
          clearTimeout(speakTimeoutRef.current);
        }
        
        if (priority) {
          window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN'; // Indian English for Chennai context
        utterance.rate = 0.9; // Slightly faster for responsiveness
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        window.speechSynthesis.speak(utterance);
        
        // Optimized timeout
        speakTimeoutRef.current = setTimeout(() => {
          window.speechSynthesis.cancel();
          resolve();
        }, 20000);
      });
    });
  }, []);

  // Enhanced Speech recognition setup with comprehensive command handling - optimized
  const setupSpeechRecognition = useCallback((onCommand) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = 'en-IN'; // Indian English for better Chennai accent recognition
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 2; // Reduced for performance

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening for your command...');
    };

    recognitionRef.current.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      
      if (result.isFinal) {
        const now = Date.now();
        // Debounce rapid commands
        if (now - lastCommandTime.current < commandDebounceMs) {
          return;
        }
        lastCommandTime.current = now;
        
        const transcript = result[0].transcript.toLowerCase().trim();
        
        // Use requestAnimationFrame for smooth UI updates
        requestAnimationFrame(() => {
          setVoiceFeedback(`Processing: "${transcript}"`);
        });
        
        // Call the command handler
        if (onCommand) {
          onCommand(transcript);
        }
        
        // Reset silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      } else {
        const transcript = result[0].transcript;
        // Throttle interim result updates
        requestAnimationFrame(() => {
          setVoiceFeedback(`Listening: "${transcript}..."`);
        });
      }
    };

    recognitionRef.current.onspeechend = () => {
      // Start a timer to reassure user after prolonged silence
      const timer = setTimeout(() => {
        speak('I am still listening. Please say your command.');
      }, 10000); // 10 seconds of silence
      setSilenceTimer(timer);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        speak('I did not hear anything. Please say your command.');
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 2000);
      } else if (event.error === 'audio-capture') {
        speak('No microphone detected. Please check your microphone.');
        setIsListening(false);
      } else if (event.error === 'not-allowed') {
        speak('Microphone access denied. Please allow microphone access.');
        setIsListening(false);
      } else {
        speak('I did not understand that. Please repeat your command slowly.');
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 2000);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Auto-restart listening to maintain continuous voice mode
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            startListening();
          } catch (error) {
            console.error('Failed to restart listening:', error);
          }
        }
      }, 500);
    };
  }, [speak, silenceTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      window.speechSynthesis.cancel();
      stopListening();
    };
  }, [stopListening, silenceTimer]);

  return {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening,
    stopListening
  };
};

/**
 * Process voice command and determine action
 * Handles natural language variations
 */
export const processVoiceCommand = (command) => {
  const cmd = command.toLowerCase().trim();
  
  // Navigation commands
  if (cmd.includes('home') || cmd.includes('go home') || cmd.includes('take me home')) {
    return { action: 'navigate', destination: '/home' };
  }
  
  if (cmd.includes('plan route') || cmd.includes('route planning') || cmd.includes('plan a route') || 
      cmd.includes('start route') || cmd.includes('navigate') || cmd.includes('navigation')) {
    return { action: 'navigate', destination: '/navigate' };
  }
  
  if (cmd.includes('nearby bus') || cmd.includes('bus stop') || cmd.includes('nearest bus') ||
      cmd.includes('find bus stop')) {
    return { action: 'nearbyBusStop' };
  }
  
  if (cmd.includes('accessible route') || cmd.includes('wheelchair route') || 
      cmd.includes('accessible path') || cmd.includes('wheelchair accessible')) {
    return { action: 'accessibleRoute' };
  }
  
  if (cmd.includes('help') || cmd.includes('assistance') || cmd.includes('support') ||
      cmd.includes('connect volunteer') || cmd.includes('need help')) {
    return { action: 'navigate', destination: '/community' };
  }
  
  if (cmd.includes('repeat') || cmd.includes('say again') || cmd.includes('repeat instruction')) {
    return { action: 'repeatIntro' };
  }
  
  if (cmd.includes('exit voice') || cmd.includes('normal mode') || cmd.includes('turn off voice') ||
      cmd.includes('disable voice')) {
    return { action: 'exitVoiceMode' };
  }
  
  if (cmd.includes('community') || cmd.includes('connect') || cmd.includes('share')) {
    return { action: 'navigate', destination: '/community' };
  }
  
  if (cmd.includes('settings') || cmd.includes('preferences') || cmd.includes('options')) {
    return { action: 'navigate', destination: '/settings' };
  }
  
  if (cmd.includes('alerts') || cmd.includes('notifications')) {
    return { action: 'navigate', destination: '/alerts' };
  }
  
  // Unknown command
  return { action: 'unknown', command: cmd };
};

// Voice command keywords for different languages - SIMPLIFIED
export const getVoiceCommands = (language = 'en') => {
  const commands = {
    en: {
      navigation: {
        'home': 'home',
        'navigate|map|route': 'navigate', 
        'alerts': 'alerts',
        'community': 'community',
        'settings': 'settings',
        'logout|exit': 'logout'
      },
      actions: {
        'click|select|ok|yes': 'click',
        'back|return': 'back',
        'next|continue': 'next',
        'save|done': 'save',
        'cancel|no|stop': 'cancel',
        'refresh|update': 'refresh',
        'help|commands': 'help',
        'repeat|again': 'repeat'
      },
      forms: {
        'from|start': 'from',
        'to|destination|go': 'to',
        'search|find': 'search',
        'clear|reset': 'clear',
        'current location|here|my location': 'current'
      },
      simple: {
        // Ultra simple one-word commands
        'home': 'home',
        'map': 'navigate',
        'alerts': 'alerts', 
        'community': 'community',
        'settings': 'settings',
        'back': 'back',
        'help': 'help',
        'search': 'search',
        'clear': 'clear',
        'save': 'save',
        'cancel': 'cancel'
      }
    },
    ta: {
      navigation: {
        'வீடு': 'home',
        'வழி|மேப்': 'navigate',
        'அலர்ட்': 'alerts', 
        'சமூகம்': 'community',
        'செட்டிங்': 'settings',
        'வெளியேறு': 'logout'
      },
      actions: {
        'சரி|ஓகே': 'click',
        'பின்': 'back', 
        'அடுத்து': 'next',
        'சேவ்': 'save',
        'கேன்சல்': 'cancel',
        'அப்டேட்': 'refresh',
        'ஹெல்ப்': 'help',
        'ரிபீட்': 'repeat'
      },
      forms: {
        'ஃப்ரம்|ஸ்டார்ட்': 'from',
        'டூ|கோ': 'to',
        'சர்ச்': 'search',
        'க்ளியர்': 'clear',
        'கரண்ட் லொகேஷன்': 'current'
      },
      simple: {
        'வீடு': 'home',
        'மேப்': 'navigate',
        'அலர்ட்': 'alerts',
        'சமூகம்': 'community',
        'செட்டிங்': 'settings',
        'பின்': 'back',
        'ஹெல்ப்': 'help',
        'சர்ச்': 'search',
        'க்ளியர்': 'clear',
        'சேவ்': 'save'
      }
    }
  };
  
  return commands[language] || commands.en;
};
