#!/bin/bash

# Accessible Chennai Deployment Script

echo "🚀 Starting Accessible Chennai Deployment..."

# Build Frontend
echo "📦 Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy build to backend static folder
echo "📋 Copying frontend build to backend..."
rm -rf backend/static
cp -r frontend/build backend/static

echo "✅ Build completed successfully!"

echo "📝 Deployment Options:"
echo "1. Vercel: Run 'vercel --prod' in the root directory"
echo "2. Railway: Push to GitHub and connect Railway to your repo"
echo "3. Heroku: Create Heroku app and push"
echo "4. Docker: Run 'docker build -t accessible-chennai .'"

echo "🌟 Your app is ready for deployment!"
