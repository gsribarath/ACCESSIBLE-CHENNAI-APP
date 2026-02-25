import React, { useState, useEffect, useRef, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPlay, 
  faStop, 
  faCompass,
  faSearch,
  faCrosshairs,
  faMicrophone,
  faTrain,
  faCar,
  faBus,
  faRoute,
  faWalking,
  faFlag,
  faLocationArrow,
  faMap,
  faDirections
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';
import MetroNavigation from '../components/MetroNavigation';
import MTCBusNavigation from '../components/MTCBusNavigation';
import EnhancedMap from '../components/EnhancedMap';
import FullScreenMap from '../components/FullScreenMap';
import LocationDropdownPicker, { CHENNAI_LOCATIONS } from '../components/LocationDropdownPicker';
import LocationService from '../services/LocationService';
import { usePreferences } from '../context/PreferencesContext';
import { useVoiceInterface } from '../utils/voiceUtils';
import '../styles/metro.css';

// ========== FUZZY LOCATION MATCHING ==========
// Matches spoken voice input against the CHENNAI_LOCATIONS dataset
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Calculate similarity score between two strings (0 to 1)
const similarityScore = (a, b) => {
  const aNorm = normalizeText(a);
  const bNorm = normalizeText(b);
  
  // Exact match
  if (aNorm === bNorm) return 1.0;
  
  // One contains the other
  if (bNorm.includes(aNorm)) return 0.85 + (aNorm.length / bNorm.length) * 0.1;
  if (aNorm.includes(bNorm)) return 0.8;
  
  // Word-level matching
  const aWords = aNorm.split(' ');
  const bWords = bNorm.split(' ');
  let matchedWords = 0;
  for (const aw of aWords) {
    if (aw.length < 2) continue;
    for (const bw of bWords) {
      if (bw.includes(aw) || aw.includes(bw)) {
        matchedWords++;
        break;
      }
    }
  }
  const wordScore = aWords.length > 0 ? matchedWords / aWords.length : 0;
  
  // Levenshtein-based similarity for short inputs
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 0;
  const dist = levenshteinDistance(aNorm, bNorm);
  const levScore = 1 - (dist / maxLen);
  
  return Math.max(wordScore * 0.9, levScore);
};

const levenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Match spoken input against CHENNAI_LOCATIONS dataset.
 * Returns: { matches: [{name, category, score}], bestMatch: {name, category, score} | null }
 * Thresholds: score >= 0.5 to be a viable match
 */
const matchLocationFromDataset = (spokenInput) => {
  if (!spokenInput || spokenInput.trim().length < 2) {
    return { matches: [], bestMatch: null };
  }
  
  const scored = CHENNAI_LOCATIONS.map(loc => ({
    name: loc.name,
    category: loc.category,
    score: similarityScore(spokenInput, loc.name)
  }))
    .filter(m => m.score >= 0.45)
    .sort((a, b) => b.score - a.score);
  
  // Get top matches (score within 0.1 of best)
  const topMatches = scored.length > 0
    ? scored.filter(m => m.score >= scored[0].score - 0.1).slice(0, 5)
    : [];
  
  return {
    matches: topMatches,
    bestMatch: topMatches.length > 0 ? topMatches[0] : null
  };
};

// Debounce helper for smooth performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Navigate = () => {
  const { preferences, getThemeStyles, getCardStyles, getTextStyles, getButtonStyles, getText } = usePreferences();
  const [user] = useState({ name: 'User' });
  const [transportMode, setTransportMode] = useState('general'); // 'general', 'metro', 'bus'
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });
  const [activeInput, setActiveInput] = useState(null);
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);
  const [dataRestored, setDataRestored] = useState(false);
  const [searchQueryFrom, setSearchQueryFrom] = useState('');
  const [searchQueryTo, setSearchQueryTo] = useState('');
  const debouncedSearchFrom = useDebounce(searchQueryFrom, 150);
  const debouncedSearchTo = useDebounce(searchQueryTo, 150);
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [fromPickerPosition, setFromPickerPosition] = useState({ top: 0, left: 0, width: '100%' });
  const [toPickerPosition, setToPickerPosition] = useState({ top: 0, left: 0, width: '100%' });
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionsRef = useRef(null);
  const toSuggestionsRef = useRef(null);
  const isVoiceMode = preferences.mode === 'voice';
  
  // Voice interface setup
  const {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening,
    stopListening
  } = useVoiceInterface();

  // Voice-guided flow state
  const [voiceFlowStep, setVoiceFlowStep] = useState(null);
  // Strict voice flow states:
  // null -> START_LOCATION -> [PICK_START_MATCH] -> CONFIRM_START -> DESTINATION -> [PICK_DEST_MATCH] -> CONFIRM_DESTINATION -> CHOOSE_MODE -> BOTH_LOCKED -> FINDING_ROUTES -> SELECT_ROUTE -> CONFIRM_BOOKING
  const [voiceFlowData, setVoiceFlowData] = useState({
    startLocation: '',
    destination: '',
    selectedRouteIndex: null,
    pendingMatches: [] // For multi-match selection
  });
  const [voiceSetupComplete, setVoiceSetupComplete] = useState(false);
  const voiceSetupStartedRef = useRef(false); // Prevent duplicate voice flow init (React StrictMode)
  // Location locking state for strict voice mode
  const [fromLocked, setFromLocked] = useState(false);
  const [toLocked, setToLocked] = useState(false);
  const voiceFlowStepRef = useRef(null);
  const voiceFlowDataRef = useRef({ startLocation: '', destination: '', selectedRouteIndex: null, pendingMatches: [] });
  const handleVoiceFlowCommandRef = useRef(null);
  const routesRef = useRef([]);

  // Data persistence functions
  const saveNavigationData = () => {
    const navigationData = {
      fromLocation,
      toLocation,
      transportMode,
      routes,
      selectedRoute,
      timestamp: Date.now()
    };
    localStorage.setItem('accessibleChennaiNavigation', JSON.stringify(navigationData));
  };

  const loadNavigationData = () => {
    try {
      const saved = localStorage.getItem('accessibleChennaiNavigation');
      if (saved) {
        const data = JSON.parse(saved);
        // Check if data is less than 24 hours old
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - data.timestamp < twentyFourHours) {
          setFromLocation(data.fromLocation || '');
          setToLocation(data.toLocation || '');
          setTransportMode(data.transportMode || 'general');
          setRoutes(data.routes || []);
          setSelectedRoute(data.selectedRoute || null);
          
          // Show notification if any data was restored
          if (data.fromLocation || data.toLocation || data.routes?.length > 0) {
            setDataRestored(true);
            setTimeout(() => setDataRestored(false), 5000); // Hide after 5 seconds
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading navigation data:', error);
    }
    return false;
  };

  const clearNavigationData = () => {
    localStorage.removeItem('accessibleChennaiNavigation');
    setFromLocation('');
    setToLocation('');
    setRoutes([]);
    setSelectedRoute(null);
    setError('');
    setDataRestored(false);
  };

  // Always start fresh when navigating to this page
  useEffect(() => {
    localStorage.removeItem('accessibleChennaiNavigation');
    setFromLocation('');
    setToLocation('');
    setRoutes([]);
    setSelectedRoute(null);
    setFromLocked(false);
    setToLocked(false);
    setError('');
  }, []);

  // No longer auto-saving navigation state to avoid stale data on page revisit
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedFromInput = fromInputRef.current && fromInputRef.current.contains(event.target);
      const clickedToInput = toInputRef.current && toInputRef.current.contains(event.target);
      const clickedFromSuggestions = fromSuggestionsRef.current && fromSuggestionsRef.current.contains(event.target);
      const clickedToSuggestions = toSuggestionsRef.current && toSuggestionsRef.current.contains(event.target);
      
      if (!clickedFromInput && !clickedToInput && !clickedFromSuggestions && !clickedToSuggestions) {
        setSuggestions({ from: [], to: [] });
        setActiveInput(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Voice-guided flow handler - starts immediately when entering voice mode
  useEffect(() => {
    if (!isVoiceMode) {
      // Clean up when leaving voice mode
      setVoiceSetupComplete(false);
      voiceSetupStartedRef.current = false;
      setVoiceFlowStep(null);
      voiceFlowStepRef.current = null;
      setFromLocked(false);
      setToLocked(false);
      stopListening();
      return;
    }

    if (voiceSetupComplete || voiceSetupStartedRef.current || !setupSpeechRecognition) {
      return;
    }

    // Immediately mark as started to prevent duplicate invocations (React StrictMode)
    voiceSetupStartedRef.current = true;

    // Start the strict voice-guided flow
    const startVoiceFlow = async () => {
      try {
        console.log('Starting strict voice-guided navigation flow');
        
        // Setup command listener first
        setupSpeechRecognition((transcript) => {
          if (handleVoiceFlowCommandRef.current) {
            handleVoiceFlowCommandRef.current(transcript);
          }
        });
        
        // Wait a bit for recognition to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Welcome and ask for starting location - clear and natural
        await speak('Where are you starting from?', true, false);
        
        setVoiceFlowStep('START_LOCATION');
        voiceFlowStepRef.current = 'START_LOCATION';
        
        // Start listening after speaking
        await new Promise(resolve => setTimeout(resolve, 400));
        startListening();
        
        setVoiceSetupComplete(true);
      } catch (error) {
        console.error('Error starting voice flow:', error);
      }
    };
    
    startVoiceFlow();
  }, [isVoiceMode, voiceSetupComplete, setupSpeechRecognition, speak, startListening, stopListening]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up voice mode when leaving the page
      if (stopListening) {
        stopListening();
      }
      window.speechSynthesis.cancel();
    };
  }, [stopListening]);

  // Helper functions - defined before handleVoiceFlowCommand to avoid reference errors
  const selectRouteByVoice = useCallback(async (index) => {
    const currentRoutes = routesRef.current;
    if (!currentRoutes[index]) {
      await speak('Invalid selection. Say 1, 2, or 3.', true, false);
      return;
    }
    
    const route = currentRoutes[index];
    setSelectedRoute(route);
    
    // Determine travel mode for Google Maps based on route type
    let travelMode = 'transit';
    const routeType = (route.type || route.mode || '').toLowerCase();
    if (routeType.includes('cab') || routeType.includes('taxi') || routeType.includes('driving') || routeType.includes('car')) {
      travelMode = 'driving';
    } else if (routeType.includes('walk')) {
      travelMode = 'walking';
    }
    // Metro and Bus both use transit
    
    const origin = encodeURIComponent(voiceFlowDataRef.current.startLocation);
    const destination = encodeURIComponent(voiceFlowDataRef.current.destination);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}&dir_action=navigate`;
    
    await speak(`Opening Route ${index + 1} in Google Maps.`, false, false);
    
    // Open Google Maps navigation
    window.open(googleMapsUrl, '_blank');
    
    setVoiceFlowStep(null);
    voiceFlowStepRef.current = null;
  }, [speak]);
  
  const performRouteSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate route finding
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock routes for demo
      const mockRoutes = [
        {
          mode: 'Walk + Metro',
          type: 'Metro',
          duration: '25 mins',
          distance: '8.9 km',
          cost: '\u20B920',
          estimatedTime: 25,
          accessibilityScore: 100,
          accessibility: 'High',
          hasLift: true,
          busRoutes: [],
          realTimeInfo: { nextMetroArrival: '2 mins', crowdLevel: 'Low' },
          accessibilityFeatures: ['Elevator', 'Tactile Paths', 'Audio Announcements', 'Wheelchair Ramp'],
          carbonFootprint: '0.2 kg CO2',
          facilities: ['Elevator', 'Tactile Paths', 'Audio Announces']
        },
        {
          mode: 'Bus Route',
          type: 'Low-floor bus',
          duration: '35 mins',
          distance: '12.3 km',
          cost: '\u20B915',
          estimatedTime: 35,
          accessibilityScore: 75,
          accessibility: 'Medium',
          hasLift: false,
          busRoutes: ['M70', 'S12'],
          realTimeInfo: { nextBusArrival: '5 mins', crowdLevel: 'Medium' },
          accessibilityFeatures: ['Low-floor Entry', 'Priority Seating'],
          carbonFootprint: '0.5 kg CO2',
          facilities: ['Low-floor entry', 'Priority seating']
        },
        {
          mode: 'Wheelchair Accessible Cab',
          type: 'Wheelchair accessible cab',
          duration: '20 mins',
          distance: '10.1 km',
          cost: '\u20B9250',
          estimatedTime: 20,
          accessibilityScore: 95,
          accessibility: 'High',
          hasLift: false,
          busRoutes: [],
          realTimeInfo: { crowdLevel: 'Low' },
          accessibilityFeatures: ['Wheelchair Support', 'Door-to-door Service', 'Ramp Access'],
          carbonFootprint: '1.2 kg CO2',
          facilities: ['Wheelchair support', 'Door-to-door service']
        }
      ];
      
      setRoutes(mockRoutes);
      routesRef.current = mockRoutes;
      // Store routes in voice flow data for repeat command
      setVoiceFlowData(prev => ({ ...prev, _lastRoutes: mockRoutes }));
      voiceFlowDataRef.current = { ...voiceFlowDataRef.current, _lastRoutes: mockRoutes };
      setVoiceFlowStep('SELECT_ROUTE');
      voiceFlowStepRef.current = 'SELECT_ROUTE';
      
      // Announce routes clearly per spec
      let announcement = `I found ${mockRoutes.length} accessible routes. `;
      announcement += `Route 1. ${mockRoutes[0].type}${mockRoutes[0].hasLift ? ' with lift access' : ''}. Travel time ${mockRoutes[0].estimatedTime} minutes. `;
      announcement += `Route 2. ${mockRoutes[1].type}. Travel time ${mockRoutes[1].estimatedTime} minutes. `;
      announcement += `Route 3. ${mockRoutes[2].type}. Travel time ${mockRoutes[2].estimatedTime} minutes. `;
      announcement += 'Say the route number to continue.';
      
      await speak(announcement, false, false);
    } catch (error) {
      await speak('No routes found. Try again.', true, false);
      setVoiceFlowStep('BOTH_LOCKED');
      voiceFlowStepRef.current = 'BOTH_LOCKED';
    } finally {
      setIsLoading(false);
    }
  }, [speak]);
  
  const repeatCurrentStepMessage = useCallback(async () => {
    const step = voiceFlowStepRef.current;
    const data = voiceFlowDataRef.current;
    switch (step) {
      case 'START_LOCATION':
        await speak('Where are you starting from?', true, false);
        break;
      case 'PICK_START_MATCH':
        await speak('Say Option 1, 2, or 3', true, false);
        break;
      case 'CONFIRM_START':
        await speak(`${data.startLocation}, yes or no?`, true, false);
        break;
      case 'DESTINATION':
        await speak('Where do you want to go?', true, false);
        break;
      case 'PICK_DEST_MATCH':
        await speak('Say Option 1, 2, or 3', true, false);
        break;
      case 'CONFIRM_DESTINATION':
        await speak(`${data.destination}, yes or no?`, true, false);
        break;
      case 'CHOOSE_MODE':
        await speak('Walk or Public Transport?', true, false);
        break;
      case 'BOTH_LOCKED':
        await speak('Say Find Accessible Routes.', true, false);
        break;
      case 'SELECT_ROUTE': {
        // Repeat the full route list once
        const rts = voiceFlowDataRef.current._lastRoutes;
        if (rts && rts.length > 0) {
          let msg = `Route 1. ${rts[0].type}${rts[0].hasLift ? ' with lift access' : ''}. Travel time ${rts[0].estimatedTime} minutes. `;
          msg += `Route 2. ${rts[1].type}. Travel time ${rts[1].estimatedTime} minutes. `;
          msg += `Route 3. ${rts[2].type}. Travel time ${rts[2].estimatedTime} minutes. `;
          msg += 'Say the route number to continue.';
          await speak(msg, true, false);
        } else {
          await speak('Say 1, 2, or 3 to select a route.', true, false);
        }
        break;
      }
      default:
        await speak('Say Repeat', true, false);
    }
  }, [speak]);

  // Keep refs in sync with state
  useEffect(() => {
    voiceFlowStepRef.current = voiceFlowStep;
  }, [voiceFlowStep]);
  useEffect(() => {
    voiceFlowDataRef.current = voiceFlowData;
  }, [voiceFlowData]);

  // STRICT VOICE FLOW COMMAND HANDLER
  // Rules: Always FROM first, then TO. Confirm each. Lock each. Never swap. Never proceed without confirmation.
  const handleVoiceFlowCommand = useCallback(async (transcript) => {
    const command = transcript.toLowerCase().trim();
    const currentStep = voiceFlowStepRef.current;
    const currentData = voiceFlowDataRef.current;
    
    console.log(`[Voice Flow] Step: ${currentStep}, Command: "${command}"`);
    
    // ========== EMERGENCY CHECK (always available) ==========
    if (command.includes('emergency') || command.includes('help me')) {
      await speak('Emergency mode activated. Calling emergency contact.', true, false);
      return;
    }
    
    // ========== REPEAT COMMAND (always available) ==========
    if (command.includes('repeat') || command.includes('say again') || command.includes('again')) {
      await repeatCurrentStepMessage();
      return;
    }

    // ========== CHANGE COMMANDS (available after locking) ==========
    if (command.includes('change starting') || command.includes('change from') || command.includes('change start')) {
      setFromLocked(false);
      setFromLocation('');
      setVoiceFlowStep('START_LOCATION');
      voiceFlowStepRef.current = 'START_LOCATION';
      setVoiceFlowData(prev => ({ ...prev, startLocation: '' }));
      voiceFlowDataRef.current = { ...voiceFlowDataRef.current, startLocation: '' };
      await speak('Tell me new starting location.', false, false);
      return;
    }
    
    if (command.includes('change destination') || command.includes('change to location') || command.includes('change where')) {
      setToLocked(false);
      setToLocation('');
      setVoiceFlowStep('DESTINATION');
      voiceFlowStepRef.current = 'DESTINATION';
      setVoiceFlowData(prev => ({ ...prev, destination: '' }));
      voiceFlowDataRef.current = { ...voiceFlowDataRef.current, destination: '' };
      await speak('Tell me new destination.', false, false);
      return;
    }

    // ========== STEP: START_LOCATION ==========
    if (currentStep === 'START_LOCATION') {
      // If user tries to say find/search/book before both locked
      if (command.includes('find') || command.includes('search') || command.includes('book')) {
        await speak('First, tell me your starting location', false, false);
        return;
      }
      
      // Capture the spoken location and match against dataset
      const location = transcript.trim();
      if (location.length < 2) {
        await speak('Could not catch that, say your starting location again', false, false);
        return;
      }
      
      // Fuzzy match against CHENNAI_LOCATIONS
      const { matches, bestMatch } = matchLocationFromDataset(location);
      
      if (!bestMatch) {
        // No match found
        await speak(`Could not find ${location}, try again`, false, false);
        return;
      }
      
      if (matches.length === 1 || bestMatch.score >= 0.85) {
        // Single clear match - go to confirmation
        setVoiceFlowData(prev => ({ ...prev, startLocation: bestMatch.name }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, startLocation: bestMatch.name };
        setVoiceFlowStep('CONFIRM_START');
        voiceFlowStepRef.current = 'CONFIRM_START';
        await speak(`Starting from ${bestMatch.name}, correct?`, false, false);
      } else {
        // Multiple matches - ask user to pick
        const topOptions = matches.slice(0, 3);
        setVoiceFlowData(prev => ({ ...prev, pendingMatches: topOptions }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, pendingMatches: topOptions };
        setVoiceFlowStep('PICK_START_MATCH');
        voiceFlowStepRef.current = 'PICK_START_MATCH';
        let msg = '';
        topOptions.forEach((m, i) => { msg += `Option ${i + 1}, ${m.name}, `; });
        msg += 'which one?';
        await speak(msg, false, false);
      }
      return;
    }

    // ========== STEP: PICK_START_MATCH (multiple matches for FROM) ==========
    if (currentStep === 'PICK_START_MATCH') {
      const pending = currentData.pendingMatches || [];
      let picked = null;
      if (command.includes('1') || command.includes('one') || command.includes('first')) picked = pending[0];
      else if (command.includes('2') || command.includes('two') || command.includes('second')) picked = pending[1];
      else if (command.includes('3') || command.includes('three') || command.includes('third')) picked = pending[2];
      
      if (picked) {
        setVoiceFlowData(prev => ({ ...prev, startLocation: picked.name, pendingMatches: [] }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, startLocation: picked.name, pendingMatches: [] };
        setVoiceFlowStep('CONFIRM_START');
        voiceFlowStepRef.current = 'CONFIRM_START';
        await speak(`Starting from ${picked.name}, correct?`, false, false);
      } else {
        await speak('Say Option 1, 2, or 3', false, false);
      }
      return;
    }

    // ========== STEP: CONFIRM_START ==========
    if (currentStep === 'CONFIRM_START') {
      if (command.includes('yes') || command.includes('correct') || command.includes('confirm') || command.includes('right') || command.includes('yeah') || command.includes('yep') || command.includes('sure') || command.includes('okay') || command.includes('ok')) {
        const loc = currentData.startLocation;
        setFromLocation(loc);
        setFromLocked(true);
        await speak(`Got it, ${loc}, now where do you want to go?`, false, false);
        
        setVoiceFlowStep('DESTINATION');
        voiceFlowStepRef.current = 'DESTINATION';
      } else if (command.includes('no') || command.includes('wrong') || command.includes('incorrect') || command.includes('not correct') || command.includes('nope') || command.includes('change')) {
        setVoiceFlowStep('START_LOCATION');
        voiceFlowStepRef.current = 'START_LOCATION';
        setVoiceFlowData(prev => ({ ...prev, startLocation: '' }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, startLocation: '' };
        await speak('Okay, say your starting location again', false, false);
      } else {
        await speak(`${currentData.startLocation}, yes or no?`, false, false);
      }
      return;
    }

    // ========== STEP: DESTINATION ==========
    if (currentStep === 'DESTINATION') {
      // If user tries to say find/search/book before both locked
      if (command.includes('find') || command.includes('search') || command.includes('book')) {
        await speak('Tell me your destination first', false, false);
        return;
      }
      
      // Capture the spoken destination and match against dataset
      const location = transcript.trim();
      if (location.length < 2) {
        await speak('Could not catch that, say your destination again', false, false);
        return;
      }
      
      // Fuzzy match against CHENNAI_LOCATIONS
      const { matches, bestMatch } = matchLocationFromDataset(location);
      
      if (!bestMatch) {
        await speak(`Could not find ${location}, try again`, false, false);
        return;
      }
      
      if (matches.length === 1 || bestMatch.score >= 0.85) {
        // Single clear match
        setVoiceFlowData(prev => ({ ...prev, destination: bestMatch.name }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, destination: bestMatch.name };
        setVoiceFlowStep('CONFIRM_DESTINATION');
        voiceFlowStepRef.current = 'CONFIRM_DESTINATION';
        await speak(`Going to ${bestMatch.name}, correct?`, false, false);
      } else {
        // Multiple matches
        const topOptions = matches.slice(0, 3);
        setVoiceFlowData(prev => ({ ...prev, pendingMatches: topOptions }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, pendingMatches: topOptions };
        setVoiceFlowStep('PICK_DEST_MATCH');
        voiceFlowStepRef.current = 'PICK_DEST_MATCH';
        let msg = '';
        topOptions.forEach((m, i) => { msg += `Option ${i + 1}, ${m.name}, `; });
        msg += 'which one?';
        await speak(msg, false, false);
      }
      return;
    }

    // ========== STEP: PICK_DEST_MATCH (multiple matches for TO) ==========
    if (currentStep === 'PICK_DEST_MATCH') {
      const pending = currentData.pendingMatches || [];
      let picked = null;
      if (command.includes('1') || command.includes('one') || command.includes('first')) picked = pending[0];
      else if (command.includes('2') || command.includes('two') || command.includes('second')) picked = pending[1];
      else if (command.includes('3') || command.includes('three') || command.includes('third')) picked = pending[2];
      
      if (picked) {
        setVoiceFlowData(prev => ({ ...prev, destination: picked.name, pendingMatches: [] }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, destination: picked.name, pendingMatches: [] };
        setVoiceFlowStep('CONFIRM_DESTINATION');
        voiceFlowStepRef.current = 'CONFIRM_DESTINATION';
        await speak(`Going to ${picked.name}, correct?`, false, false);
      } else {
        await speak('Say Option 1, 2, or 3', false, false);
      }
      return;
    }

    // ========== STEP: CONFIRM_DESTINATION ==========
    if (currentStep === 'CONFIRM_DESTINATION') {
      if (command.includes('yes') || command.includes('correct') || command.includes('confirm') || command.includes('right') || command.includes('yeah') || command.includes('yep') || command.includes('sure') || command.includes('okay') || command.includes('ok')) {
        const loc = currentData.destination;
        setToLocation(loc);
        setToLocked(true);
        await speak(`Got it, ${loc}, walk or public transport?`, false, false);
        
        setVoiceFlowStep('CHOOSE_MODE');
        voiceFlowStepRef.current = 'CHOOSE_MODE';
      } else if (command.includes('no') || command.includes('wrong') || command.includes('incorrect') || command.includes('not correct') || command.includes('nope') || command.includes('change')) {
        setVoiceFlowStep('DESTINATION');
        voiceFlowStepRef.current = 'DESTINATION';
        setVoiceFlowData(prev => ({ ...prev, destination: '' }));
        voiceFlowDataRef.current = { ...voiceFlowDataRef.current, destination: '' };
        await speak('Okay, say your destination again', false, false);
      } else {
        await speak(`${currentData.destination}, yes or no?`, false, false);
      }
      return;
    }

    // ========== STEP: CHOOSE_MODE (walk or public transport) ==========
    if (currentStep === 'CHOOSE_MODE') {
      if (command.includes('walk') || command.includes('walking') || command.includes('on foot') || command.includes('by foot')) {
        await speak('Opening walking directions in Google Maps', false, false);
        // Build Google Maps walking directions URL with live navigation
        const origin = encodeURIComponent(currentData.startLocation);
        const destination = encodeURIComponent(currentData.destination);
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking&dir_action=navigate`;
        // Open Google Maps in a new tab
        window.open(googleMapsUrl, '_blank');
        setVoiceFlowStep(null);
        voiceFlowStepRef.current = null;
        return;
      } else if (command.includes('public') || command.includes('transport') || command.includes('bus') || command.includes('metro') || command.includes('train')) {
        await speak('Public transport, say Find Routes', false, false);
        setVoiceFlowStep('BOTH_LOCKED');
        voiceFlowStepRef.current = 'BOTH_LOCKED';
      } else {
        await speak('Say Walk or Public Transport', false, false);
      }
      return;
    }

    // ========== STEP: BOTH_LOCKED (waiting for find routes - public transport) ==========
    if (currentStep === 'BOTH_LOCKED') {
      if (command.includes('find accessible route') || command.includes('accessible route') || command.includes('find route') || command.includes('find') || command.includes('route') || command.includes('search') || command.includes('go')) {
        await speak('Searching accessible routes.', false, false);
        setVoiceFlowStep('FINDING_ROUTES');
        voiceFlowStepRef.current = 'FINDING_ROUTES';
        await performRouteSearch();
      } else if (command.includes('open map') || command.includes('open google')) {
        await speak('Please select a route number first.', false, false);
      } else {
        await speak('Say Find Accessible Routes.', false, false);
      }
      return;
    }

    // ========== STEP: SELECT_ROUTE ==========
    if (currentStep === 'SELECT_ROUTE') {
      // Strip all punctuation/whitespace for clean matching (speech returns "1.", "3." etc.)
      const cleaned = command.replace(/[^a-z0-9\s]/g, '').trim();
      
      // Safety rule: don't open maps without a route number
      if (cleaned.includes('open map') || cleaned.includes('open google') || cleaned.includes('navigate')) {
        await speak('Please select a route number first.', false, false);
        return;
      }
      
      // Accept bare numbers, "route N", or ordinal words
      if (cleaned === '1' || cleaned === 'one' || cleaned.includes('route 1') || cleaned.includes('route one') || cleaned.includes('first') || cleaned.startsWith('1') || command.includes('1')) {
        selectRouteByVoice(0);
      } else if (cleaned === '2' || cleaned === 'two' || cleaned.includes('route 2') || cleaned.includes('route two') || cleaned.includes('second') || cleaned.startsWith('2') || command.includes('2')) {
        selectRouteByVoice(1);
      } else if (cleaned === '3' || cleaned === 'three' || cleaned.includes('route 3') || cleaned.includes('route three') || cleaned.includes('third') || cleaned.startsWith('3') || command.includes('3')) {
        selectRouteByVoice(2);
      } else {
        // Invalid selection
        await speak('Invalid selection. Say 1, 2, or 3.', false, false);
      }
      return;
    }

    // ========== STEP: FINDING_ROUTES (loading, ignore input) ==========
    if (currentStep === 'FINDING_ROUTES') {
      await speak('Still loading, please wait', false, false);
      return;
    }

    // ========== DEFAULT: If no step matched ==========
    const stepHints = {
      'START_LOCATION': 'Say a location name like T Nagar or Marina Beach',
      'PICK_START_MATCH': 'Say Option 1, 2, or 3',
      'CONFIRM_START': 'Say Yes or No',
      'DESTINATION': 'Say your destination name',
      'PICK_DEST_MATCH': 'Say Option 1, 2, or 3',
      'CONFIRM_DESTINATION': 'Say Yes or No',
      'CHOOSE_MODE': 'Say Walk or Public Transport',
      'BOTH_LOCKED': 'Say Find Routes',
      'SELECT_ROUTE': 'Say 1, 2, or 3 to select a route'
    };
    const hint = stepHints[currentStep] || 'Say Repeat';
    await speak(hint, false, false);
  }, [speak, selectRouteByVoice, performRouteSearch, repeatCurrentStepMessage]);

  // Keep handleVoiceFlowCommand ref up to date
  useEffect(() => {
    handleVoiceFlowCommandRef.current = handleVoiceFlowCommand;
  }, [handleVoiceFlowCommand]);

  // Location voice recognition for input fields
  const setupLocationVoiceRecognition = (type) => {
    if (!isVoiceMode) return;
    
    const locationHandlers = {
      '.*': (transcript) => { // Any speech input
        const location = transcript.trim();
        if (type === 'from') {
          setFromLocation(location);
          speak(`Starting location set to ${location}`);
        } else {
          setToLocation(location);
          speak(`Destination set to ${location}`);
        }
        
        // Resume normal command listening
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };
    
    setupSpeechRecognition(locationHandlers);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  // Enhanced Navigation View Component
  const NavigationView = ({ route, onBack }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      if (isNavigating) {
        const interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 2;
            if (newProgress >= 100) {
              setIsNavigating(false);
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Navigation complete! You have arrived at your destination.');
                speechSynthesis.speak(utterance);
              }
              return 100;
            }
            return newProgress;
          });
        }, 500);
        
        return () => clearInterval(interval);
      }
    }, [isNavigating]);
    
    useEffect(() => {
      const stepProgress = Math.floor(progress / (100 / (route.steps?.length || 1)));
      if (stepProgress !== currentStep && stepProgress < (route.steps?.length || 0)) {
        setCurrentStep(stepProgress);
        if (isNavigating && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(route.steps[stepProgress]);
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    }, [progress, route.steps, isNavigating, currentStep]);
    
    if (!route) {
      return (
        <div style={{ ...getThemeStyles(), padding: 20 }}>
          <h2>Navigation Error</h2>
          <p>No route data available</p>
          <button onClick={onBack} style={getButtonStyles('primary')}>
            Back to Search
          </button>
        </div>
      );
    }

    const startNavigation = () => {
      setIsNavigating(true);
      setProgress(0);
      setCurrentStep(0);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Starting navigation. ${route.mode} route to your destination.`);
        speechSynthesis.speak(utterance);
      }
    };
    
    const stopNavigation = () => {
      setIsNavigating(false);
      setProgress(0);
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };

    return (
      <div style={{ ...getThemeStyles(), padding: 20, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{
          ...getCardStyles(),
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <button
            onClick={onBack}
            style={{
              ...getButtonStyles('ghost'),
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            ← Back
          </button>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: 18, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              {route.mode || 'Navigation'} Route
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              {route.duration || 'Unknown'} • {route.cost || 'Unknown'} • {route.accessibilityScore}% Accessible
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <FontAwesomeIcon icon={faPlay} /> Start Navigation
              </button>
            ) : (
              <button
                onClick={stopNavigation}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <FontAwesomeIcon icon={faStop} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Interactive Navigation Map */}
        <div style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
          border: `1px solid var(--border-color)`,
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <EnhancedMap 
            route={route}
            fromLocation={route.fromLocation || 'Starting Point'}
            toLocation={route.toLocation || 'Destination'}
            routeCoordinates={route.routeCoordinates || []}
            isNavigating={isNavigating}
            currentStep={currentStep}
          />
        </div>

        {/* Current Step Details */}
        <div style={{
          ...getCardStyles(),
          padding: 20,
          marginBottom: 16,
          border: isNavigating ? '2px solid #007bff' : '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: isNavigating ? '#007bff' : 'var(--bg-tertiary)',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600
            }}>
              {currentStep + 1}
            </div>
            
            <div style={{ flex: 1 }}>
              {isNavigating && (
                <div
                  style={{
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 4,
                    display: 'inline-block',
                    background: '#007bff',
                    color: 'white',
                    padding: '2px 10px',
                    letterSpacing: '1px',
                  }}
                >
                  NAVIGATING
                </div>
              )}
            </div>
          </div>

          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: 18, 
            lineHeight: 1.4,
            ...getTextStyles('primary')
          }}>
            {route.steps?.[currentStep] || 'No step information available'}
          </p>

          {/* Step Navigation */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isNavigating}
              style={{
                ...getButtonStyles('ghost'),
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                opacity: (currentStep === 0 || isNavigating) ? 0.5 : 1,
                cursor: (currentStep === 0 || isNavigating) ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.min((route.steps?.length || 1) - 1, currentStep + 1))}
              disabled={currentStep === (route.steps?.length || 1) - 1 || isNavigating}
              style={{
                ...getButtonStyles('ghost'),
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                opacity: (currentStep === (route.steps?.length || 1) - 1 || isNavigating) ? 0.5 : 1,
                cursor: (currentStep === (route.steps?.length || 1) - 1 || isNavigating) ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Route Information */}
        {route.accessibilityFeatures && route.accessibilityFeatures.length > 0 && (
          <div style={{
            ...getCardStyles(),
            padding: 20
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 16, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Accessibility Features
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {route.accessibilityFeatures.map((feature, index) => (
                <span key={index} style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Search for routes
  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      setError(getText('pleaseEnterBothLocations'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const routeOptions = await LocationService.generateRouteOptions(fromLocation, toLocation);
      setRoutes(routeOptions);
    } catch (err) {
      setError(getText('failedToFindRoutes'));
    } finally {
      setIsLoading(false);
    }
  };

  // Start navigation
  const handleStartNavigation = (route) => {
    // Enhance route with location information
    const enhancedRoute = {
      ...route,
      fromLocation: fromLocation,
      toLocation: toLocation
    };
    setSelectedRoute(enhancedRoute);
    setIsNavigating(true);
  };

  // Back from navigation
  const handleBackFromNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  // Open full-screen Chennai map
  const handleOpenFullScreenMap = (route) => {
    setSelectedRoute(route);
    setShowFullScreenMap(true);
  };

  // Close full-screen map
  const handleCloseFullScreenMap = () => {
    setShowFullScreenMap(false);
  };

  // Start navigation from full-screen map
  const handleStartNavigationFromMap = () => {
    setIsNavigating(true);
  };

  // Stop navigation from full-screen map
  const handleStopNavigationFromMap = () => {
    setIsNavigating(false);
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        ...getThemeStyles()
      }}>
        <span style={getTextStyles('primary')}>{getText('loading')}</span>
      </div>
    );
  }

  // Show navigation view when navigating
  if (isNavigating && selectedRoute) {
    return (
      <NavigationView
        route={selectedRoute}
        onBack={handleBackFromNavigation}
      />
    );
  }

  return (
    <div style={{ ...getThemeStyles(), paddingBottom: 80 }}>
      <Navigation user={user} />

      {/* Voice Mode Indicator */}
      {isVoiceMode && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          background: isListening ? 'var(--accent-color)' : 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s'
        }}>
          <FontAwesomeIcon 
            icon={faMicrophone} 
            style={{
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
          />
          <span>{voiceFeedback || (isListening ? 'Listening...' : 'Voice Mode Active')}</span>
        </div>
      )}

      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <section style={{ 
          ...getCardStyles(),
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 20,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'white'
          }}>
            <FontAwesomeIcon icon={faCompass} /> {getText('navigate')} {getText('chennai')}
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-secondary)',
            lineHeight: 'var(--line-height-normal)',
            opacity: 0.9,
            color: 'white'
          }}>
            {getText('discoverAccessibleRoutes')}
          </p>
        </section>

        {/* Transportation Mode Tabs */}
        <section style={{
          ...getCardStyles(),
          padding: 0,
          borderRadius: 16,
          marginBottom: 20,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px 16px 0 0'
          }}>
            <button
              onClick={() => setTransportMode('general')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'general' 
                  ? 'var(--card-bg)'
                  : 'transparent',
                color: transportMode === 'general'
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontWeight: transportMode === 'general' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: transportMode === 'general' ? '16px 0 0 0' : '0',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faCar} />
              {getText('route')} {getText('general')}
            </button>
            
            <button
              onClick={() => setTransportMode('metro')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'metro' 
                  ? 'var(--card-bg)'
                  : 'transparent',
                color: transportMode === 'metro'
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontWeight: transportMode === 'metro' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faTrain} />
              {getText('chennaiMetro')}
            </button>
            
            <button
              onClick={() => setTransportMode('bus')}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: transportMode === 'bus' 
                  ? 'var(--card-bg)'
                  : 'transparent',
                color: transportMode === 'bus'
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontWeight: transportMode === 'bus' ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: transportMode === 'bus' ? '0 16px 0 0' : '0',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faBus} />
              {getText('buses')} {getText('route')}
            </button>
          </div>
        </section>

        {/* Conditional Content Based on Transport Mode */}
        {transportMode === 'metro' ? (
          <MetroNavigation />
        ) : transportMode === 'bus' ? (
          <MTCBusNavigation />
        ) : (
          // General Routes Content (existing functionality)
          <>
            {/* Location Input */}
            <section style={{ 
              ...getCardStyles(),
              padding: 24, 
              borderRadius: 16, 
              marginBottom: 20 
            }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: 20, 
            fontWeight: 600,
            ...getTextStyles('primary')
          }}>
            {getText('findRoute')}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gap: 16, 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                ...getTextStyles('primary')
              }}>
                {getText('from')}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    ref={fromInputRef}
                    type="text"
                    value={fromLocation}
                    readOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isVoiceMode && fromLocked) return; // Prevent editing locked field in voice mode
                      if (fromInputRef.current) {
                        const rect = fromInputRef.current.getBoundingClientRect();
                        setFromPickerPosition({
                          top: rect.bottom + window.scrollY + 4,
                          left: rect.left + window.scrollX,
                          width: rect.width + 52
                        });
                      }
                      setIsFromPickerOpen(true);
                    }}
                    placeholder={getText('enterStartingLocation')}
                    className="modern-input"
                    style={{
                      flex: 1,
                      boxSizing: 'border-box',
                      padding: '12px',
                      border: `2px solid ${isVoiceMode && fromLocked ? '#10B981' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: isVoiceMode && fromLocked ? 'rgba(16, 185, 129, 0.08)' : 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: isVoiceMode && fromLocked ? '600' : '400',
                      transition: 'border-color 0.2s ease',
                      cursor: isVoiceMode && fromLocked ? 'not-allowed' : 'pointer',
                      opacity: isVoiceMode && fromLocked ? 1 : undefined
                    }}
                  />
                  {/* Lock indicator for voice mode */}
                  {isVoiceMode && fromLocked && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#10B981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      minWidth: '44px',
                      gap: '4px'
                    }}>
                      🔒
                    </div>
                  )}
                  
                  {/* Browse All Locations Button */}
                  <button
                    onClick={() => {
                      if (fromInputRef.current) {
                        const rect = fromInputRef.current.getBoundingClientRect();
                        setFromPickerPosition({
                          top: rect.bottom + window.scrollY + 4,
                          left: rect.left + window.scrollX,
                          width: rect.width + 52
                        });
                      }
                      setIsFromPickerOpen(true);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                    }}
                    title="Browse all Chennai locations"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
                
                {/* Old suggestions removed - using LocationDropdownPicker instead */}
                {false && suggestions.from.length > 0 && activeInput === 'from' && (
                  <div 
                    ref={fromSuggestionsRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--card-bg)',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      zIndex: 9999,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderBottom: `1px solid var(--border-color)`,
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px 8px 0 0'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Location Suggestions
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuggestions(prev => ({ ...prev, from: [] }));
                          setActiveInput(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {suggestions.from.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromLocation(suggestion);
                          setSuggestions(prev => ({ ...prev, from: [] }));
                          setActiveInput(null);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.from.length - 1 
                            ? `1px solid var(--border-color)` 
                            : 'none',
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          fontSize: '14px',
                          fontFamily: 'var(--font-ui)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={faMapMarkerAlt} 
                          style={{ 
                            color: preferences.theme === 'dark' ? '#888' : '#666',
                            fontSize: '12px',
                            minWidth: '12px'
                          }} 
                        />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-ui)',
                letterSpacing: 'var(--letter-spacing-wide)',
                ...getTextStyles('primary')
              }}>
                {getText('to')}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    ref={toInputRef}
                    type="text"
                    value={toLocation}
                    readOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isVoiceMode && toLocked) return; // Prevent editing locked field in voice mode
                      if (toInputRef.current) {
                        const rect = toInputRef.current.getBoundingClientRect();
                        setToPickerPosition({
                          top: rect.bottom + window.scrollY + 4,
                          left: rect.left + window.scrollX,
                          width: rect.width + 52
                        });
                      }
                      setIsToPickerOpen(true);
                    }}
                  placeholder={getText('enterDestination')}
                  className="modern-input"
                  style={{
                    flex: 1,
                    boxSizing: 'border-box',
                    padding: '12px',
                    border: `2px solid ${isVoiceMode && toLocked ? '#10B981' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: isVoiceMode && toLocked ? 'rgba(16, 185, 129, 0.08)' : 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: isVoiceMode && toLocked ? '600' : '400',
                    transition: 'border-color 0.2s ease',
                    cursor: isVoiceMode && toLocked ? 'not-allowed' : 'pointer',
                    opacity: isVoiceMode && toLocked ? 1 : undefined
                  }}
                />
                {/* Lock indicator for voice mode */}
                {isVoiceMode && toLocked && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#10B981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    minWidth: '44px',
                    gap: '4px'
                  }}>
                    🔒
                  </div>
                )}
                
                  {/* Browse All Locations Button */}
                  <button
                    onClick={() => {
                      if (toInputRef.current) {
                        const rect = toInputRef.current.getBoundingClientRect();
                        setToPickerPosition({
                          top: rect.bottom + window.scrollY + 4,
                          left: rect.left + window.scrollX,
                          width: rect.width + 52
                        });
                      }
                      setIsToPickerOpen(true);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                    }}
                    title="Browse all Chennai locations"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
              </div>
                
                {/* Old suggestions removed - using LocationDropdownPicker instead */}
                {false && suggestions.to.length > 0 && activeInput === 'to' && (
                  <div 
                    ref={toSuggestionsRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--card-bg)',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      zIndex: 9999,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderBottom: `1px solid var(--border-color)`,
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px 8px 0 0'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Location Suggestions
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuggestions(prev => ({ ...prev, to: [] }));
                          setActiveInput(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {suggestions.to.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setToLocation(suggestion);
                          setSuggestions(prev => ({ ...prev, to: [] }));
                          setActiveInput(null);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.to.length - 1 
                            ? `1px solid var(--border-color)` 
                            : 'none',
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          fontSize: '14px',
                          fontFamily: 'var(--font-ui)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={faMapMarkerAlt} 
                          style={{ 
                            color: preferences.theme === 'dark' ? '#888' : '#666',
                            fontSize: '12px',
                            minWidth: '12px'
                          }} 
                        />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: 12, 
              marginBottom: 16, 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              borderRadius: 8,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSearch}
              disabled={isLoading || !fromLocation || !toLocation}
              style={{
                ...getButtonStyles('primary'),
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: (isLoading || !fromLocation || !toLocation) ? 0.6 : 1,
                cursor: (isLoading || !fromLocation || !toLocation) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? getText('searching') : <><FontAwesomeIcon icon={faSearch} /> {getText('findRoutes')}</>}
            </button>
            
            <button
              onClick={clearNavigationData}
              disabled={isLoading}
              style={{
                ...getButtonStyles('secondary'),
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '120px',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faCrosshairs} />
              {getText('delete')}
            </button>
          </div>
        </section>

        {/* Route Results */}
        {routes.length > 0 && (
          <section style={{ 
            ...getCardStyles(),
            padding: 24, 
            borderRadius: 16, 
            marginBottom: 20 
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              fontSize: 20, 
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              {getText('availableRoutes')}
            </h2>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {routes.map((route, index) => (
                <div key={index} style={{
                  ...getCardStyles(),
                  padding: 20,
                  border: selectedRoute === route 
                    ? '2px solid #007bff' 
                    : `1px solid var(--border-color)`,
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (selectedRoute !== route) {
                    e.target.style.border = `1px solid #007bff`;
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRoute !== route) {
                    e.target.style.border = `1px solid var(--border-color)`;
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }
                }}
                >
                    {/* Route Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: 16
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <FontAwesomeIcon 
                            icon={route.mode.includes('Bus') ? faBus : 
                                  route.mode.includes('Metro') ? faTrain : 
                                  route.mode.includes('Walk') ? faWalking : faCar} 
                            style={{ color: '#007bff', fontSize: 18 }}
                          />
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: 18, 
                            fontWeight: 600,
                            ...getTextStyles('primary')
                          }}>
                            {route.mode}
                          </h3>
                          {route.busRoutes && route.busRoutes.length > 0 && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              {route.busRoutes.map((busRoute, idx) => (
                                <span key={idx} style={{
                                  background: '#007bff',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 600
                                }}>
                                  {busRoute}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                          <div>
                            <span style={{ fontSize: 12, ...getTextStyles('secondary'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</span>
                            <div style={{ fontSize: 16, fontWeight: 600, ...getTextStyles('primary') }}>{route.duration}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, ...getTextStyles('secondary'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance</span>
                            <div style={{ fontSize: 16, fontWeight: 600, ...getTextStyles('primary') }}>{route.distance}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, ...getTextStyles('secondary'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost</span>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#22c55e' }}>{route.cost}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8
                      }}>
                        <div style={{ 
                          background: route.accessibilityScore >= 80 ? '#dcfce7' : 
                                    route.accessibilityScore >= 60 ? '#fef3c7' : '#fee2e2',
                          color: route.accessibilityScore >= 80 ? '#166534' : 
                                route.accessibilityScore >= 60 ? '#92400e' : '#991b1b',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {route.accessibilityScore}% Accessible
                        </div>
                        
                        {route.realTimeInfo && (
                          <div style={{ fontSize: 11, ...getTextStyles('secondary'), textAlign: 'right' }}>
                            <div>Next: {route.realTimeInfo.nextMetroArrival || route.realTimeInfo.nextBusArrival}</div>
                            {route.realTimeInfo.currentDelay && route.realTimeInfo.currentDelay !== 'On time' && (
                              <div style={{ color: '#f59e0b' }}>Delay: {route.realTimeInfo.currentDelay}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Real-time Information Panel */}
                    {route.realTimeInfo && (
                      <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        border: `1px solid var(--border-color)`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, ...getTextStyles('primary') }}>LIVE UPDATES</span>
                          <div 
                            className="pulse-animation"
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#22c55e'
                            }} 
                          />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, fontSize: 11 }}>
                          {route.realTimeInfo.nextMetroArrival && (
                            <div>
                              <span style={{ ...getTextStyles('secondary') }}>Next Metro:</span>
                              <div style={{ fontWeight: 600, ...getTextStyles('primary') }}>{route.realTimeInfo.nextMetroArrival}</div>
                            </div>
                          )}
                          {route.realTimeInfo.nextBusArrival && (
                            <div>
                              <span style={{ ...getTextStyles('secondary') }}>Next Bus:</span>
                              <div style={{ fontWeight: 600, ...getTextStyles('primary') }}>{route.realTimeInfo.nextBusArrival}</div>
                            </div>
                          )}
                          <div>
                            <span style={{ ...getTextStyles('secondary') }}>Crowd Level:</span>
                            <div style={{ 
                              fontWeight: 600, 
                              color: route.realTimeInfo.crowdLevel === 'High' ? '#ef4444' :
                                     route.realTimeInfo.crowdLevel === 'Medium' ? '#f59e0b' : '#22c55e'
                            }}>
                              {route.realTimeInfo.crowdLevel}
                            </div>
                          </div>
                          {route.realTimeInfo.alternativeBuses && (
                            <div>
                              <span style={{ ...getTextStyles('secondary') }}>Alternatives:</span>
                              <div style={{ fontWeight: 600, fontSize: 10, ...getTextStyles('primary') }}>
                                {route.realTimeInfo.alternativeBuses.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Accessibility Features */}
                    {route.accessibilityFeatures && route.accessibilityFeatures.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, ...getTextStyles('secondary'), marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Accessibility Features
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {route.accessibilityFeatures.slice(0, 4).map((feature, idx) => (
                            <span key={idx} style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '4px 8px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 500
                            }}>
                              {feature}
                            </span>
                          ))}
                          {route.accessibilityFeatures.length > 4 && (
                            <span style={{
                              background: '#f3f4f6',
                              color: '#6b7280',
                              padding: '4px 8px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 500
                            }}>
                              +{route.accessibilityFeatures.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: `1px solid var(--border-color)`
                    }}>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, ...getTextStyles('secondary') }}>
                        <span>Carbon: {route.carbonFootprint}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* View on Map Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const start = encodeURIComponent(fromLocation);
                            const end = encodeURIComponent(toLocation);
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}`, '_blank');
                          }}
                          style={{
                            background: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(66, 133, 244, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#3367d6';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#4285F4';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.2)';
                          }}
                        >
                          <FontAwesomeIcon icon={faMap} style={{ fontSize: '12px' }} />
                          View on Map
                        </button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </main>

      {/* Full-Screen Chennai Map */}
      <FullScreenMap
        isOpen={showFullScreenMap}
        onClose={handleCloseFullScreenMap}
        route={selectedRoute}
        fromLocation={fromLocation}
        toLocation={toLocation}
        onStartNavigation={handleStartNavigationFromMap}
        onStopNavigation={handleStopNavigationFromMap}
        isNavigating={isNavigating}
      />

      {/* Dropdown Location Picker for From */}
      <LocationDropdownPicker
        isOpen={isFromPickerOpen}
        onClose={() => setIsFromPickerOpen(false)}
        onSelect={(location) => {
          setFromLocation(location);
          setIsFromPickerOpen(false);
        }}
        placeholder="Search Chennai locations..."
        currentValue={fromLocation}
        inputRef={fromInputRef}
        position={fromPickerPosition}
      />

      {/* Dropdown Location Picker for To */}
      <LocationDropdownPicker
        isOpen={isToPickerOpen}
        onClose={() => setIsToPickerOpen(false)}
        onSelect={(location) => {
          setToLocation(location);
          setIsToPickerOpen(false);
        }}
        placeholder="Search Chennai locations..."
        currentValue={toLocation}
        inputRef={toInputRef}
        position={toPickerPosition}
      />
    </div>
  );
};

export default Navigate;
