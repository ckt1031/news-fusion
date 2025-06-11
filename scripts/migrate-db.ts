import 'dotenv/config';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../db/index.js';

const migrationsFolder = join(__dirname, '../db/migrations');

await migrate(db, { migrationsFolder });

console.log('✅ Database migrated successfully.');

process.exit(0);
