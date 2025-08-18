# Quick Capacitor Setup - Convert Web App to Android

## Option 2: Capacitor (Easiest - Minimal Changes Required)

Capacitor lets you wrap your existing React web app into a native Android app with minimal changes.

### Steps:

#### 1. Install Capacitor in your frontend folder
```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npx cap init "Accessible Chennai" "com.accessiblechennai.app"
```

#### 2. Add Android platform
```bash
npm install @capacitor/android
npx cap add android
```

#### 3. Install native plugins for your features
```bash
# Voice/Speech
npm install @capacitor-community/speech-recognition
npm install @capacitor/text-to-speech

# Geolocation
npm install @capacitor/geolocation

# Storage (replaces localStorage)
npm install @capacitor/preferences

# Network status
npm install @capacitor/network

# App info
npm install @capacitor/app

# Status bar
npm install @capacitor/status-bar

# Splash screen
npm install @capacitor/splash-screen
```

#### 4. Update your existing code for Capacitor

Add this to your `src/services/capacitorUtils.js`:

```javascript
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor/text-to-speech';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

export const CapacitorVoice = {
  // Speech Recognition
  async startListening() {
    const { available } = await SpeechRecognition.available();
    if (available) {
      await SpeechRecognition.start({
        language: "en-US",
        maxResults: 1,
        prompt: "Say something",
        partialResults: true,
        popup: false,
      });
    }
  },

  async stopListening() {
    await SpeechRecognition.stop();
  },

  // Text to Speech
  async speak(text) {
    await TextToSpeech.speak({
      text: text,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    });
  },

  // Location
  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates;
  },

  // Storage
  async setItem(key, value) {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value),
    });
  },

  async getItem(key) {
    const { value } = await Preferences.get({ key: key });
    return value ? JSON.parse(value) : null;
  }
};
```

#### 5. Update your voiceUtils.js
Replace browser APIs with Capacitor APIs:

```javascript
// Replace this in your existing voiceUtils.js
import { CapacitorVoice } from './capacitorUtils';

// In useVoiceInterface hook:
const setupSpeechRecognition = useCallback((onResult) => {
  if (isCapacitor()) {
    // Use Capacitor speech recognition
    CapacitorVoice.startListening();
    // Add event listeners for results
  } else {
    // Keep existing web Speech API code
  }
}, []);

const speak = useCallback((text) => {
  if (isCapacitor()) {
    CapacitorVoice.speak(text);
  } else {
    // Keep existing web Speech Synthesis code
  }
}, []);

// Helper function
const isCapacitor = () => {
  return window.Capacitor !== undefined;
};
```

#### 6. Build and run
```bash
# Build your React app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### 7. Configure Android permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### 8. Run on device
- Connect Android device via USB
- Enable Developer Options and USB Debugging
- In Android Studio, click Run button

### Advantages of Capacitor:
✅ Minimal code changes
✅ Reuse existing React components
✅ Fast development
✅ Good for prototyping
✅ Familiar web development workflow

### Disadvantages:
❌ Less native performance than React Native
❌ Larger app size
❌ Some limitations with complex native features

## Quick Start Command:
```bash
cd frontend && npm install @capacitor/core @capacitor/cli @capacitor/android && npx cap init "Accessible Chennai" "com.accessiblechennai.app" && npx cap add android
```

This approach lets you test your app on Android very quickly with minimal changes!
