import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z
    .string()
    .default(
      'http://localhost:5173,http://localhost:5174,http://localhost:5177',
    )
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),

  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  SESSION_JWT_SECRET: z.string(),
  SESSION_COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),

  R2_BUCKET_NAME: z.string(),
  R2_ENDPOINT: z.url(),
  R2_PUBLIC_URL: z.url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),

  EMAIL_API_KEY: z.string(),

  /// Second factor for admin-only routes, on top of "your email matches the
  /// configured admin address". A stolen session alone can't reach them.
  ADMIN_API_KEY: z.string().min(16),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
