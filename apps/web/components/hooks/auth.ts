import { getGravatarUrl } from '@/utils/gravatar';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function serverAuthState() {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase.auth.getSession();

	if (error || !data?.session?.user) {
		return { user: null, isLoggedIn: false };
	}

	const user = data.session.user;

	const avatarURL = user?.email ? getGravatarUrl(user.email) : null;

	return {
		user: {
			...user,
			avatarURL,
		},
		isLoggedIn: true,
	};
}
