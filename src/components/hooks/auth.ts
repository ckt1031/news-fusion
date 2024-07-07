import { getGravatarUrl } from '../../app/utils/gravatar';
import { createSupabaseServerClient } from '../../app/utils/supabase/server';

export async function serverAuthState() {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		return { user: null, isLoggedIn: false };
	}

	const user = data.user;

	const avatarURL = user?.email ? getGravatarUrl(user.email) : null;

	return {
		user: {
			...user,
			avatarURL,
		},
		isLoggedIn: true,
	};
}
