import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { nextServerEnv } from '../env/server';

export async function createSupabaseServerClient() {
	const cookieStore = cookies();

	return createServerClient(
		nextServerEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextServerEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}
