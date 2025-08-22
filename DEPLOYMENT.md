# Accessible Chennai - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run deployment script: `./deploy.bat` (Windows) or `./deploy.sh` (Linux/Mac)
3. Deploy: `vercel --prod`

### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Dockerfile and deploy

### Option 3: Render
1. Connect your GitHub repo to Render
2. Set build command: `./deploy.sh`
3. Set start command: `cd backend && python app.py`

### Option 4: Heroku
```bash
# Create Heroku app
heroku create accessible-chennai-app

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main
```

## 📦 Manual Build Process

### Build Frontend:
```bash
cd frontend
npm install
npm run build
```

### Setup Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🌐 Environment Variables

Create a `.env` file in the backend directory:
```
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url (optional)
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `netlify.toml` - Netlify deployment configuration  
- `Dockerfile` - Docker containerization
- `railway.yml` - Railway deployment configuration
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD

## 📱 Mobile App (Capacitor)

To build mobile apps:
```bash
cd frontend
npm install @capacitor/cli @capacitor/core
npx cap init
npx cap add android
npx cap add ios
npx cap copy
npx cap open android
```

## 🚀 Live Demo

Once deployed, your app will be available at your chosen platform's URL.

## 🆘 Troubleshooting

- Ensure all environment variables are set
- Check that both frontend and backend build successfully
- Verify API endpoints are correctly configured
- Test locally before deploying

## 📞 Support

For deployment issues, check the platform-specific documentation or create an issue in this repository.
