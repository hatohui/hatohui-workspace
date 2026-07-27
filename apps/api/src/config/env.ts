import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173,http://localhost:5174')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),

  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  SESSION_JWT_SECRET: z.string(),
  SESSION_COOKIE_DOMAIN: z.string().optional(),

  R2_BUCKET_NAME: z.string(),
  R2_ENDPOINT: z.url(),
  R2_PUBLIC_URL: z.url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),

  EMAIL_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
