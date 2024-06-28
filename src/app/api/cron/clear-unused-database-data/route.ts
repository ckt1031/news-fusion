import { nextEnv } from '@/app/env';
import { clearUnusedDatabaseData } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get('authorization');

	if (nextEnv.CRON_SECRET && authHeader !== `Bearer ${nextEnv.CRON_SECRET}`) {
		return new Response('Unauthorized', {
			status: 401,
		});
	}

	await clearUnusedDatabaseData();

	return Response.json({ success: true });
}
