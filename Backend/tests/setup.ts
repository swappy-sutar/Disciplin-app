import { beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

beforeAll(async () => {
  const testUri = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/\/([^/]+)$/, '/disciplin-app-test')
    : 'mongodb://127.0.0.1:27017/disciplin-app-test';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState > 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState > 0) {
    await mongoose.disconnect();
  }
});
