'use server';

import { nextEnv } from '@/app/env';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
	const cookieStore = cookies();

	return createServerClient(
		nextEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
