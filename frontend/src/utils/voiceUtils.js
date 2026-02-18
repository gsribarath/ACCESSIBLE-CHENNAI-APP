// Voice utilities for voice mode interaction
import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Voice Mode Introduction Message
 * Spoken automatically when Voice Mode is activated
 */
export const VOICE_MODE_INTRO = `Welcome to Accessible Chennai.
You can say Navigate, Alerts, Community, or Settings.
What would you like to do?`;

/**
 * Emergency activation message
 */
export const VOICE_EMERGENCY = `Emergency mode activated.
Calling your emergency contact now.`;

/**
 * Voice speed settings
 */
export const VOICE_SPEEDS = {
  slow: 0.75,
  normal: 0.9,
  fast: 1.1
};

/**
 * Get voice speed from settings
 */
export const getVoiceSpeed = () => {
  try {
    const prefs = JSON.parse(localStorage.getItem('ac_prefs') || '{}');
    return VOICE_SPEEDS[prefs.voiceSpeed || 'normal'];
  } catch {
    return VOICE_SPEEDS.normal;
  }
};

export const useVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [commandQueue, setCommandQueue] = useState([]);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const lastCommandTime = useRef(0);
  const isStartingRef = useRef(false); // Flag to prevent multiple simultaneous starts
  const shouldRestartRef = useRef(true); // Flag to control auto-restart
  const commandDebounceMs = 300; // Debounce commands for smooth operation

  // Enhanced Speech synthesis with accessibility-optimized settings - optimized for performance
  const speak = useCallback((text, priority = false, slowSpeed = false) => {
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
        
        // Split text into sentences for better pacing
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        let currentIndex = 0;
        
        const speakNextSentence = () => {
          if (currentIndex >= sentences.length) {
            resolve();
            return;
          }
          
          const sentence = sentences[currentIndex].trim();
          if (!sentence) {
            currentIndex++;
            speakNextSentence();
            return;
          }
          
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.lang = 'en-IN'; // Indian English for Chennai context
          utterance.rate = slowSpeed ? 0.7 : getVoiceSpeed(); // Slower for important info
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            currentIndex++;
            // Short pause between sentences
            setTimeout(speakNextSentence, 300);
          };
          
          utterance.onerror = () => {
            currentIndex++;
            speakNextSentence();
          };
          
          window.speechSynthesis.speak(utterance);
        };
        
        speakNextSentence();
        
        // Optimized timeout
        speakTimeoutRef.current = setTimeout(() => {
          window.speechSynthesis.cancel();
          resolve();
        }, 30000); // Longer timeout for complex messages
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
      isStartingRef.current = false; // Reset flag once successfully started
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
        speak('I am still listening. Please say your command.', false, true);
      }, 8000); // 8 seconds of silence
      setSilenceTimer(timer);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      isStartingRef.current = false;
      
      if (event.error === 'no-speech') {
        speak('I did not hear anything. Please say your command.', true, true);
        // Don't auto-restart, let onend handle it
      } else if (event.error === 'audio-capture') {
        speak('No microphone detected. Please check your microphone.', true, true);
        shouldRestartRef.current = false;
      } else if (event.error === 'not-allowed') {
        speak('Microphone access denied. Please allow microphone access.', true, true);
        shouldRestartRef.current = false;
      } else if (event.error === 'aborted') {
        // Aborted error is normal when stopping/restarting, just log it
        console.log('Speech recognition aborted - this is normal during restart');
      } else {
        speak('Sorry, I did not understand. Please try again.', true, true);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      isStartingRef.current = false;
      
      // Auto-restart listening to maintain continuous voice mode
      if (shouldRestartRef.current && recognitionRef.current) {
        setTimeout(() => {
          if (recognitionRef.current && shouldRestartRef.current && !isStartingRef.current) {
            try {
              startListening();
            } catch (error) {
              console.error('Failed to restart listening:', error);
            }
          }
        }, 500);
      }
    };
  }, [speak, silenceTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isStartingRef.current) {
      try {
        isStartingRef.current = true;
        shouldRestartRef.current = true;
        recognitionRef.current.start();
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        isStartingRef.current = false;
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
    isStartingRef.current = false;
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
 * Handles natural language variations for accessibility-first interaction
 */
export const processVoiceCommand = (command) => {
  const cmd = command.toLowerCase().trim();
  
  // EMERGENCY COMMANDS - Highest priority
  if (cmd.includes('emergency') || cmd.includes('help me') || cmd.includes('urgent')) {
    return { action: 'emergency' };
  }
  
  // Navigation section commands  
  if (cmd.includes('navigate') || cmd.includes('navigation')) {
    return { action: 'navigate', destination: '/navigate' };
  }
  
  if (cmd.includes('home')) {
    return { action: 'navigate', destination: '/' };
  }
  
  if (cmd.includes('alert')) {
    return { action: 'navigate', destination: '/alerts' };
  }
  
  if (cmd.includes('community')) {
    return { action: 'navigate', destination: '/community' };
  }
  
  if (cmd.includes('setting')) {
    return { action: 'navigate', destination: '/settings' };
  }
  
  // Navigation flow commands
  if (cmd.includes('find accessible route') || cmd.includes('accessible route')) {
    return { action: 'findAccessibleRoutes' };
  }
  
  if (cmd.includes('route 1') || cmd.includes('route one') || 
      cmd.includes('first route') || cmd.includes('option 1')) {
    return { action: 'selectRoute', routeIndex: 0 };
  }
  
  if (cmd.includes('route 2') || cmd.includes('route two') || 
      cmd.includes('second route') || cmd.includes('option 2')) {
    return { action: 'selectRoute', routeIndex: 1 };
  }
  
  if (cmd.includes('route 3') || cmd.includes('route three') || 
      cmd.includes('third route') || cmd.includes('option 3')) {
    return { action: 'selectRoute', routeIndex: 2 };
  }
  
  // Confirmation commands
  if (cmd.includes('confirm') || cmd.includes('yes') || cmd.includes('correct') || 
      cmd.includes('okay') || cmd.includes('ok') || cmd.includes('sure')) {
    return { action: 'confirm', value: true };
  }
  
  if (cmd.includes('no') || cmd.includes('cancel') || cmd.includes('wrong') || 
      cmd.includes('incorrect')) {
    return { action: 'confirm', value: false };
  }
  
  // Repeat/Help commands
  if (cmd.includes('repeat') || cmd.includes('say again') || cmd.includes('again')) {
    return { action: 'repeat' };
  }
  
  // Settings commands
  if (cmd.includes('change voice speed') || cmd.includes('voice speed')) {
    return { action: 'changeVoiceSpeed' };
  }
  
  if (cmd.includes('slow')) {
    return { action: 'setSpeed', speed: 'slow' };
  }
  
  if (cmd.includes('normal')) {
    return { action: 'setSpeed', speed: 'normal' };
  }
  
  if (cmd.includes('fast')) {
    return { action: 'setSpeed', speed: 'fast' };
  }
  
  if (cmd.includes('change language')) {
    return { action: 'changeLanguage' };
  }
  
  if (cmd.includes('emergency contact')) {
    return { action: 'emergencyContacts' };
  }
  
  // Community commands
  if (cmd.includes('post update')) {
    return { action: 'postUpdate' };
  }
  
  if (cmd.includes('hear nearby update') || cmd.includes('nearby update')) {
    return { action: 'nearbyUpdates' };
  }
  
  if (cmd.includes('ask for help')) {
    return { action: 'askHelp' };
  }
  
  if (cmd.includes('next')) {
    return { action: 'next' };
  }
  
  // Alerts commands
  if (cmd.includes('clear alert')) {
    return { action: 'clearAlerts' };
  }
  
  // Unknown command
  return { action: 'unknown', command: cmd };
};

/**
 * Voice Assistant State Manager
 * Manages conversation state for voice-guided interactions
 */
export class VoiceAssistantState {
  constructor() {
    this.currentFlow = null;
    this.currentStep = 0;
    this.data = {};
    this.lastMessage = '';
  }
  
  startFlow(flowName) {
    this.currentFlow = flowName;
    this.currentStep = 0;
    this.data = {};
  }
  
  nextStep() {
    this.currentStep++;
  }
  
  setData(key, value) {
    this.data[key] = value;
  }
  
  getData(key) {
    return this.data[key];
  }
  
  reset() {
    this.currentFlow = null;
    this.currentStep = 0;
    this.data = {};
  }
  
  setLastMessage(message) {
    this.lastMessage = message;
  }
  
  getLastMessage() {
    return this.lastMessage;
  }
}

/**
 * Navigate flow messages
 */
export const getNavigateFlowMessage = (step, data = {}) => {
  const messages = {
    START_LOCATION: "Please tell me your starting location.",
    CONFIRM_START: `Your starting location is ${data.startLocation}. Is this correct? Please say Yes or No.`,
    START_CONFIRMED: "Starting location confirmed.",
    DESTINATION: "Please tell me your destination.",
    CONFIRM_DESTINATION: `Your destination is ${data.destination}. Is this correct? Please say Yes or No.`,
    DESTINATION_CONFIRMED: "Destination confirmed.",
    FIND_ROUTES_PROMPT: "Please say Find Accessible Routes to check the best accessible travel options.",
    FINDING_ROUTES: "Finding accessible routes now. Please wait.",
    NO_ROUTES: "Sorry, no accessible routes found for this journey. Please try different locations.",
    ROUTES_FOUND: (routes) => {
      let message = `I found ${routes.length} accessible route${routes.length > 1 ? 's' : ''}. `;
      routes.forEach((route, idx) => {
        message += `Route ${idx + 1}: ${route.type} route. ${route.accessibility} accessibility. Estimated travel time ${route.estimatedTime} minutes. `;
      });
      message += `Please say Route 1, Route 2, or Route 3 to select.`;
      return message;
    },
    ROUTE_SELECTED: (routeNum) => `You selected Route ${routeNum}.`,
    CONFIRM_BOOKING: `Do you want to confirm this route? Please say Confirm or Cancel.`,
    BOOKING_CONFIRMED: "Your accessible route has been confirmed. Navigation guidance will now begin. I will guide you step by step.",
    BOOKING_CANCELLED: "Route booking cancelled. Returning to navigation menu."
  };
  
  return messages[step] || "";
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
