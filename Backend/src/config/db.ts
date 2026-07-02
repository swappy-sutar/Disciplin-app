import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const conn = await mongoose.connect(env.MONGODB_URI);
    if (env.NODE_ENV !== 'test') {
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`❌ Database connection error: ${error}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (env.NODE_ENV !== 'test') {
      console.log('📡 MongoDB Disconnected');
    }
  } catch (error) {
    console.error(`❌ Database disconnection error: ${error}`);
  }
};
