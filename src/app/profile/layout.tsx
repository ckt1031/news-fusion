import Auth from '@/components/auth';
import { serverAuthState } from '@/components/hooks/auth';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { LOGIN_PATH } from '../utils/paths';

export default async function ToolLayout({ children }: PropsWithChildren) {
	const { isLoggedIn } = await serverAuthState();

	if (!isLoggedIn) redirect(LOGIN_PATH);

	return <Auth>{children}</Auth>;
}
