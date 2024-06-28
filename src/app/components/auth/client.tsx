'use client';

import { useAuthStore } from '@/app/store/auth';
import type { User } from '@supabase/supabase-js';
import { type PropsWithChildren, useEffect } from 'react';

interface Props {
	isLoggedIn: boolean;
	user: User | null;
}

export default function AuthStateInializer({
	isLoggedIn,
	user,
	children,
}: PropsWithChildren<Props>) {
	const setUser = useAuthStore((state) => state.setUser);
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

	useEffect(() => {
		user && setUser(user);
		setLoggedIn(isLoggedIn);
	}, [setLoggedIn, setUser, user, isLoggedIn]);

	return children;
}
