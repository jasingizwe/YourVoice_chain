import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL || undefined,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
