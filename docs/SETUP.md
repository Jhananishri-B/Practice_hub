# Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Git

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd PRACTICE_HUB
```

2. Start all services:
```bash
docker-compose up -d
```

3. Wait for services to be ready (about 30 seconds)

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Credentials

### Student Login
- Username: `USER`
- Password: `123`

### Admin Login
- Username: `ADMIN`
- Password: `123`

## Stopping Services

```bash
docker-compose down
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Database Access

The database is accessible at `localhost:5432` with:
- User: `practicehub`
- Password: `practicehub123`
- Database: `practice_hub`

## Troubleshooting

### Port Already in Use
If ports 5000, 5173, or 5432 are already in use, modify the ports in `docker-compose.yml`.

### Database Connection Issues
Ensure the PostgreSQL container is healthy:
```bash
docker-compose ps
```

### Backend Not Starting
Check backend logs:
```bash
docker-compose logs backend
```

