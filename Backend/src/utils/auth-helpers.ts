import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  role: string;
}

const getRefreshSecret = () => {
  return env.JWT_REFRESH_SECRET;
};

export const generateAccessToken = (userId: string | Types.ObjectId, role: string): string => {
  return jwt.sign({ userId: userId.toString(), role }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string | Types.ObjectId): string => {
  const jti = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return jwt.sign({ userId: userId.toString(), jti }, getRefreshSecret(), {
    expiresIn: '7d',
  });
};

export const generateToken = (userId: string | Types.ObjectId, role: string): string => {
  return generateAccessToken(userId, role);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload;
};
