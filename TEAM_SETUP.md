# Practice Hub - Team Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Environment Setup

**Copy the environment files:**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Database Connection (TiDB Cloud)

The app uses TiDB Cloud. If you get **ETIMEDOUT** error:

#### Option A: Whitelist Your IP (Recommended)
1. Get your public IP: Visit https://api.ipify.org
2. Contact the project admin to add your IP to TiDB Cloud whitelist
3. TiDB Cloud Console → Cluster → Security → Add IP to Access List

#### Option B: Use a VPN to Same Region
Connect to a VPN server in Singapore (ap-southeast-1) as the database is hosted there.

### 4. SSL Certificate
Make sure `tidb-ca.pem` file exists in the project root:
```
Practice_hub/
  ├── tidb-ca.pem   ← Required!
  ├── backend/
  └── frontend/
```

### 5. Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### 6. Access the App
Open http://localhost:5173 in your browser

## Common Errors

### ETIMEDOUT Error
**Cause:** Your IP is not whitelisted in TiDB Cloud

**Solution:**
1. Test connectivity: `Test-NetConnection gateway01.ap-southeast-1.prod.aws.tidbcloud.com -Port 4000`
2. If fails, ask admin to whitelist your IP
3. Try mobile hotspot if on corporate network

### ECONNREFUSED Error  
**Cause:** Database port blocked by firewall

**Solution:**
- Disable VPN
- Allow outbound connections on port 4000
- Try different network

## Admin: How to Whitelist All IPs
In TiDB Cloud Console:
1. Go to Cluster → Security
2. Add `0.0.0.0/0` to allow all IPs (development only)
3. For production, whitelist specific IPs only
