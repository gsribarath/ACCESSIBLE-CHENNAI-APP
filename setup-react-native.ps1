# Accessible Chennai React Native Setup Script for Windows
# Run this script in PowerShell to set up the React Native Android app

Write-Host "🚀 Setting up Accessible Chennai React Native App..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "📥 Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Android Studio/ADB is installed
try {
    $adbVersion = adb version
    Write-Host "✅ ADB found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Android Studio/ADB not found. Please install Android Studio first." -ForegroundColor Yellow
    Write-Host "📱 Download from: https://developer.android.com/studio" -ForegroundColor Yellow
}

# Install React Native CLI globally
Write-Host "📦 Installing React Native CLI..." -ForegroundColor Cyan
npm install -g @react-native-community/cli

# Create new React Native project
Write-Host "🏗️  Creating React Native project..." -ForegroundColor Cyan
npx react-native init AccessibleChennaiApp --version latest

# Navigate to project directory
Set-Location AccessibleChennaiApp

# Install required dependencies
Write-Host "📦 Installing required packages..." -ForegroundColor Cyan

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

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src/screens"
New-Item -ItemType Directory -Force -Path "src/components"
New-Item -ItemType Directory -Force -Path "src/services"
New-Item -ItemType Directory -Force -Path "src/utils"
New-Item -ItemType Directory -Force -Path "src/context"
New-Item -ItemType Directory -Force -Path "assets/images"
New-Item -ItemType Directory -Force -Path "assets/icons"

Write-Host "✅ Directory structure created!" -ForegroundColor Green

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. cd AccessibleChennaiApp"
Write-Host "2. Configure Android SDK path in android/local.properties"
Write-Host "3. Connect Android device or start emulator"
Write-Host "4. Run: npx react-native run-android"
Write-Host ""
Write-Host "🔧 For development:" -ForegroundColor Yellow
Write-Host "- Start Metro bundler: npx react-native start"
Write-Host "- Run on Android: npx react-native run-android"
