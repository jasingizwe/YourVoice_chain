import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  PINATA_JWT: process.env.PINATA_JWT ?? '',
  API_JSON_LIMIT: process.env.API_JSON_LIMIT ?? '512kb',
  API_FORM_LIMIT: process.env.API_FORM_LIMIT ?? '256kb',
  GLOBAL_RATE_WINDOW_MS: Number(process.env.GLOBAL_RATE_WINDOW_MS ?? 15 * 60 * 1000),
  GLOBAL_RATE_MAX: Number(process.env.GLOBAL_RATE_MAX ?? 300),
  AUTH_RATE_WINDOW_MS: Number(process.env.AUTH_RATE_WINDOW_MS ?? 15 * 60 * 1000),
  AUTH_RATE_MAX: Number(process.env.AUTH_RATE_MAX ?? 20),
  EVIDENCE_MAX_FILE_SIZE_MB: Number(process.env.EVIDENCE_MAX_FILE_SIZE_MB ?? 8),
  CORS_ALLOWLIST: (process.env.CORS_ALLOWLIST ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean),
  PASSWORD_MIN_LENGTH: Number(process.env.PASSWORD_MIN_LENGTH ?? 10),
};
