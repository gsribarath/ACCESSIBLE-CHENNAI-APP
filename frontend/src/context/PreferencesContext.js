import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
    mode: 'normal'
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage and server on mount
  useEffect(() => {
    const loadPreferences = async () => {
      // First load from localStorage
      const savedPrefs = localStorage.getItem('ac_prefs');
      let localPrefs = {
        language: 'en',
        theme: 'light',
        mode: 'normal'
      };
      
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          localPrefs = {
            language: parsed.language || 'en',
            theme: parsed.theme || 'light',
            mode: parsed.mode || 'normal'
          };
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }
      
      // Check if user is logged in and try to load server preferences
      const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
      if (userData && userData.user_id) {
        try {
          const response = await fetch(`/api/user/${userData.user_id}/preferences`);
          if (response.ok) {
            const serverPrefs = await response.json();
            // Merge server preferences with local preferences, server takes priority
            localPrefs = {
              ...localPrefs,
              ...serverPrefs
            };
            // Update localStorage with merged preferences
            localStorage.setItem('ac_prefs', JSON.stringify(localPrefs));
          }
        } catch (error) {
          console.error('Error loading server preferences:', error);
          // Continue with local preferences
        }
      }
      
      setPreferences(localPrefs);
      setIsLoaded(true);
    };
    
    loadPreferences();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    // Add current theme class
    root.classList.add(`theme-${preferences.theme}`);

    // Apply CSS custom properties based on theme
    const themes = {
      light: {
        '--bg-primary': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        '--bg-secondary': '#ffffff',
        '--text-primary': '#333333',
        '--text-secondary': '#666666',
        '--accent-color': '#1976d2',
        '--border-color': '#e0e0e0',
        '--shadow': '0 4px 20px rgba(0,0,0,0.08)',
        '--card-bg': '#ffffff',
        '--nav-bg': '#ffffff'
      },
      dark: {
        '--bg-primary': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        '--bg-secondary': '#2d2d2d',
        '--text-primary': '#ffffff',
        '--text-secondary': '#b0b0b0',
        '--accent-color': '#42a5f5',
        '--border-color': '#404040',
        '--shadow': '0 4px 20px rgba(0,0,0,0.3)',
        '--card-bg': '#333333',
        '--nav-bg': '#2d2d2d'
      },
      'high-contrast': {
        '--bg-primary': '#000000',
        '--bg-secondary': '#000000',
        '--text-primary': '#ffffff',
        '--text-secondary': '#ffff00',
        '--accent-color': '#00ff00',
        '--border-color': '#ffffff',
        '--shadow': '0 4px 20px rgba(255,255,255,0.3)',
        '--card-bg': '#000000',
        '--nav-bg': '#000000'
      }
    };

    const themeVars = themes[preferences.theme] || themes.light;
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply language direction
    root.setAttribute('lang', preferences.language);
    if (preferences.language === 'ta') {
      root.setAttribute('dir', 'ltr'); // Tamil is LTR
    } else {
      root.setAttribute('dir', 'ltr');
    }

    // Apply mode-specific settings
    if (preferences.mode === 'voice') {
      root.classList.add('voice-mode');
      // Enable enhanced focus indicators for voice mode
      root.style.setProperty('--focus-outline', '3px solid #ff6b6b');
    } else {
      root.classList.remove('voice-mode');
      root.style.setProperty('--focus-outline', '2px solid #1976d2');
    }

  }, [preferences, isLoaded]);

  const updatePreferences = async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('ac_prefs', JSON.stringify(updated));
    
    // Also save to server if user is logged in
    const userData = JSON.parse(localStorage.getItem('ac_user') || '{}');
    if (userData && userData.user_id) {
      try {
        await fetch(`/api/user/${userData.user_id}/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPrefs)
        });
      } catch (error) {
        console.error('Error saving preferences to server:', error);
        // Don't throw error, local save is still successful
      }
    }
  };

  const getThemeStyles = () => {
    const base = {
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'var(--transition)',
      position: 'relative',
      overflow: 'hidden'
    };

    return base;
  };

  const getCardStyles = () => ({
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: `1px solid var(--border-solid)`,
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(10px)',
    transition: 'var(--transition)',
    overflow: 'hidden'
  });

  const getTextStyles = (variant = 'primary') => ({
    color: variant === 'primary' ? 'var(--text-primary)' : 
          variant === 'secondary' ? 'var(--text-secondary)' : 
          variant === 'accent' ? 'var(--text-accent)' : 'var(--text-primary)',
    transition: 'var(--transition)'
  });

  const getButtonStyles = (variant = 'primary') => {
    const styles = {
      primary: {
        background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-purple) 100%)',
        color: 'var(--text-light)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        padding: '12px 24px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: 'var(--shadow-sm)',
        transform: 'translateY(0)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)'
        }
      },
      secondary: {
        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-blue) 100%)',
        color: 'var(--text-light)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        padding: '12px 24px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: 'var(--shadow-sm)'
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: `2px solid var(--border-solid)`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 20px',
        fontWeight: '500',
        fontSize: '14px'
      },
      danger: {
        background: 'linear-gradient(135deg, var(--primary-red) 0%, #ff6b6b 100%)',
        color: 'var(--text-light)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        padding: '12px 24px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: 'var(--shadow-sm)'
      },
      accent: {
        background: 'linear-gradient(135deg, var(--primary-yellow) 0%, var(--primary-orange) 100%)',
        color: 'var(--text-accent)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        padding: '12px 24px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: 'var(--shadow-sm)'
      }
    };

    return {
      ...styles[variant],
      transition: 'var(--transition)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden',
      ':focus': {
        outline: 'var(--focus-outline)',
        outlineOffset: '2px'
      }
    };
  };

  const getText = (key, language = preferences.language) => {
    const translations = {
      en: {
        // Navigation
        home: 'Home',
        navigate: 'Navigate',
        alerts: 'Alerts',
        community: 'Community',
        settings: 'Settings',
        logout: 'Logout',
        
        // Common
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        ok: 'OK',
        error: 'Error',
        success: 'Success',
        
        // Home page
        goodMorning: 'Good Morning',
        goodAfternoon: 'Good Afternoon',
        goodEvening: 'Good Evening',
        welcomeMessage: 'Welcome to your accessibility-first navigation companion for Chennai',
        quickActions: 'Quick Actions',
        recentAlerts: 'Recent Alerts',
        emergencyAssistance: 'Emergency Assistance',
        
        // Settings
        settings: 'Settings',
        customizeExperience: 'Customize your experience',
        settingsSaved: 'Settings saved successfully',
        appearance: 'Appearance',
        chooseTheme: 'Choose your preferred theme',
        lightTheme: 'Light Theme',
        darkTheme: 'Dark Theme',
        highContrastTheme: 'High Contrast Theme',
        selectLanguage: 'Select your language',
        interactionMode: 'Interaction Mode',
        chooseInputMethod: 'Choose your input method',
        normalMode: 'Normal Mode',
        voiceMode: 'Voice Mode',
        notifications: 'Notifications',
        manageNotifications: 'Manage your notification preferences',
        alertNotifications: 'Alert Notifications',
        accessibilityAlerts: 'Accessibility alerts and updates',
        trafficUpdates: 'Traffic Updates',
        realTimeTraffic: 'Real-time traffic information',
        communityNotifications: 'Community Notifications',
        newPostsComments: 'New posts and comments',
        emergencyAlerts: 'Emergency Alerts',
        criticalAlerts: 'Critical emergency alerts',
        privacy: 'Privacy',
        controlDataSharing: 'Control your data sharing',
        shareLocation: 'Share Location',
        locationForRecommendations: 'Share location for better recommendations',
        shareActivity: 'Share Activity',
        helpImproveApp: 'Help improve the app with usage data',
        publicProfile: 'Public Profile',
        visibleToCommunity: 'Make your profile visible to community',
        account: 'Account',
        exportData: 'Export Data',
        saveSettings: 'Save Settings',
        clearAllData: 'Clear All Data',
        confirmClearData: 'Are you sure you want to clear all data? This cannot be undone.',
        about: 'About',
        appDescription: 'Making Chennai more accessible for everyone.',
        
        // Navigate page
        findRoute: 'Find Your Route',
        discoverAccessibleRoutes: 'Discover accessible routes tailored to your needs',
        from: 'From',
        to: 'To',
        enterStartingLocation: 'Enter starting location',
        enterDestination: 'Enter destination',
        accessibilityRequirements: 'Accessibility Requirements',
        wheelchairAccess: 'Wheelchair Access',
        elevatorAvailable: 'Elevator Available',
        audioAnnouncements: 'Audio Announcements',
        brailleTactileSigns: 'Braille/Tactile Signs',
        findRoutes: 'Find Routes',
        searching: 'Searching...',
        availableRoutes: 'Available Routes',
        recommended: 'RECOMMENDED',
        route: 'Route',
        save: 'Save',
        steps: 'Steps',
        accessibilityFeatures: 'Accessibility Features',
        yourSavedRoutes: 'Your Saved Routes',
        savedOn: 'Saved on',
        filters: 'Filters',
        
        // Alerts page
        realTimeAlerts: 'Real-Time Alerts',
        stayUpdated: 'Stay updated with live transport and accessibility alerts across Chennai',
        chennaiMetroLive: 'Chennai Metro Live',
        lastUpdated: 'Last updated',
        live: 'LIVE',
        allServicesNormal: 'All metro services running normally',
        reportIssue: 'Report an Issue',
        category: 'Category',
        locationOptional: 'Location (Optional)',
        alertMessage: 'Alert Message',
        describeIssue: 'Describe the issue or alert...',
        postAlert: 'Post Alert',
        communityReports: 'Community Reports',
        refresh: 'Refresh',
        noAlertsYet: 'No community alerts yet. Be the first to report an issue!',
        location: 'Location',
        transport: 'Transport',
        accessibility: 'Accessibility',
        roadway: 'Roadway',
        weather: 'Weather',
        emergency: 'Emergency',
        
        // Additional Navigate features
        useCurrentLocation: 'Use current location',
        frequentLocations: 'Frequent locations',
        frequentDestinations: 'Frequent destinations',
        voiceMode: 'Voice Mode',
        routeMap: 'Route Map',
        accessibilityFeatures: 'Accessibility Features',
        wheelchairAccess: 'Wheelchair Access',
        elevator: 'Elevator',
        audioSignals: 'Audio Signals',
        braille: 'Braille',
        barriers: 'Barriers',
        accessibilityScore: 'Accessibility Score',
        carbonFootprint: 'Carbon Footprint',
        crowdLevel: 'Crowd Level',
        readRouteDetails: 'Read route details',
        
        // Themes
        light: 'Light',
        dark: 'Dark',
        highContrast: 'High Contrast',
        
        // Modes
        normal: 'Touch/Click',
        voice: 'Voice Mode',
        
        // Mode Selection
        selectMode: 'Select Your Interaction Mode',
        voiceModeSelected: 'Voice mode selected! You can now use voice commands to navigate.',
        normalModeSelected: 'Normal mode selected! You can use touch and click to navigate.',
        pleaseSpeak: 'Please speak your choice: say "Voice Mode" or "Normal Mode"',
        listening: 'Listening...',
        didNotUnderstand: 'I didn\'t understand. Please try again.',
        errorListening: 'Error listening. Please try again.',
        activateVoice: 'Start Voice Recognition',
        saving: 'Saving preferences...',
        errorSavingPreferences: 'Failed to save preferences. Please try again.',
        continuousListening: 'Voice recognition is active. Say "Voice Mode" or "Normal Mode"'
      },
      ta: {
        // Navigation
        home: 'முகப்பு',
        navigate: 'வழிகாட்டி',
        alerts: 'எச்சரிக்கைகள்',
        community: 'சமூகம்',
        settings: 'அமைப்புகள்',
        logout: 'வெளியேறு',
        
        // Common
        loading: 'ஏற்றுகிறது...',
        save: 'சேமிக்கவும்',
        cancel: 'ரத்து செய்',
        ok: 'சரி',
        error: 'பிழை',
        success: 'வெற்றி',
        
        // Home page
        goodMorning: 'காலை வணக்கம்',
        goodAfternoon: 'மதியம் வணக்கம்',
        goodEvening: 'மாலை வணக்கம்',
        welcomeMessage: 'சென்னைக்கான உங்கள் அணுகல்-முதல் வழிசெலுத்தல் துணைக்கு வரவேற்கிறோம்',
        quickActions: 'விரைவு செயல்கள்',
        recentAlerts: 'சமீபத்திய எச்சரிக்கைகள்',
        emergencyAssistance: 'அவசர உதவி',
        
        // Settings
        settings: 'அமைப்புகள்',
        customizeExperience: 'உங்கள் அனுபவத்தை தனிப்பயனாக்கவும்',
        settingsSaved: 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன',
        appearance: 'தோற்றம்',
        chooseTheme: 'உங்கள் விருப்பமான தீமை தேர்ந்தெடுக்கவும்',
        lightTheme: 'ஒளி தீம்',
        darkTheme: 'இருள் தீம்',
        highContrastTheme: 'உயர் மாறுபாடு தீம்',
        language: 'மொழி',
        selectLanguage: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
        interactionMode: 'தொடர்பு முறை',
        chooseInputMethod: 'உங்கள் உள்ளீட்டு முறையை தேர்ந்தெடுக்கவும்',
        normalMode: 'சாதாரண முறை',
        voiceMode: 'குரல் முறை',
        notifications: 'அறிவிப்புகள்',
        manageNotifications: 'உங்கள் அறிவிப்பு விருப்பங்களை நிர்வகிக்கவும்',
        alertNotifications: 'எச்சரிக்கை அறிவிப்புகள்',
        accessibilityAlerts: 'அணுகல் எச்சரிக்கைகள் மற்றும் புதுப்பிப்புகள்',
        trafficUpdates: 'போக்குவரத்து புதுப்பிப்புகள்',
        realTimeTraffic: 'நேரடி போக்குவரத்து தகவல்',
        communityNotifications: 'சமூக அறிவிப்புகள்',
        newPostsComments: 'புதிய இடுகைகள் மற்றும் கருத்துகள்',
        emergencyAlerts: 'அவசர எச்சரிக்கைகள்',
        criticalAlerts: 'முக்கியமான அவசர எச்சரிக்கைகள்',
        privacy: 'தனியுரிமை',
        controlDataSharing: 'உங்கள் தரவு பகிர்வை கட்டுப்படுத்தவும்',
        shareLocation: 'இடத்தை பகிரவும்',
        locationForRecommendations: 'சிறந்த பரிந்துரைகளுக்கு இடத்தை பகிரவும்',
        shareActivity: 'செயல்பாட்டை பகிரவும்',
        helpImproveApp: 'பயன்பாட்டு தரவுகளுடன் பயன்பாட்டை மேம்படுத்த உதவவும்',
        publicProfile: 'பொது சுயவிவரம்',
        visibleToCommunity: 'உங்கள் சுயவிவரத்தை சமூகத்திற்கு தெரியும்படி செய்யவும்',
        account: 'கணக்கு',
        exportData: 'தரவை ஏற்றுமதி செய்யவும்',
        saveSettings: 'அமைப்புகளை சேமிக்கவும்',
        clearAllData: 'அனைத்து தரவையும் அழிக்கவும்',
        confirmClearData: 'அனைத்து தரவையும் அழிக்க வேண்டுமா? இதை செயல்தவிர்க்க முடியாது.',
        about: 'பற்றி',
        appDescription: 'அனைவருக்கும் சென்னையை மேலும் அணுகக்கூடியதாக மாற்றுதல்.',
        
        // Themes
        light: 'ஒளி',
        dark: 'இருள்',
        highContrast: 'உயர் மாறுபாடு',
        
        // Modes
        normal: 'தொடு/கிளிக்',
        voice: 'குரல் முறை',
        
        // Mode Selection
        selectMode: 'உங்கள் தொடர்பு முறையை தேர்ந்தெடுக்கவும்',
        voiceModeSelected: 'குரல் முறை தேர்ந்தெடுக்கப்பட்டது! இப்போது நீங்கள் குரல் கட்டளைகளைப் பயன்படுத்தலாம்.',
        normalModeSelected: 'சாதாரண முறை தேர்ந்தெடுக்கப்பட்டது! நீங்கள் தொடுதல் மற்றும் கிளிக் பயன்படுத்தலாம்.',
        pleaseSpeak: 'தயவுசெய்து உங்கள் விருப்பத்தைச் சொல்லுங்கள்: "குரல் முறை" அல்லது "சாதாரண முறை" என்று சொல்லுங்கள்',
        listening: 'கேட்கிறது...',
        didNotUnderstand: 'நான் புரிந்துகொள்ளவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
        errorListening: 'கேட்பதில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
        activateVoice: 'குரல் அறிதலை தொடங்கு',
        saving: 'விருப்பங்களை சேமிக்கிறது...',
        errorSavingPreferences: 'விருப்பங்களை சேமிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
        continuousListening: 'குரல் அறிதல் செயலில் உள்ளது. "குரல் முறை" அல்லது "சாதாரண முறை" என்று சொல்லுங்கள்'
      }
    };

    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    preferences,
    updatePreferences,
    getThemeStyles,
    getCardStyles,
    getTextStyles,
    getButtonStyles,
    getText,
    isLoaded
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
