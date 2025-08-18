import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun,
  faMoon,
  faEye,
  faTrash,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';
import { useVoiceInterface } from '../utils/voiceUtils';

function Settings() {
  const [user, setUser] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    alerts: true,
    traffic: true,
    community: true,
    emergency: true
  });
  const [privacy, setPrivacy] = useState({
    shareLocation: false,
    shareActivity: false,
    publicProfile: false
  });

  const speakTimeoutRef = useRef(null);

  const { 
    preferences,
    updatePreferences,
    getThemeStyles, 
    getCardStyles, 
    getTextStyles, 
    getButtonStyles, 
    getText 
  } = usePreferences();

  const { theme, language, mode: interactionMode } = preferences;

  // Voice interface
  const {
    isListening,
    voiceFeedback,
    speak,
    setupSpeechRecognition,
    startListening
  } = useVoiceInterface();

  useEffect(() => {
    const userData = localStorage.getItem('ac_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load saved settings
    const savedNotifications = localStorage.getItem('ac_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedPrivacy = localStorage.getItem('ac_privacy');
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }

    // Setup speech recognition for voice mode
    if (interactionMode === 'voice' && speak) {
      speak(getText('welcomeToSettings', 'Welcome to Settings. You can say: voice mode, normal mode, light theme, dark theme, home, or help'));

      if (setupSpeechRecognition) {
        setupSpeechRecognition((command) => {
          const cleanCommand = command.toLowerCase().trim();
          
          if (cleanCommand.includes('voice') && cleanCommand.includes('mode')) {
            updatePreferences({ mode: 'voice' });
            speak(getText('voiceModeSelected', 'Voice mode selected'));
          } else if ((cleanCommand.includes('normal') || cleanCommand.includes('touch')) && cleanCommand.includes('mode')) {
            updatePreferences({ mode: 'normal' });
            speak(getText('normalModeSelected', 'Normal mode selected'));
          } else if (cleanCommand.includes('light') && cleanCommand.includes('theme')) {
            updatePreferences({ theme: 'light' });
            speak('Light theme selected');
          } else if (cleanCommand.includes('dark') && cleanCommand.includes('theme')) {
            updatePreferences({ theme: 'dark' });
            speak('Dark theme selected');
          } else if (cleanCommand.includes('home') || cleanCommand.includes('முகப்பு')) {
            speak(getText('goingHome', 'Going to Home'));
            window.location.href = '/';
          } else if (cleanCommand.includes('help') || cleanCommand.includes('உதவி')) {
            speak(getText('settingsHelp', 'Settings page. Say: voice mode to enable voice interaction, normal mode for touch, light theme or dark theme to change appearance, home to go to home page'));
          }
        });

        setTimeout(() => {
          startListening();
        }, 1000);
      }
    }

    // Cleanup function
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
    };
  }, [interactionMode, speak, setupSpeechRecognition, startListening, updatePreferences, getText]);

  const handleLogout = () => {
    localStorage.removeItem('ac_user');
    window.location.href = '/login';
  };

  const saveSettings = () => {
    localStorage.setItem('ac_notifications', JSON.stringify(notifications));
    localStorage.setItem('ac_privacy', JSON.stringify(privacy));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const clearData = () => {
    if (window.confirm(getText('confirmClearData'))) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const exportData = () => {
    const data = {
      user,
      preferences: { theme, language, interactionMode },
      notifications,
      privacy,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessible-chennai-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const themeOptions = [
    { value: 'light', label: getText('lightTheme'), icon: faSun },
    { value: 'dark', label: getText('darkTheme'), icon: faMoon },
    { value: 'high-contrast', label: getText('highContrastTheme'), icon: faEye }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'ta', label: 'தமிழ்', icon: '🇮🇳' }
  ];

  const modeOptions = [
    { value: 'normal', label: getText('normalMode'), icon: '👆' },
    { value: 'voice', label: getText('voiceMode'), icon: '🎤' }
  ];

  const VoiceActivationButton = () => {
    if (interactionMode !== 'voice') return null;
    
    return (
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            speak(getText('pleaseSpeak'));
            setVoiceFeedback(getText('pleaseSpeak'));
            startListening();
          }}
          style={{
            ...getButtonStyles(isListening ? 'primary' : 'ghost'),
            padding: '12px 20px',
            borderRadius: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
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
          <FontAwesomeIcon icon={faMicrophone} style={{ position: 'relative', zIndex: 1 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>
            {isListening ? getText('listening') : getText('activateVoice')}
          </span>
        </button>
        
        {voiceFeedback && (
          <div style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--text-primary)'
          }}>
            {voiceFeedback}
          </div>
        )}
      </div>
    );
  };

  const SettingCard = ({ title, children, description }) => (
    <div style={{
      ...getCardStyles(),
      padding: 24,
      borderRadius: 16,
      marginBottom: 20
    }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: 20,
        fontWeight: 600,
        ...getTextStyles('primary')
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          margin: '0 0 20px 0',
          fontSize: 14,
          lineHeight: 1.5,
          ...getTextStyles('secondary')
        }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div>
        <div style={{
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 4,
          ...getTextStyles('primary')
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: 14,
            ...getTextStyles('secondary')
          }}>
            {description}
          </div>
        )}
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: 50,
        height: 24,
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            opacity: 0,
            width: 0,
            height: 0
          }}
        />
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? 'var(--accent-color)' : '#ccc',
          borderRadius: 24,
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: 18,
            width: 18,
            left: checked ? 28 : 3,
            bottom: 3,
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </span>
      </label>
    </div>
  );

  const OptionButton = ({ value, current, onChange, option }) => (
    <button
      onClick={() => onChange && onChange(value)}
      style={{
        ...getButtonStyles(current === value ? 'primary' : 'ghost'),
        padding: '16px 20px',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontSize: 16,
        fontWeight: 500,
        transition: 'all 0.2s',
        minHeight: 60,
        flex: 1
      }}
    >
      <span style={{ fontSize: 20 }}>
        <FontAwesomeIcon icon={option.icon} />
      </span>
      <span>{option.label}</span>
    </button>
  );

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: 18,
        ...getThemeStyles()
      }}>
        {getText('loading')}
      </div>
    );
  }

  return (
    <div style={{ ...getThemeStyles(), paddingBottom: 80 }}>
      <Navigation user={user} onLogout={handleLogout} />

      <main style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
        <header style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{
              margin: '0',
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-extrabold)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: 'var(--letter-spacing-tight)',
              ...getTextStyles('primary')
            }}>
              {getText('settings')}
            </h1>
            {interactionMode === 'voice' && (
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
            margin: 0,
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-secondary)',
            lineHeight: 'var(--line-height-normal)',
            ...getTextStyles('secondary')
          }}>
            {getText('customizeExperience')}
          </p>
          {interactionMode === 'voice' && voiceFeedback && (
            <div style={{
              margin: '12px 0',
              padding: '8px 16px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              {voiceFeedback}
            </div>
          )}
        </header>

        {/* Success Message */}
        {showSaved && (
          <div style={{
            background: '#4caf50',
            color: 'white',
            padding: '16px 20px',
            borderRadius: 12,
            marginBottom: 20,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 500
          }}>
            ✅ {getText('settingsSaved')}
          </div>
        )}

        <SettingCard 
          title={getText('appearance')} 
          description={getText('chooseTheme')}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {themeOptions.map(option => (
              <OptionButton
                key={option.value}
                value={option.value}
                current={theme}
                onChange={(val) => updatePreferences({ theme: val })}
                option={option}
              />
            ))}
          </div>
        </SettingCard>

        {/* Language Settings */}
        <SettingCard 
          title={getText('language')} 
          description={getText('selectLanguage')}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {languageOptions.map(option => (
              <OptionButton
                key={option.value}
                value={option.value}
                current={language}
                onChange={(val) => updatePreferences({ language: val })}
                option={option}
              />
            ))}
          </div>
        </SettingCard>

        {/* Interaction Mode */}
        <SettingCard 
          title={getText('interactionMode')} 
          description={getText('chooseInputMethod')}
        >
          <VoiceActivationButton />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {modeOptions.map(option => (
              <OptionButton
                key={option.value}
                value={option.value}
                current={interactionMode}
                onChange={(val) => {
                  updatePreferences({ mode: val });
                  if (val === 'voice') {
                    speak(getText('voiceModeSelected'));
                  } else {
                    speak(getText('normalModeSelected'));
                  }
                }}
                option={option}
              />
            ))}
          </div>
        </SettingCard>

        {/* Notification Settings */}
        <SettingCard 
          title={getText('notifications')} 
          description={getText('manageNotifications')}
        >
          <ToggleSwitch
            checked={notifications.alerts}
            onChange={(e) => setNotifications({ ...notifications, alerts: e.target.checked })}
            label={getText('alertNotifications')}
            description={getText('accessibilityAlerts')}
          />
          <ToggleSwitch
            checked={notifications.traffic}
            onChange={(e) => setNotifications({ ...notifications, traffic: e.target.checked })}
            label={getText('trafficUpdates')}
            description={getText('realTimeTraffic')}
          />
          <ToggleSwitch
            checked={notifications.community}
            onChange={(e) => setNotifications({ ...notifications, community: e.target.checked })}
            label={getText('communityNotifications')}
            description={getText('newPostsComments')}
          />
          <ToggleSwitch
            checked={notifications.emergency}
            onChange={(e) => setNotifications({ ...notifications, emergency: e.target.checked })}
            label={getText('emergencyAlerts')}
            description={getText('criticalAlerts')}
          />
        </SettingCard>

        {/* Privacy Settings */}
        <SettingCard 
          title={getText('privacy')} 
          description={getText('controlDataSharing')}
        >
          <ToggleSwitch
            checked={privacy.shareLocation}
            onChange={(e) => setPrivacy({ ...privacy, shareLocation: e.target.checked })}
            label={getText('shareLocation')}
            description={getText('locationForRecommendations')}
          />
          <ToggleSwitch
            checked={privacy.shareActivity}
            onChange={(e) => setPrivacy({ ...privacy, shareActivity: e.target.checked })}
            label={getText('shareActivity')}
            description={getText('helpImproveApp')}
          />
          <ToggleSwitch
            checked={privacy.publicProfile}
            onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
            label={getText('publicProfile')}
            description={getText('visibleToCommunity')}
          />
        </SettingCard>

        {/* Account Settings */}
        <SettingCard title={getText('account')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={exportData}
              style={{
                ...getButtonStyles('ghost'),
                padding: '16px 20px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 500,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <span>📥</span>
              {getText('exportData')}
            </button>
            
            <button
              onClick={saveSettings}
              style={{
                ...getButtonStyles('primary'),
                padding: '16px 20px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
            >
              <span>💾</span>
              {getText('saveSettings')}
            </button>

            <button
              onClick={clearData}
              style={{
                ...getButtonStyles('danger'),
                padding: '16px 20px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
              {getText('clearAllData')}
            </button>
          </div>
        </SettingCard>

        {/* App Info */}
        <SettingCard title={getText('about')}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow)'
            }}>
              <span style={{
                fontSize: 28,
                color: 'var(--card-bg)',
                fontWeight: 'bold'
              }}>
                AC
              </span>
            </div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: 20,
              fontWeight: 600,
              ...getTextStyles('primary')
            }}>
              Accessible Chennai
            </h4>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: 14,
              ...getTextStyles('secondary')
            }}>
              Version 1.0.0
            </p>
            <p style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              ...getTextStyles('secondary')
            }}>
              {getText('appDescription')}
            </p>
          </div>
        </SettingCard>
      </main>
      
      {/* Global animations for voice mode */}
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
        `}
      </style>
    </div>
  );
}

export default Settings;
