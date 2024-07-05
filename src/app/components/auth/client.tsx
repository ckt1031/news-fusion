'use client';

import { useAuthStore } from '@/app/store/auth';
import type { User } from '@supabase/supabase-js';
import { type PropsWithChildren, useEffect } from 'react';

interface Props {
	isLoggedIn: boolean;
	user: User | null;
	avatarURL: string | null;
}

export default function AuthStateInializer({
	isLoggedIn,
	user,
	children,
	avatarURL,
}: PropsWithChildren<Props>) {
	const setUser = useAuthStore((state) => state.setUser);
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		user &&
			setUser({
				...user,
				avatarURL,
			});
		setLoggedIn(isLoggedIn);
	}, [user, isLoggedIn, avatarURL]);

	return children;
}
