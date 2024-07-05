'use server';
'server only';

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
				setAll(cookies) {
					for (const { name, value, options } of cookies) {
						cookieStore.set({ name, value, ...options });
					}
				},
			},
		},
	);
}
