import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  CRON_SCHEDULE: z.string().default('* * * * *'),

  SLA_URGENT_HOURS: z.coerce.number().positive().default(2),
  SLA_HIGH_HOURS: z.coerce.number().positive().default(8),
  SLA_MEDIUM_HOURS: z.coerce.number().positive().default(24),
  SLA_LOW_HOURS: z.coerce.number().positive().default(72),
  SLA_WARNING_THRESHOLD: z.coerce.number().min(0).max(1).default(0.2),

  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment configuration:',
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
