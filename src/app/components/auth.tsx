'use server';

import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { authState } from '../hooks/auth';

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
	const { isLoggedIn } = await authState(false);

	if (!isLoggedIn && !reversed) {
		redirect('/auth/login');
	}

	return <>{children}</>;
}
