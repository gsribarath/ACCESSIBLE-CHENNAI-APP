// Example: How to convert your Home.js to React Native
// File: src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize voice recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    setVoiceFeedback('Listening...');
  };

  const onSpeechRecognized = () => {
    setVoiceFeedback('Voice recognized');
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechError = (error) => {
    console.error('Speech error:', error);
    setIsListening(false);
    setVoiceFeedback('');
  };

  const onSpeechResults = (event) => {
    const result = event.value[0].toLowerCase();
    setVoiceFeedback(`You said: ${result}`);
    
    // Voice command handling - simplified like your web version
    if (result.includes('map') || result.includes('navigate')) {
      speak('Going to Navigation');
      navigation.navigate('Navigate');
    } else if (result.includes('alerts')) {
      speak('Going to Alerts');
      navigation.navigate('Alerts');
    } else if (result.includes('community')) {
      speak('Going to Community');
      navigation.navigate('Community');
    } else if (result.includes('settings')) {
      speak('Going to Settings');
      navigation.navigate('Settings');
    } else if (result.includes('help')) {
      speak('Welcome to Accessible Chennai. Say: map for navigation, alerts for updates, community to connect, or settings for preferences');
    }
  };

  const speak = (text) => {
    Tts.speak(text);
  };

  const startListening = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Accessible Chennai</Text>
        <Text style={styles.subtitle}>Your inclusive navigation companion</Text>
        
        {/* Voice Indicator */}
        <View style={[styles.voiceIndicator, isListening && styles.voiceListening]}>
          <Icon name="microphone" size={16} color="white" />
          <Text style={styles.voiceText}>
            {isListening ? 'Listening...' : 'Voice Ready'}
          </Text>
        </View>
        
        {/* Voice Feedback */}
        {voiceFeedback ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{voiceFeedback}</Text>
          </View>
        ) : null}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => navigation.navigate('Navigate')}
        >
          <Icon name="location-arrow" size={24} color="white" />
          <Text style={styles.actionText}>Navigate</Text>
          <Text style={styles.actionSubtext}>Find accessible routes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Icon name="exclamation-triangle" size={24} color="white" />
          <Text style={styles.actionText}>Live Alerts</Text>
          <Text style={styles.actionSubtext}>Transport updates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryAction]}
          onPress={() => navigation.navigate('Community')}
        >
          <Icon name="users" size={24} color="white" />
          <Text style={styles.actionText}>Community</Text>
          <Text style={styles.actionSubtext}>Share & connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.quaternaryAction]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="cog" size={24} color="white" />
          <Text style={styles.actionText}>Settings</Text>
          <Text style={styles.actionSubtext}>Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Control Button */}
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={isListening ? stopListening : startListening}
      >
        <Icon name="microphone" size={32} color="white" />
        <Text style={styles.voiceButtonText}>
          {isListening ? 'Stop Listening' : 'Start Voice Control'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196f3',
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  voiceListening: {
    backgroundColor: '#4caf50',
  },
  voiceText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryAction: {
    backgroundColor: '#4caf50',
  },
  secondaryAction: {
    backgroundColor: '#ff9800',
  },
  tertiaryAction: {
    backgroundColor: '#9c27b0',
  },
  quaternaryAction: {
    backgroundColor: '#607d8b',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  voiceButton: {
    backgroundColor: '#2196f3',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default HomeScreen;
