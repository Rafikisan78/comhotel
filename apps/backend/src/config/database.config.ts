import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
  anonKey: process.env.SUPABASE_ANON_KEY,
}));
