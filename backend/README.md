# Practice Hub Backend

Backend API server for AI Practice Hub built with Node.js, Express, and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`

3. Run in development:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id/levels` - Get course levels
- `POST /api/sessions/start` - Start practice session
- `POST /api/sessions/:id/submit` - Submit solution
- `GET /api/results/:sessionId` - Get session results
- And more...

## Database

Uses PostgreSQL with connection pooling. Database URL configured via `DATABASE_URL` environment variable.

