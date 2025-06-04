import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(databaseURL);
export const db = drizzle(client);
