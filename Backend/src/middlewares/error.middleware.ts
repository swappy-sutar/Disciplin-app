import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/custom-errors';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const mongooseErrors = (err as any).errors || {};
    errors = Object.keys(mongooseErrors).map((key) => ({
      field: key,
      message: mongooseErrors[key].message || 'Invalid value',
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid parameter or ID format';
    errors = [{
      field: (err as any).path,
      message: 'Invalid data type or identifier format',
    }];
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  const response: any = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (statusCode === 500) {
    console.error(`💥 [${new Date().toISOString()}] 500 ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl}: ${message}`);
  }

  res.status(statusCode).json(response);
};
