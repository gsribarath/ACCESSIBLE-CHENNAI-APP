import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import Navigation from '../components/Navigation';

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
  }, []);

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
    { value: 'light', label: getText('lightTheme'), icon: '☀️' },
    { value: 'dark', label: getText('darkTheme'), icon: '🌙' },
    { value: 'high-contrast', label: getText('highContrastTheme'), icon: '🔳' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'ta', label: 'தமிழ்', icon: '🇮🇳' }
  ];

  const modeOptions = [
    { value: 'normal', label: getText('normalMode'), icon: '👆' },
    { value: 'voice', label: getText('voiceMode'), icon: '🎤' }
  ];

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
      <span style={{ fontSize: 20 }}>{option.icon}</span>
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
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: 32,
            fontWeight: 700,
            ...getTextStyles('primary')
          }}>
            {getText('settings')}
          </h1>
          <p style={{
            margin: 0,
            fontSize: 16,
            ...getTextStyles('secondary')
          }}>
            {getText('customizeExperience')}
          </p>
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {modeOptions.map(option => (
              <OptionButton
                key={option.value}
                value={option.value}
                current={interactionMode}
                onChange={(val) => updatePreferences({ mode: val })}
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
              <span>🗑️</span>
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
    </div>
  );
}

export default Settings;
