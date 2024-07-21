'use client';

import { useAuthStore } from '@/components/store/auth';
import { getGravatarUrl } from '@/utils/gravatar';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { type PropsWithChildren, useCallback, useEffect } from 'react';

export default function AuthStateInializer({ children }: PropsWithChildren) {
	const supabase = createSupabaseBrowserClient();

	const fetchUser = useCallback(
		async (isSubscribed: boolean) => {
			if (!isSubscribed) return;

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				useAuthStore.setState({
					user: null,
					isLoggedIn: false,
				});
				return;
			}

			const avatarURL = user.email ? getGravatarUrl(user.email) : null;

			useAuthStore.setState({
				user: {
					...user,
					avatarURL,
				},
				isLoggedIn: true,
			});
		},
		[supabase.auth.getUser],
	);

	useEffect(() => {
		let isSubscribed = true;

		fetchUser(isSubscribed);

		// cancel any future `setData`
		return () => {
			isSubscribed = false;
		};
	}, [fetchUser]);

	return children;
}
