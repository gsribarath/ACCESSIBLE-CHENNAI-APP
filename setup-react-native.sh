#!/bin/bash

# Accessible Chennai React Native Setup Script
# Run this script to set up the React Native Android app

echo "🚀 Setting up Accessible Chennai React Native App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Android Studio is installed
if ! command -v adb &> /dev/null; then
    echo "⚠️  Android Studio/ADB not found. Please install Android Studio first."
    echo "📱 Download from: https://developer.android.com/studio"
fi

# Install React Native CLI globally
echo "📦 Installing React Native CLI..."
npm install -g @react-native-community/cli

# Create new React Native project
echo "🏗️  Creating React Native project..."
npx react-native init AccessibleChennaiApp --version latest

# Navigate to project directory
cd AccessibleChennaiApp

# Install required dependencies
echo "📦 Installing required packages..."

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Maps
npm install react-native-maps

# Voice/Speech
npm install @react-native-voice/voice
npm install react-native-tts

# Icons
npm install react-native-vector-icons

# HTTP requests
npm install axios

# AsyncStorage for data persistence
npm install @react-native-async-storage/async-storage

# Location services
npm install react-native-geolocation-service

# Permissions
npm install react-native-permissions

# Date/Time utilities
npm install moment

echo "✅ Dependencies installed successfully!"

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/screens
mkdir -p src/components
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/context
mkdir -p assets/images
mkdir -p assets/icons

echo "✅ Directory structure created!"

# iOS specific setup (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios && pod install && cd ..
fi

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. cd AccessibleChennaiApp"
echo "2. Configure Android SDK path in android/local.properties"
echo "3. Connect Android device or start emulator"
echo "4. Run: npx react-native run-android"
echo ""
echo "🔧 For development:"
echo "- Start Metro bundler: npx react-native start"
echo "- Run on Android: npx react-native run-android"
echo "- Run on iOS: npx react-native run-ios (macOS only)"
