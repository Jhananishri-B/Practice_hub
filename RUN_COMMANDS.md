# Run Commands - AI Practice Hub

## 🚀 Quick Start (One-Time Setup)

### Step 1: Start Backend & Database
```bash
docker-compose up -d
```

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

---

## 📋 Complete Command Reference

### Starting Services

```bash
# Start all Docker services (backend + database)
docker-compose up -d

# Start with logs visible
docker-compose up

# Start and rebuild containers
docker-compose up -d --build
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart postgres
```

### Checking Status

```bash
# Check running containers
docker-compose ps

# Check backend health
curl http://localhost:5000/health

# Check database connection
docker-compose exec postgres psql -U practicehub -d practice_hub -c "SELECT 1;"
```

### Frontend Commands

```bash
# Install dependencies (first time only)
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Commands

```bash
# Connect to database
docker-compose exec postgres psql -U practicehub -d practice_hub

# Run SQL file
docker-compose exec -T postgres psql -U practicehub -d practice_hub < db/schema.sql

# Backup database
docker-compose exec postgres pg_dump -U practicehub practice_hub > backup.sql

# Restore database
docker-compose exec -T postgres psql -U practicehub -d practice_hub < backup.sql
```

### Development Workflow

```bash
# 1. Start backend/database
docker-compose up -d

# 2. In separate terminal, start frontend
cd frontend && npm run dev

# 3. View backend logs in real-time
docker-compose logs -f backend

# 4. Make code changes (auto-reloads)

# 5. Restart backend if needed
docker-compose restart backend
```

### Troubleshooting Commands

```bash
# Check if ports are in use
netstat -ano | findstr :5000    # Windows
lsof -i :5000                   # Mac/Linux

# Remove all containers and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build

# Check container resource usage
docker stats

# View container details
docker-compose ps
docker inspect practice-hub-backend
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start in production mode
docker-compose -f docker-compose.yml up -d

# Set production environment variables
# Edit backend/.env and frontend/.env
```

---

## 🎯 Common Workflows

### First Time Setup
```bash
# 1. Start services
docker-compose up -d

# 2. Wait 10 seconds for initialization
sleep 10

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Start frontend
npm run dev
```

### Daily Development
```bash
# Start services (if not running)
docker-compose up -d

# Start frontend
cd frontend && npm run dev
```

### After Code Changes
```bash
# Backend changes - restart backend
docker-compose restart backend

# Frontend changes - auto-reloads (no restart needed)

# Database schema changes
docker-compose down -v
docker-compose up -d
```

### Clean Restart
```bash
# Stop everything
docker-compose down -v

# Remove node_modules (frontend)
cd frontend && rm -rf node_modules

# Start fresh
docker-compose up -d
cd frontend && npm install && npm run dev
```

---

## 🔑 Default Credentials

- **Student:** USER / 123
- **Admin:** ADMIN / 123

---

## 📍 Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: localhost:5432
- Health Check: http://localhost:5000/health

---

## ⚡ Quick Reference

| Task | Command |
|------|---------|
| Start all | `docker-compose up -d` |
| Stop all | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart backend | `docker-compose restart backend` |
| Frontend dev | `cd frontend && npm run dev` |
| Check health | `curl http://localhost:5000/health` |

