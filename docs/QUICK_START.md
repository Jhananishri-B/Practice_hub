# Quick Start Guide - AI Practice Hub

## Prerequisites

- Docker and Docker Compose installed
- Git (optional, if cloning from repository)

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd PRACTICE_HUB
```

### 2. Start All Services (Backend + Database)

```bash
docker-compose up -d
```

This command will:
- Start PostgreSQL database container
- Start Backend API server
- Initialize database schema automatically
- Create default users (USER/123 and ADMIN/123)

### 3. Start Frontend (Separate Terminal)

```bash
cd frontend
npm install
npm run dev
```

**Note:** Frontend runs on port 5173 (not in Docker for development)

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

## Default Login Credentials

### Student Account
- **Username:** `USER`
- **Password:** `123`

### Admin Account
- **Username:** `ADMIN`
- **Password:** `123`

## Useful Commands

### View Running Containers

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

### Rebuild Containers (After Code Changes)

```bash
docker-compose up -d --build
```

### Restart a Specific Service

```bash
docker-compose restart backend
docker-compose restart postgres
```

### Check Service Health

```bash
# Backend health check
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Development Workflow

### Backend Development

```bash
# View backend logs in real-time
docker-compose logs -f backend

# Restart backend after code changes
docker-compose restart backend
```

### Frontend Development

```bash
cd frontend
npm run dev
# Frontend will auto-reload on file changes
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U practicehub -d practice_hub

# Or use any PostgreSQL client with:
# Host: localhost
# Port: 5432
# User: practicehub
# Password: practicehub123
# Database: practice_hub
```

## Troubleshooting

### Port Already in Use

If ports 5000, 5173, or 5432 are already in use:

1. **Change ports in docker-compose.yml:**
```yaml
ports:
  - "5001:5000"  # Change 5000 to 5001
```

2. **Or stop the conflicting service:**
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose up -d --build backend
```

### Frontend Not Connecting to Backend

1. Check backend is running: `docker-compose ps`
2. Check backend URL in `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
```
3. Restart frontend: `npm run dev`

### Clear Everything and Start Fresh

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove any orphaned containers
docker system prune -a

# Start fresh
docker-compose up -d
cd frontend && npm install && npm run dev
```

## Production Deployment

For production deployment on a CPU machine:

```bash
# Build and start in production mode
docker-compose -f docker-compose.yml up -d --build

# Set environment variables in .env files
# Backend: backend/.env
# Frontend: frontend/.env
```

## Quick Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart backend | `docker-compose restart backend` |
| Rebuild containers | `docker-compose up -d --build` |
| Access database | `docker-compose exec postgres psql -U practicehub -d practice_hub` |
| Check health | `curl http://localhost:5000/health` |

## Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Start frontend: `cd frontend && npm install && npm run dev`
3. ✅ Open browser: http://localhost:5173
4. ✅ Login with USER/123 or ADMIN/123
5. ✅ Start practicing!

