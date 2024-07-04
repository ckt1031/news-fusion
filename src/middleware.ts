import { updateSession } from '@/app/utils/supabase/middleware';
import { Ratelimit } from '@upstash/ratelimit';
import type { NextRequest } from 'next/server';
import { nextServerEnv } from './app/utils/env/server';
import { getMapCache, redis } from './app/utils/upstash';
import logging from './lib/console';

const ratelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, '10 s'),
	analytics: true,
	prefix: '@upstash/ratelimit',
	ephemeralCache: getMapCache(),
	enableProtection: true,
});

export default async function middleware(
	request: NextRequest,
): Promise<Response | undefined> {
	if (nextServerEnv.ENABLE_RATE_LIMIT === 'true') {
		const cfIp = request.headers.get('cf-connecting-ip');
		const ip = cfIp ?? request.ip ?? '127.0.0.1';

		// Check if the request is rate limited
		const result = await ratelimit.limit(ip);

		if (!result.success) {
			logging.error('Rate limit exceeded', { ip });

			return new Response('Rate limit exceeded', { status: 429 });
		}
	}

	// Update and write the session cookie, since server components can't write cookies
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|__nextjs_original-stack-frame|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
