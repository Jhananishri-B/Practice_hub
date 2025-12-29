# 🔐 Google OAuth Setup Guide

This guide will help you set up Google Sign-In for your AI Practice Hub application.

---

## 📋 Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Google OAuth Credentials**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: `AI Practice Hub` (or any name)
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to **APIs & Services** > **Library**
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click **Enable**

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - User Type: **External** (for testing) or **Internal** (for organization)
     - App name: `AI Practice Hub`
     - User support email: Your email
     - Developer contact: Your email
     - Click **Save and Continue**
     - Scopes: Click **Save and Continue** (default is fine)
     - Test users: Add your email, click **Save and Continue**
     - Click **Back to Dashboard**

5. **Create OAuth Client ID**
   - Application type: **Web application**
   - Name: `AI Practice Hub Web Client`
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `http://localhost:5000` (for backend)
     - Add your production URLs when deploying
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (for development)
     - Add your production URLs when deploying
   - Click **Create**

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
     - **Client Secret** (keep this secure!)
   - **IMPORTANT:** Copy both values immediately (you won't see the secret again)

---

## 🔧 Step 2: Configure Environment Variables

### **Backend Configuration**

Add to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### **Frontend Configuration**

Create or update `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_BASE_URL=http://localhost:5000
```

**Note:** Only the Client ID goes in the frontend (it's safe to expose). The Client Secret stays in the backend only.

---

## 📦 Step 3: Install Dependencies

### **Backend**

The dependencies are already added to `package.json`. Run:

```bash
cd backend
npm install
```

This installs:
- `google-auth-library` - For verifying Google tokens

### **Frontend**

The dependencies are already added to `package.json`. Run:

```bash
cd frontend
npm install
```

This installs:
- `@react-oauth/google` - React components for Google Sign-In

---

## 🐳 Step 4: Update Docker Configuration

### **Update `docker-compose.yml`**

Add environment variables to the backend service:

```yaml
backend:
  environment:
    # ... existing vars ...
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```

### **Create `.env` file in project root**

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

Docker Compose will automatically read this file.

---

## ✅ Step 5: Test Google Sign-In

1. **Start the application:**
   ```bash
   docker-compose up -d
   cd frontend
   npm run dev
   ```

2. **Open the login page:**
   - Go to: http://localhost:5173
   - Click "Sign in with Google"
   - Select your Google account
   - Grant permissions

3. **Verify:**
   - You should be redirected to the dashboard
   - Your user should be created automatically (if new)
   - Check the database to see your user record

---

## 🔍 How It Works

1. **User clicks "Sign in with Google"**
   - Frontend opens Google OAuth popup
   - User selects account and grants permission

2. **Google returns an ID token**
   - Frontend receives the token
   - Sends it to backend `/api/auth/google`

3. **Backend verifies token**
   - Uses `google-auth-library` to verify the token
   - Extracts user info (email, name, etc.)

4. **User creation/login**
   - Backend checks if user exists (by email)
   - If new: Creates user account with role "student"
   - If existing: Logs them in

5. **JWT token generation**
   - Backend generates JWT token
   - Returns token and user data to frontend

6. **Frontend stores token**
   - Saves token in localStorage
   - User is now logged in

---

## 🛠️ Troubleshooting

### **Error: "Invalid Google token"**
- Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Verify the token hasn't expired
- Check browser console for errors

### **Error: "OAuth client not found"**
- Verify Client ID is correct
- Check that OAuth consent screen is configured
- Ensure API is enabled in Google Cloud Console

### **Error: "Redirect URI mismatch"**
- Add `http://localhost:5173` to Authorized JavaScript origins
- Add `http://localhost:5173` to Authorized redirect URIs
- Wait a few minutes for changes to propagate

### **Google Sign-In button not appearing**
- Check that `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Verify `GoogleOAuthProvider` is wrapping your app
- Check browser console for errors

### **CORS errors**
- Ensure backend CORS allows `http://localhost:5173`
- Check `FRONTEND_URL` in backend `.env`

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Client Secret** - Only use in backend, never expose to frontend
3. **HTTPS in production** - Always use HTTPS for production
4. **Token expiration** - Google tokens expire, backend handles this
5. **User roles** - Google users default to "student" role

---

## 📝 Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add production URLs to Authorized JavaScript origins
   - Add production URLs to Authorized redirect URIs

2. **Update environment variables:**
   - Set production `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Update `VITE_GOOGLE_CLIENT_ID` in frontend build

3. **OAuth Consent Screen:**
   - Complete the verification process
   - Add production domain
   - Submit for review (if needed)

---

## 🎉 You're Done!

Google Sign-In is now configured. Users can:
- Sign in with their Google account
- Automatically create an account (if new)
- Use all features of the application

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library](https://www.npmjs.com/package/google-auth-library)

---

**Need help?** Check the logs:
- Backend: `docker-compose logs backend`
- Frontend: Browser console


