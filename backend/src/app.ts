import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import logger from './config/logger';

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import sessionRoutes from './routes/sessionRoutes';
import resultRoutes from './routes/resultRoutes';
import progressRoutes from './routes/progressRoutes';
import adminRoutes from './routes/adminRoutes';
import aiTutorRoutes from './routes/aiTutorRoutes';
import userRoutes from './routes/userRoutes';
import questionRoutes from './routes/questionRoutes';
import skillRoutes from './routes/skillRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import skillPracticeRoutes from './routes/skillPracticeRoutes';
import adaptivePathRoutes from './routes/adaptivePathRoutes';
import diagnosticRoutes from './routes/diagnosticRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import intelligenceRoutes from './routes/intelligenceRoutes';
import seedRoutes from './routes/seedRoutes';


dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Practice Hub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      questions: '/api/questions',
      courses: '/api/courses',
      sessions: '/api/sessions',
      results: '/api/results',
      progress: '/api/progress',
      admin: '/api/admin',
      aiTutor: '/api/ai-tutor',
      skills: '/api/skills',
      onboarding: '/api/onboarding',
      practice: '/api/practice',
      learningPath: '/api/learning-path',
      diagnostic: '/api/diagnostic',
      analytics: '/api/analytics',
      intelligence: '/api/intelligence'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/practice', skillPracticeRoutes);
app.use('/api/learning-path', adaptivePathRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/seed', seedRoutes);


// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;

