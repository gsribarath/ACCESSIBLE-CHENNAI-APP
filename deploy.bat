@echo off
echo 🚀 Starting Accessible Chennai Deployment...

REM Build Frontend
echo 📦 Building React Frontend...
cd frontend
call npm install
call npm run build
cd ..

REM Copy build to backend static folder
echo 📋 Copying frontend build to backend...
if exist backend\static rmdir /s /q backend\static
xcopy frontend\build backend\static /e /i

echo ✅ Build completed successfully!

echo 📝 Deployment Options:
echo 1. Vercel: Run 'vercel --prod' in the root directory
echo 2. Railway: Push to GitHub and connect Railway to your repo
echo 3. Heroku: Create Heroku app and push
echo 4. Docker: Run 'docker build -t accessible-chennai .'

echo 🌟 Your app is ready for deployment!
pause
