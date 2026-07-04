import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth-helpers';
import { User } from '../models/User';
import { NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError } from '../utils/custom-errors';
import { env } from '../config/env';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins (access token)
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (refresh token)
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const { user, verificationToken } = await authService.registerUser(name, email, password);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const message = `Please verify your email address by clicking the link below:\n\n${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Disciplin Email Verification ✉️',
        message,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Email Verification</h2>
          <p>Thanks for signing up with Disciplin! Please click the button below to verify your email address and activate your account:</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;"><a href="${verifyUrl}">${verifyUrl}</a></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">This verification link is valid for 24 hours.</p>
        </div>`
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw new Error('Verification email could not be sent. Registration cancelled.');
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    
    if (!user.isVerified) {
      throw new ForbiddenError('Please verify your email before logging in');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.hashedRefreshToken = hashedToken;
    await user.save();

    setAuthCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      const receivedHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const user = await User.findOne({ hashedRefreshToken: receivedHash });
      if (user) {
        user.hashedRefreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const receivedHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ hashedRefreshToken: receivedHash });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch (err) {
      user.hashedRefreshToken = undefined;
      await user.save();
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    user.hashedRefreshToken = newHashedToken;
    await user.save();

    setAuthCookie(res, newAccessToken);
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      user.email = email;
    }
    if (password) {
      user.passwordHash = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Do not reveal if the email is registered or not (prevent user enumeration)
      res.status(200).json({
        success: true,
        message: 'Password reset link sent! Check your inbox.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click the link below or copy-paste it into your browser:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Disciplin Password Reset Request 🔑',
        message,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Password Reset Request</h2>
          <p>You are receiving this email because you requested a password reset for your Disciplin account.</p>
          <p>Please click the button below to choose a new password. This link is valid for 15 minutes.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;"><a href="${resetUrl}">${resetUrl}</a></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
        </div>`
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string || req.body.token as string;
    const { password } = req.body;

    if (!token) {
      throw new BadRequestError('No reset token provided');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string || req.body.token as string;

    if (!token) {
      throw new BadRequestError('No verification token provided');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
