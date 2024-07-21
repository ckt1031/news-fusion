import { createPool } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

const client = createPool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, {
	schema,
});
