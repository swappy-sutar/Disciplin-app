import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth-helpers';
import { User } from '../models/User';
import { NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError } from '../utils/custom-errors';
import { env } from '../config/env';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';
import { getWelcomeEmail } from '../templates/mail/welcome.template';
import { getVerificationEmail } from '../templates/mail/verification.template';
import { getResetPasswordEmail } from '../templates/mail/reset-password.template';

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

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/+$/, '');
    const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const emailData = getVerificationEmail({
      name: user.name,
      verifyUrl,
    });

    let emailError = false;
    let responseMessage = 'Registration successful! Please check your email to verify your account.';

    try {
      await sendEmail({
        email: user.email,
        subject: emailData.subject,
        message: emailData.text,
        html: emailData.html,
      });
    } catch (err: any) {
      console.error('Failed to send verification email:', err);
      emailError = true;
      responseMessage = `User registered, but failed to send verification email. Error: ${err.message || err}`;
    }

    res.status(201).json({
      success: true,
      emailError,
      message: responseMessage,
    });
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
      throw new NotFoundError('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailData = getResetPasswordEmail({
      name: user.name,
      resetUrl,
    });

    let emailError = false;
    let responseMessage = 'Password reset link sent to your email';

    try {
      await sendEmail({
        email: user.email,
        subject: emailData.subject,
        message: emailData.text,
        html: emailData.html,
      });
    } catch (err: any) {
      console.error('Failed to send reset password email:', err);
      emailError = true;
      responseMessage = `Password reset requested, but failed to send email. Error: ${err.message || err}`;
      
      // Clean up reset token since email failed
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      emailError,
      message: responseMessage,
    });
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

    // Send Welcoming Email after verification
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/+$/, '');
    const welcomeMail = getWelcomeEmail({
      name: user.name,
      dashboardUrl: `${frontendUrl}/login`,
    });

    let emailError = false;
    let responseMessage = 'Email verified successfully! You can now log in.';

    try {
      await sendEmail({
        email: user.email,
        subject: welcomeMail.subject,
        message: welcomeMail.text,
        html: welcomeMail.html,
      });
    } catch (err: any) {
      console.error('Failed to send welcome email:', err);
      emailError = true;
      responseMessage = `Email verified, but failed to send welcome email. Error: ${err.message || err}`;
    }

    res.status(200).json({
      success: true,
      emailError,
      message: responseMessage,
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
