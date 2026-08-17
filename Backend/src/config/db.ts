import mongoose from 'mongoose';
import { env } from './env';

// Lightweight slow-query logging plugin
const SLOW_QUERY_THRESHOLD_MS = 150;

if (env.NODE_ENV !== 'production') {
  mongoose.plugin((schema) => {
    schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'] as any, function (this: any) {
      this._startTime = Date.now();
    });

    schema.post(['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'] as any, function (this: any) {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        if (duration > SLOW_QUERY_THRESHOLD_MS) {
          const modelName = this.model?.modelName || this._model?.modelName || 'Query';
          const op = this.op || 'operation';
          console.warn(`⚠️ [SLOW DB QUERY] ${modelName}.${op} took ${duration}ms`);
        }
      }
    });
  });
}

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 25,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    if (env.NODE_ENV !== 'test') {
      console.log(`📡 MongoDB Connected: ${conn.connection.host} (Pool Size: 25)`);
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
