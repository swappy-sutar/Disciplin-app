import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { responseFormatter } from './middlewares/response.middleware';
import { NotFoundError } from './utils/custom-errors';
import { env } from './config/env';

const app = express();

// Trust proxy (required for rate limiting behind reverse proxies like Render)
app.set('trust proxy', 1);

// Global Response Formatter Middleware
app.use(responseFormatter);

// Secure app with Helmet headers
app.use(helmet());

// General API Rate Limiting (500 requests / 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
      ].filter(Boolean);

      // Automatically trust Render or Vercel client applications
      const isAllowedRender = origin && (
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      );

      if (!origin || allowedOrigins.includes(origin) || isAllowedRender || env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        // Return false to reject rather than throwing an Error, preventing Express 500 preflight crashes
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// API Routes with general rate limiting
app.use('/api/v1', apiLimiter, routes);
app.use('/api/ai', routes);


// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  const status = dbStatus === 'up' ? 'ok' : 'error';
  res.status(status === 'ok' ? 200 : 500).json({
    status,
    environment: env.NODE_ENV,
    database: dbStatus,
  });
});

// Catch 404
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
