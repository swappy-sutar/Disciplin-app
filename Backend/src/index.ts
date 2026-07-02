import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedGlobalQuotes } from './utils/seed-data';
import { User } from './models/User';

const startServer = async () => {
  try {
    await connectDB();

    // Defensive: Mark all pre-existing users as verified so they don't get locked out
    await User.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } });

    await seedGlobalQuotes();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
