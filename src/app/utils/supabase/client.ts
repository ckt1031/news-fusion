import { createBrowserClient } from '@supabase/ssr';
import { nextClientEnv } from '../env/client';

export function createSupabaseBrowserClient() {
	return createBrowserClient(
		nextClientEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextClientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
}
