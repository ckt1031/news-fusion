import { createSupabaseServerClient } from '../utils/supabase/server';

export async function serverAuthState() {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		return { user: null, isLoggedIn: false };
	}

	return { user: data.user, isLoggedIn: true };
}
