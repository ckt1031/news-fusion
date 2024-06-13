import { nextEnv } from '@/app/env';
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
	return createBrowserClient(
		nextEnv.NEXT_PUBLIC_SUPABASE_URL,
		nextEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
}
