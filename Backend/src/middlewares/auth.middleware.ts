import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth-helpers';
import { UnauthorizedError, ForbiddenError } from '../utils/custom-errors';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Primary: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[1] && parts[1] !== 'null' && parts[1] !== 'undefined') {
        token = parts[1];
      }
    }

    // Fallback: httpOnly jwt cookie set during login ONLY if no Authorization header was sent
    if (!token && !req.headers.authorization && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized, no token');
    }

    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      throw new UnauthorizedError('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
};
