'use server';
'server only';

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { nextServerEnv } from '../env/server';

export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		nextServerEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextServerEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
