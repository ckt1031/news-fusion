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
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.user) {
				useAuthStore.setState({
					user: null,
					isLoggedIn: false,
				});
				return;
			}

			const user = session.user;

			const avatarURL = user.email ? getGravatarUrl(user.email) : null;

			useAuthStore.setState({
				user: {
					...user,
					avatarURL,
				},
				isLoggedIn: true,
			});
		},
		[supabase.auth.getSession],
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
