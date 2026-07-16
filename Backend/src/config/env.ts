import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/disciplin-app'),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_me_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID: z.string().default(''),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    const isDefaultSecret = data.JWT_SECRET === 'super_secret_key_change_me_in_production';
    const isDefaultRefresh = data.JWT_REFRESH_SECRET === 'super_secret_refresh_key_change_me_in_production';
    return !isDefaultSecret && !isDefaultRefresh;
  }
  return true;
}, {
  message: 'Security Alert: You must change the default JWT_SECRET and JWT_REFRESH_SECRET in production!',
  path: ['JWT_SECRET'],
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
