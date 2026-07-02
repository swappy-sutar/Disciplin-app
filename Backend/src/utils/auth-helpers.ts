import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
}

export const generateToken = (userId: string | Types.ObjectId): string => {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
