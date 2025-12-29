# 🚀 Google Sign-In Quick Start

## ✅ Implementation Complete!

Google Sign-In has been fully implemented in your application. Follow these steps to activate it:

---

## 📋 Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API** or **Google Identity API**
4. Go to **APIs & Services** > **Credentials**
5. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
6. Configure OAuth consent screen (if prompted)
7. Create OAuth Client ID:
   - **Application type:** Web application
   - **Name:** AI Practice Hub Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:5000`
   - **Authorized redirect URIs:**
     - `http://localhost:5173`
8. Copy your **Client ID** and **Client Secret**

---

## 🔧 Step 2: Configure Environment Variables

### **Option A: Using Docker (Recommended)**

Create a `.env` file in the project root:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

The `docker-compose.yml` is already configured to read these variables.

### **Option B: Local Development**

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📦 Step 3: Install Dependencies

### **Backend:**
```bash
cd backend
npm install
```

### **Frontend:**
```bash
cd frontend
npm install
```

---

## 🐳 Step 4: Restart Services

### **If using Docker:**
```bash
docker-compose down
docker-compose up -d --build
```

### **If running locally:**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## ✅ Step 5: Test Google Sign-In

1. Open http://localhost:5173
2. Click **"Sign in with Google"**
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard!

---

## 🎉 Done!

Google Sign-In is now active. Users can:
- Sign in with their Google account
- Automatically create an account (if new)
- Use all application features

---

## 📖 Full Documentation

See `GOOGLE_OAUTH_SETUP.md` for detailed setup instructions and troubleshooting.

---

## 🔍 What Was Implemented

✅ Backend Google OAuth service  
✅ Frontend Google Sign-In button  
✅ User auto-creation on first Google login  
✅ JWT token generation for Google users  
✅ Integration with existing auth system  

---

## 🆘 Troubleshooting

**Button not appearing?**
- Check `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Restart frontend dev server

**"Invalid Google token" error?**
- Verify Client ID matches in both frontend and backend
- Check Google Cloud Console settings

**CORS errors?**
- Ensure `http://localhost:5173` is in Authorized JavaScript origins
- Check backend CORS configuration

---

**Need help?** Check the logs:
- Backend: `docker-compose logs backend`
- Frontend: Browser console (F12)


