import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../sql/migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    create table if not exists schema_migrations (
      id serial primary key,
      filename text not null unique,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query('select filename from schema_migrations');
  return new Set(result.rows.map(row => row.filename));
}

async function applyMigration(filename, sql) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into schema_migrations (filename) values ($1)', [filename]);
    await client.query('commit');
    console.log(`Applied migration: ${filename}`);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

async function run() {
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found, skipping.');
    return;
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = fs
    .readdirSync(migrationsDir)
    .filter(name => name.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    await applyMigration(file, sql);
  }

  console.log('Migrations complete.');
}

run()
  .catch(err => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
