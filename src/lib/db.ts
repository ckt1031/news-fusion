import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export function getDB(db: D1Database) {
	return drizzle(db, { schema });
}
