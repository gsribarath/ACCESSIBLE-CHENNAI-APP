// Voice utilities for voice mode interaction
import { useCallback, useRef, useState, useEffect } from 'react';

export const useVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [commandQueue, setCommandQueue] = useState([]);
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);

  // Speech synthesis
  const speak = useCallback((text, priority = false) => {
    if (!('speechSynthesis' in window)) return Promise.resolve();

    return new Promise((resolve) => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      if (priority) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Default to English
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
      
      speakTimeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve();
      }, 15000);
    });
  }, []);

  // Speech recognition setup
  const setupSpeechRecognition = useCallback((onCommand) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = 'en-US'; // Default to English
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening for commands...');
    };

    recognitionRef.current.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      
      if (result.isFinal) {
        const transcript = result[0].transcript.toLowerCase().trim();
        setVoiceFeedback(`Command: "${transcript}"`);
        
        // Call the command handler
        if (onCommand) {
          onCommand(transcript);
        }
      } else {
        const transcript = result[0].transcript;
        setVoiceFeedback(`Listening: "${transcript}..."`);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 1000);
      } else {
        setIsListening(false);
        setVoiceFeedback('Speech recognition error');
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening();
          }
        }, 2000);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setTimeout(() => {
        if (recognitionRef.current) {
          startListening();
        }
      }, 500);
    };
  }, [speak]);

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
      window.speechSynthesis.cancel();
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening,
    stopListening
  };
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
