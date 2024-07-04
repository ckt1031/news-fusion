import { nextServerEnv } from '@/app/utils/env/server';
import { clearUnusedDatabaseData } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get('authorization');

	if (
		nextServerEnv.CRON_SECRET &&
		authHeader !== `Bearer ${nextServerEnv.CRON_SECRET}`
	) {
		return new Response('Unauthorized', {
			status: 401,
		});
	}

	await clearUnusedDatabaseData();

	return Response.json({ success: true });
}
