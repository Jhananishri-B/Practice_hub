# 🚀 START YOUR PROJECT - Quick Guide

## ⚠️ IMPORTANT: Docker Desktop Required

**Docker Desktop must be running** before starting the backend and database.

### Step 1: Start Docker Desktop
1. Open Docker Desktop application
2. Wait until it shows "Docker Desktop is running"
3. You'll see a green icon in the system tray

### Step 2: Start Backend & Database
```bash
docker-compose up -d
```

### Step 3: Start Frontend (Already Running!)
The frontend is starting on: **http://localhost:5173**

---

## 📍 YOUR PROJECT PORTS

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Starting... |
| **Backend API** | http://localhost:5000 | ⏳ Start Docker first |
| **Database** | localhost:5432 | ⏳ Start Docker first |

---

## 🔑 Login Credentials

- **Student:** USER / 123
- **Admin:** ADMIN / 123

---

## ✅ Quick Start Commands

### 1. Start Docker Desktop (Manual)
- Open Docker Desktop from Start Menu
- Wait for it to fully start

### 2. Start Backend & Database
```bash
cd "d:\AI WORKSHOP\TASK\PRACTICE_HUB"
docker-compose up -d
```

### 3. Frontend (Already Running!)
Open browser: **http://localhost:5173**

---

## 🔍 Check Status

```bash
# Check if Docker is running
docker ps

# Check if backend is running
curl http://localhost:5000/health

# Check frontend
# Open: http://localhost:5173
```

---

## 📝 Next Steps

1. ✅ **Frontend is starting** - Open http://localhost:5173
2. ⏳ **Start Docker Desktop** - Then run `docker-compose up -d`
3. ✅ **Login** - Use USER/123 or ADMIN/123

---

## 🆘 Troubleshooting

### Docker Desktop Not Running
- Error: "The system cannot find the file specified"
- **Solution:** Start Docker Desktop application

### Port Already in Use
- If port 5173 is busy, Vite will automatically use the next available port
- Check the terminal output for the actual port

### Backend Not Starting
- Make sure Docker Desktop is running
- Run: `docker-compose logs backend` to see errors

