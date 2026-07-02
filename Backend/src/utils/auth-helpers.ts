import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
}

const getRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || (env.JWT_SECRET + "_refresh");
};

export const generateAccessToken = (userId: string | Types.ObjectId, role: string): string => {
  return jwt.sign({ userId: userId.toString(), role }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string | Types.ObjectId): string => {
  return jwt.sign({ userId: userId.toString() }, getRefreshSecret(), {
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
