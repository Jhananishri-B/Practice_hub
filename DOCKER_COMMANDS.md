# 🐳 DOCKER COMMANDS - Complete Guide

## 🚀 START PROJECT (All Services)

### Step 1: Start Backend & Database
```bash
docker-compose up -d
```

### Step 2: Start Frontend (Separate Terminal)
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open Browser
👉 **http://localhost:5173**

---

## 📋 COMPLETE DOCKER COMMAND REFERENCE

### Starting Services

```bash
# Start all services in background
docker-compose up -d

# Start with logs visible (foreground)
docker-compose up

# Start and rebuild containers
docker-compose up -d --build

# Start specific service only
docker-compose up -d postgres
docker-compose up -d backend
```

### Stopping Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clean database)
docker-compose down -v

# Stop specific service
docker-compose stop backend
docker-compose stop postgres
```

### Viewing Logs

```bash
# All services logs (follow mode)
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Database logs only
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend

# Logs without follow
docker-compose logs backend
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart postgres

# Restart and rebuild
docker-compose up -d --build backend
```

### Checking Status

```bash
# Check running containers
docker-compose ps

# Check container status (detailed)
docker-compose ps -a

# Check resource usage
docker stats

# Check specific container
docker ps | grep practice-hub
```

### Rebuilding Containers

```bash
# Rebuild all containers
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend

# Rebuild without cache
docker-compose build --no-cache backend
```

### Database Commands

```bash
# Connect to PostgreSQL database
docker-compose exec postgres psql -U practicehub -d practice_hub

# Run SQL query
docker-compose exec postgres psql -U practicehub -d practice_hub -c "SELECT * FROM users;"

# Backup database
docker-compose exec postgres pg_dump -U practicehub practice_hub > backup.sql

# Restore database
docker-compose exec -T postgres psql -U practicehub -d practice_hub < backup.sql

# Check database connection
docker-compose exec postgres psql -U practicehub -d practice_hub -c "SELECT 1;"
```

### Container Management

```bash
# View container details
docker inspect practice-hub-backend
docker inspect practice-hub-db

# Execute command in container
docker-compose exec backend sh
docker-compose exec postgres sh

# View container logs (alternative)
docker logs practice-hub-backend
docker logs practice-hub-db -f

# Remove stopped containers
docker-compose rm

# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d --build
```

### Health Checks

```bash
# Check backend health
curl http://localhost:5000/health

# Check if backend is responding
curl http://localhost:5000/

# Test database connection from backend
docker-compose exec backend node -e "console.log('Backend is running')"
```

### Cleanup Commands

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes

# Clean and restart
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect practice_hub_default

# Connect to network
docker network connect practice_hub_default <container_name>
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect practice_hub_postgres_data

# Remove volume
docker volume rm practice_hub_postgres_data
```

---

## 🎯 QUICK START SEQUENCE

### Complete Setup (First Time)
```bash
# 1. Navigate to project
cd "d:\AI WORKSHOP\TASK\PRACTICE_HUB"

# 2. Start Docker services
docker-compose up -d

# 3. Wait for services to be ready
timeout /t 10

# 4. Check status
docker-compose ps

# 5. Check backend health
curl http://localhost:5000/health

# 6. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 7. Open browser
# http://localhost:5173
```

### Daily Start
```bash
# Start Docker services
docker-compose up -d

# Start frontend
cd frontend
npm run dev
```

### Stop Everything
```bash
# Stop Docker services
docker-compose down

# Stop frontend (Ctrl+C in terminal)
```

---

## 🔍 TROUBLESHOOTING COMMANDS

### If Services Won't Start
```bash
# Check Docker is running
docker ps

# Check for port conflicts
netstat -ano | findstr ":5000 :5432"

# View error logs
docker-compose logs backend
docker-compose logs postgres

# Restart Docker Desktop (if needed)
# Then run:
docker-compose up -d
```

### If Backend Has Errors
```bash
# View backend logs
docker-compose logs -f backend

# Rebuild backend
docker-compose up -d --build backend

# Check backend container
docker-compose exec backend sh
```

### If Database Has Issues
```bash
# Check database logs
docker-compose logs -f postgres

# Restart database
docker-compose restart postgres

# Check database health
docker-compose exec postgres pg_isready -U practicehub

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### If Ports Are Busy
```bash
# Find process using port
netstat -ano | findstr ":5000"
netstat -ano | findstr ":5432"
netstat -ano | findstr ":5173"

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

---

## 📊 MONITORING COMMANDS

```bash
# Real-time resource usage
docker stats

# Container resource usage
docker stats practice-hub-backend practice-hub-db

# Disk usage
docker system df

# Container disk usage
docker ps -s
```

---

## 🔄 COMMON WORKFLOWS

### Full Restart (After Code Changes)
```bash
# Stop everything
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

### Clean Restart (Fresh Start)
```bash
# Stop and remove everything
docker-compose down -v

# Remove unused Docker resources
docker system prune -f

# Rebuild and start
docker-compose up -d --build

# Wait for initialization
timeout /t 15

# Verify
docker-compose ps
curl http://localhost:5000/health
```

### Update and Restart
```bash
# Pull latest code (if using git)
git pull

# Rebuild backend
docker-compose up -d --build backend

# Restart frontend (in frontend terminal)
# Ctrl+C to stop, then:
npm run dev
```

---

## ✅ VERIFICATION COMMANDS

```bash
# Check all services are running
docker-compose ps

# Expected output:
# NAME                   STATUS
# practice-hub-backend   Up X minutes
# practice-hub-db        Up X minutes (healthy)

# Test backend
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}

# Test database
docker-compose exec postgres psql -U practicehub -d practice_hub -c "SELECT 1;"
# Should return: test = 1

# Check ports
netstat -ano | findstr ":5000 :5173 :5432"
# Should show LISTENING for all three
```

---

## 🎯 ONE-LINER COMMANDS

```bash
# Start everything
docker-compose up -d && cd frontend && npm run dev

# Stop everything
docker-compose down

# View all logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Rebuild backend
docker-compose up -d --build backend

# Check status
docker-compose ps && curl http://localhost:5000/health
```

---

## 📝 ESSENTIAL COMMANDS SUMMARY

| Task | Command |
|------|---------|
| **Start all** | `docker-compose up -d` |
| **Stop all** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |
| **Restart backend** | `docker-compose restart backend` |
| **Rebuild backend** | `docker-compose up -d --build backend` |
| **Check status** | `docker-compose ps` |
| **Health check** | `curl http://localhost:5000/health` |
| **Database access** | `docker-compose exec postgres psql -U practicehub -d practice_hub` |
| **Clean restart** | `docker-compose down -v && docker-compose up -d --build` |

---

## 🎊 YOUR PROJECT PORTS

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Database:** localhost:5432

---

## 🔑 LOGIN CREDENTIALS

- **Student:** USER / 123
- **Admin:** ADMIN / 123

---

## 🚀 QUICK START

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Wait 10 seconds
timeout /t 10

# 3. Start frontend (new terminal)
cd frontend
npm run dev

# 4. Open browser
# http://localhost:5173
```

---

**All Docker commands you need to run and manage your project!**

