import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '../utils/supabase/client';
import { createSupabaseServerClient } from '../utils/supabase/server';

export type UserState =
	| {
			user: null;
			isLoggedIn: false;
	  }
	| {
			user: User;
			isLoggedIn: true;
	  };

export async function authState(browser = false): Promise<UserState> {
	const supabase = await (browser
		? createSupabaseBrowserClient()
		: createSupabaseServerClient());

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		return { user: null, isLoggedIn: false };
	}

	return { user: data.user, isLoggedIn: true };
}
