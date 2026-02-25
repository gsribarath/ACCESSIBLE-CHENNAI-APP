// Voice utilities for voice mode interaction
import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Voice Mode Introduction Message
 * Spoken automatically when Voice Mode is activated
 */
export const VOICE_MODE_INTRO = `Voice mode active. Say Navigate, Alerts, Community, or Settings.`;

/**
 * Emergency activation message
 */
export const VOICE_EMERGENCY = `Emergency mode activated.
Calling your emergency contact now.`;

/**
 * Voice speed settings
 */
export const VOICE_SPEEDS = {
  slow: 0.95,
  normal: 1.2,
  fast: 1.35
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
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const lastCommandTime = useRef(0);
  const isSpeakingRef = useRef(false);       // TRUE while TTS is active
  const micActiveRef = useRef(false);         // TRUE = voice mode is on, mic MUST stay alive
  const watchdogRef = useRef(null);           // Periodic timer that force-restarts mic
  const silenceTimerRef = useRef(null);
  const commandDebounceMs = 300;

  // ── Force-start mic (safe to call any time, any number of times) ──
  const forceStartMic = useCallback(() => {
    if (!recognitionRef.current || isSpeakingRef.current || !micActiveRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (_) {
      // "already started" or other – ignore, the watchdog will retry
    }
  }, []);

  // ── WATCHDOG: every 1.5 s, if mic should be on but isn't, restart it ──
  const startWatchdog = useCallback(() => {
    if (watchdogRef.current) clearInterval(watchdogRef.current);
    watchdogRef.current = setInterval(() => {
      if (micActiveRef.current && !isSpeakingRef.current) {
        // Check if recognition is actually running by testing isListening state
        // If not listening, force restart
        forceStartMic();
      }
    }, 1500);
  }, [forceStartMic]);

  const stopWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  // ── Speech synthesis ──
  const speak = useCallback((text, priority = false, slowSpeed = false) => {
    if (!('speechSynthesis' in window)) return Promise.resolve();

    return new Promise((resolve) => {
      isSpeakingRef.current = true;

      // Stop mic while speaking (browser can't do both well)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);

      // Cancel any pending speech
      window.speechSynthesis.cancel();
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);

      // Build sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      // If no sentence delimiters, treat the whole text as one sentence
      if (sentences.length === 0 && text.trim()) sentences.push(text.trim());

      let idx = 0;

      const done = () => {
        if (speakTimeoutRef.current) { clearTimeout(speakTimeoutRef.current); speakTimeoutRef.current = null; }
        isSpeakingRef.current = false;
        // Restart mic after speaking
        setTimeout(() => forceStartMic(), 250);
        resolve();
      };

      const next = () => {
        if (idx >= sentences.length) { done(); return; }
        const s = sentences[idx].trim();
        if (!s) { idx++; next(); return; }

        const utt = new SpeechSynthesisUtterance(s);
        utt.lang = 'en-IN';
        utt.rate = slowSpeed ? 1.0 : getVoiceSpeed();
        utt.pitch = 1.0;
        utt.volume = 1.0;
        utt.onend = () => { idx++; setTimeout(next, 150); };
        utt.onerror = () => { idx++; next(); };
        window.speechSynthesis.speak(utt);
      };

      next();

      // Safety timeout – never leave isSpeaking stuck
      speakTimeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
        done();
      }, 25000);
    });
  }, [forceStartMic]);

  // ── Speech recognition setup ──
  const setupSpeechRecognition = useCallback((onCommand) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 2;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const now = Date.now();
        if (now - lastCommandTime.current < commandDebounceMs) return;
        lastCommandTime.current = now;
        const transcript = last[0].transcript.toLowerCase().trim();
        setVoiceFeedback(`Processing: "${transcript}"`);
        if (onCommand) onCommand(transcript);
      } else {
        setVoiceFeedback(`Listening: "${last[0].transcript}..."`);
      }
    };

    recognitionRef.current.onspeechend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (!isSpeakingRef.current && micActiveRef.current) {
          speak('Still listening, go ahead', false, false);
        }
      }, 12000);
    };

    recognitionRef.current.onerror = (event) => {
      // During TTS, all errors are expected — ignore
      if (isSpeakingRef.current) return;

      if (event.error === 'audio-capture') {
        speak('No microphone detected, please check your microphone', true, true);
        micActiveRef.current = false;
        stopWatchdog();
      } else if (event.error === 'not-allowed') {
        speak('Microphone access denied, please allow microphone access in your browser', true, true);
        micActiveRef.current = false;
        stopWatchdog();
      }
      // For 'aborted', 'no-speech', 'network' → do nothing, let onend + watchdog handle
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // If speaking, don't restart — speak() will handle it
      if (isSpeakingRef.current) return;
      // If mic should be on, restart immediately
      if (micActiveRef.current) {
        setTimeout(() => forceStartMic(), 300);
      }
    };
  }, [speak, forceStartMic, stopWatchdog]);

  // ── Public start / stop ──
  const startListening = useCallback(() => {
    micActiveRef.current = true;
    startWatchdog();
    forceStartMic();
  }, [forceStartMic, startWatchdog]);

  const stopListening = useCallback(() => {
    micActiveRef.current = false;
    stopWatchdog();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
  }, [stopWatchdog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopWatchdog();
      window.speechSynthesis.cancel();
      micActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, [stopWatchdog]);

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
    START_LOCATION: "Tell me your starting location.",
    CONFIRM_START: `Starting location ${data.startLocation}. Confirm?`,
    START_CONFIRMED: "Locked.",
    DESTINATION: "Tell me your destination.",
    CONFIRM_DESTINATION: `Destination ${data.destination}. Confirm?`,
    DESTINATION_CONFIRMED: "Locked.",
    CHOOSE_MODE: "Walk or Public Transport?",
    FIND_ROUTES_PROMPT: "Say Find Routes to continue.",
    FINDING_ROUTES: "Finding routes. Please wait.",
    NO_ROUTES: "No routes found. Try different locations.",
    ROUTES_FOUND: (routes) => {
      let message = `${routes.length} routes found. `;
      routes.forEach((route, idx) => {
        message += `Route ${idx + 1}: ${route.type}, ${route.estimatedTime} minutes. `;
      });
      message += `Say Route 1, 2, or 3.`;
      return message;
    },
    ROUTE_SELECTED: (routeNum) => `Route ${routeNum} selected. Confirm?`,
    CONFIRM_BOOKING: `Confirm this route? Yes or No.`,
    BOOKING_CONFIRMED: "Route confirmed. Navigation starting.",
    BOOKING_CANCELLED: "Cancelled."
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
