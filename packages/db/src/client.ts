import { createPool } from '@vercel/postgres';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { drizzle as serverlessDrizzle } from 'drizzle-orm/vercel-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const getDB = () => {
	const connectionString = process.env.DATABASE_URL;

	if (connectionString?.includes('vercel')) {
		const client = createPool({
			connectionString: process.env.DATABASE_URL,
		});

		return serverlessDrizzle(client, {
			schema,
		});
	}

	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	return nodeDrizzle(client, {
		schema,
	});
};

export const db = getDB();
