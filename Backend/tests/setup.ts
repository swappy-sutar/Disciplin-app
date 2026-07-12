import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Globally mock the sendEmail utility to avoid internet/SMTP timeouts
vi.mock('../src/utils/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

dotenv.config({ path: path.join(__dirname, '../.env') });

beforeAll(async () => {
  let testUri = 'mongodb://127.0.0.1:27017/disciplin-app-test';
  if (process.env.MONGODB_URI) {
    const rawUri = process.env.MONGODB_URI;
    const queryIndex = rawUri.indexOf('?');
    if (queryIndex !== -1) {
      const base = rawUri.substring(0, queryIndex);
      const query = rawUri.substring(queryIndex);
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      const lastSlashIndex = cleanBase.lastIndexOf('/');
      const protocolIndex = cleanBase.indexOf('://');
      if (lastSlashIndex > protocolIndex + 2) {
        testUri = cleanBase.substring(0, lastSlashIndex) + '/disciplin-app-test' + query;
      } else {
        testUri = cleanBase + '/disciplin-app-test' + query;
      }
    } else {
      const cleanUri = rawUri.endsWith('/') ? rawUri.slice(0, -1) : rawUri;
      const lastSlashIndex = cleanUri.lastIndexOf('/');
      const protocolIndex = cleanUri.indexOf('://');
      if (lastSlashIndex > protocolIndex + 2) {
        testUri = cleanUri.substring(0, lastSlashIndex) + '/disciplin-app-test';
      } else {
        testUri = cleanUri + '/disciplin-app-test';
      }
    }
  }

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
