import { nextEnv } from '@/app/env';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		nextEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookies) {
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					for (const { name, value, options } of cookies) {
						response.cookies.set({
							name,
							value,
							...options,
						});
					}
				},
			},
		},
	);

	await supabase.auth.getUser();

	return response;
}
