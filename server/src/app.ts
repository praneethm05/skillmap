import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import learningPlanRoutes from './routes/learningPlanRoutes';

const app = express();

// Global Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SkillMap API is running' });
});

// Use Clerk Middleware to attach auth object to requests
app.use(clerkMiddleware());

// Custom API Auth Middleware to prevent Clerk's default browser redirects
const requireApiAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: 'Unauthorized', message: 'Valid Clerk Bearer token required.' });
    return;
  }
  next();
};

// API Routes - Protected by our custom requireApiAuth
app.use('/api/v1/learning-plans', requireApiAuth, learningPlanRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error Middleware]', err.stack || err);
  res.status(err.status || 500).json({ 
    error: err.status === 401 ? 'Unauthorized' : 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;