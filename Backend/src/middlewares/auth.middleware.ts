import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth-helpers';
import { UnauthorizedError } from '../utils/custom-errors';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized, no token');
    }

    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.userId };
      next();
    } catch (err) {
      throw new UnauthorizedError('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};
