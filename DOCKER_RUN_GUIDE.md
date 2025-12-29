# 🐳 DOCKER RUN GUIDE - Complete Project

## 🚀 RUN ENTIRE PROJECT WITH DOCKER

### **Single Command to Start Everything:**
```bash
docker-compose up -d
```

This starts:
- ✅ PostgreSQL Database (port 5432)
- ✅ Backend API (port 5000)
- ✅ Frontend (port 5173)

---

## 📋 COMPLETE DOCKER COMMANDS

### **1. Start All Services**
```bash
docker-compose up -d
```

### **2. View All Services Status**
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                    STATUS                   PORTS
practice-hub-backend    Up X seconds             0.0.0.0:5000->5000/tcp
practice-hub-db         Up X seconds (healthy)   0.0.0.0:5432->5432/tcp
practice-hub-frontend   Up X seconds             0.0.0.0:5173->5173/tcp
```

### **3. View Logs (All Services)**
```bash
docker-compose logs -f
```

### **4. View Specific Service Logs**
```bash
# Frontend logs
docker-compose logs -f frontend

# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres
```

### **5. Stop All Services**
```bash
docker-compose down
```

### **6. Restart All Services**
```bash
docker-compose restart
```

### **7. Rebuild and Restart (After Code Changes)**
```bash
docker-compose up -d --build
```

---

## 🌐 ACCESS YOUR APPLICATION

### **Frontend (Running in Docker):**
👉 **http://localhost:5173**

### **Backend API:**
👉 **http://localhost:5000**

### **Backend Health Check:**
👉 **http://localhost:5000/health**

---

## 🔑 LOGIN CREDENTIALS

- **Student:** USER / 123
- **Admin:** ADMIN / 123

---

## ✅ VERIFICATION COMMANDS

### Check All Services Are Running
```bash
docker-compose ps
```

### Test Backend
```bash
curl http://localhost:5000/health
```

### Test Frontend
```bash
curl http://localhost:5173
```

### Check Ports
```bash
netstat -ano | findstr ":5000 :5173 :5432"
```

---

## 🔄 COMMON WORKFLOWS

### **Start Project (First Time)**
```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for initialization (10-15 seconds)
timeout /t 15

# 3. Check status
docker-compose ps

# 4. Verify services
curl http://localhost:5000/health
curl http://localhost:5173

# 5. Open browser
# http://localhost:5173
```

### **Restart After Code Changes**
```bash
# Rebuild and restart
docker-compose up -d --build

# Or restart specific service
docker-compose restart frontend
docker-compose restart backend
```

### **View Real-Time Logs**
```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

### **Stop Everything**
```bash
docker-compose down
```

### **Clean Restart (Fresh Start)**
```bash
# Stop and remove everything including data
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

---

## 📊 CURRENT STATUS

| Service | Container Name | Port | Status |
|---------|---------------|------|--------|
| **Frontend** | practice-hub-frontend | 5173 | ✅ Running in Docker |
| **Backend** | practice-hub-backend | 5000 | ✅ Running in Docker |
| **Database** | practice-hub-db | 5432 | ✅ Running in Docker |

---

## 🎯 QUICK REFERENCE

| Task | Command |
|------|---------|
| **Start all** | `docker-compose up -d` |
| **Stop all** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |
| **Check status** | `docker-compose ps` |
| **Restart all** | `docker-compose restart` |
| **Rebuild all** | `docker-compose up -d --build` |
| **Restart frontend** | `docker-compose restart frontend` |
| **Restart backend** | `docker-compose restart backend` |

---

## 🎊 YOUR PROJECT IS RUNNING IN DOCKER!

**All services are containerized and running:**
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:5000
- ✅ Database: localhost:5432

**👉 Open http://localhost:5173 in your browser!**

---

## 📝 NOTES

- All services run in Docker containers
- No need to run `npm run dev` manually
- Frontend hot-reload works in Docker
- All logs visible via `docker-compose logs -f`

---

## 🆘 TROUBLESHOOTING

### If Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### If Backend Not Working
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### If Services Won't Start
```bash
# Check Docker is running
docker ps

# View all logs
docker-compose logs

# Rebuild everything
docker-compose down
docker-compose up -d --build
```

---

**🎉 Everything runs in Docker now!**

