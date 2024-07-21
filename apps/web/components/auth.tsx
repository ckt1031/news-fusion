'use server';

import { serverAuthState } from '@/components/hooks/auth';
import { LOGIN_PATH } from '@/utils/paths';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

interface Props {
	/**
	 * If `true`, the user must NOT be logged in to access the children.
	 */
	reversed?: boolean;
}

export default async function Auth({
	children,
	reversed,
}: PropsWithChildren<Props>) {
	const { isLoggedIn } = await serverAuthState();

	if (!isLoggedIn && !reversed) {
		redirect(LOGIN_PATH);
	}

	if (isLoggedIn && reversed) {
		redirect('/');
	}

	return <>{children}</>;
}
