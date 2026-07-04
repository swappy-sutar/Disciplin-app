import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { responseFormatter } from './middlewares/response.middleware';
import { NotFoundError } from './utils/custom-errors';
import { env } from './config/env';

const app = express();

// Global Response Formatter Middleware
app.use(responseFormatter);

// Secure app with Helmet headers
app.use(helmet());

// General API Rate Limiting (100 requests / 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
    origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes with general rate limiting
app.use('/api/v1', apiLimiter, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// Catch 404
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
