import { Ratelimit } from '@upstash/ratelimit';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';
import { getMapCache, redis } from './utils/upstash';

const ratelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, '10 s'),
	analytics: true,
	prefix: '@upstash/ratelimit',
	ephemeralCache: getMapCache(),
	enableProtection: true,
});

export async function middleware(request: NextRequest) {
	const cfIp = request.headers.get('cf-connecting-ip');
	const ip = cfIp ?? request.ip ?? '127.0.0.1';

	// Check if the request is rate limited
	const { success } = await ratelimit.limit(ip);

	if (!success) {
		return new Response('Rate limit exceeded', { status: 429 });
	}

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
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
