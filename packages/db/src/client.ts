import { createPool } from '@vercel/postgres';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { drizzle as serverlessDrizzle } from 'drizzle-orm/vercel-postgres';
import { Client, Pool } from 'pg';
import * as schema from './schema';

const getDB = () => {
	const connectionString = process.env.DATABASE_URL;

	const isNextjsEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

	if (!connectionString) {
		throw new Error('DATABASE_URL is not set');
	}

	// Serverless (Edge, non-Node.js) runtime
	if (isNextjsEdgeRuntime && connectionString.includes('vercel')) {
		const client = createPool({ connectionString });

		return serverlessDrizzle(client, { schema });
	}

	const client = connectionString.includes('pooler')
		? new Pool({ connectionString })
		: new Client({ connectionString });

	return nodeDrizzle(client, { schema });
};

export const db = getDB();
