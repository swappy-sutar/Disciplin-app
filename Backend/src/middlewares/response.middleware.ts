import { Request, Response, NextFunction } from 'express';

// Helper to generate descriptive default response messages based on request path and method
const getDefaultMessage = (req: Request, success: boolean): string => {
  if (!success) return 'Request failed';
  const path = req.originalUrl || req.path || '';
  const method = req.method;

  if (method === 'GET') {
    if (path.includes('/auth/me')) return 'User profile retrieved successfully';
    if (path.includes('/auth/users')) return 'Users list retrieved successfully';
    if (path.includes('/habits')) return 'Habits retrieved successfully';
    if (path.includes('/goals')) return 'Goals retrieved successfully';
    if (path.includes('/timetable')) return 'Timetable retrieved successfully';
    if (path.includes('/applications')) return 'Applications retrieved successfully';
    if (path.includes('/topics')) return 'Topics retrieved successfully';
    if (path.includes('/quotes')) return 'Quotes retrieved successfully';
    return 'Data retrieved successfully';
  }

  if (method === 'POST') {
    if (path.includes('/auth/login')) return 'Logged in successfully';
    if (path.includes('/auth/register')) return 'Registration successful';
    if (path.includes('/auth/logout')) return 'Logged out successfully';
    if (path.includes('/auth/refresh')) return 'Token refreshed successfully';
    if (path.includes('/auth/forgot-password')) return 'Password reset link sent successfully';
    if (path.includes('/auth/reset-password')) return 'Password reset successfully';
    if (path.includes('/auth/verify-email')) return 'Email verified successfully';
    
    if (path.includes('/habits')) return 'Habit created successfully';
    if (path.includes('/goals')) return 'Goal created successfully';
    if (path.includes('/timetable')) return 'Timetable entry created successfully';
    if (path.includes('/applications')) return 'Application created successfully';
    if (path.includes('/topics')) return 'Topic created successfully';
    return 'Resource created successfully';
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (path.includes('/auth/profile')) return 'Profile updated successfully';
    if (path.includes('/habits')) return 'Habit updated successfully';
    if (path.includes('/goals')) return 'Goal updated successfully';
    if (path.includes('/timetable')) return 'Timetable entry updated successfully';
    if (path.includes('/applications')) return 'Application updated successfully';
    if (path.includes('/topics')) return 'Topic updated successfully';
    return 'Resource updated successfully';
  }

  if (method === 'DELETE') {
    if (path.includes('/habits')) return 'Habit deleted successfully';
    if (path.includes('/goals')) return 'Goal deleted successfully';
    if (path.includes('/timetable')) return 'Timetable entry deleted successfully';
    if (path.includes('/applications')) return 'Application deleted successfully';
    if (path.includes('/topics')) return 'Topic deleted successfully';
    return 'Resource deleted successfully';
  }

  return 'Success';
};

// Global Response Formatter Middleware
export const responseFormatter = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && (typeof body === 'object' || Array.isArray(body))) {
      if (Array.isArray(body)) {
        return originalJson.call(this, {
          success: true,
          message: getDefaultMessage(req, true),
          data: body
        });
      }
      
      const isError = body.success === false;
      const success = body.success !== undefined ? body.success : true;
      const message = body.message || getDefaultMessage(req, success);
      
      const formatted: any = {
        success,
        message,
      };

      if (isError) {
        if (body.errors !== undefined) formatted.errors = body.errors;
        if (body.stack !== undefined) formatted.stack = body.stack;
      } else {
        if (body.data !== undefined) {
          formatted.data = body.data;
        } else {
          const otherKeys = Object.keys(body).filter(k => k !== 'success' && k !== 'message');
          if (otherKeys.length > 0) {
            const dataObj: any = {};
            otherKeys.forEach(k => {
              dataObj[k] = body[k];
            });
            formatted.data = dataObj;
          }
        }
      }
      return originalJson.call(this, formatted);
    }

    if (body !== undefined) {
      return originalJson.call(this, {
        success: true,
        message: getDefaultMessage(req, true),
        data: body
      });
    }

    return originalJson.call(this, body);
  };
  next();
};
