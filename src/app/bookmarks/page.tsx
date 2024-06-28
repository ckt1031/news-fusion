import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { serverAuthState } from '../hooks/auth';
import Component from './content';

export const runtime = 'nodejs';

const title = 'Bookmarks';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
	twitter: {
		title,
	},
};

export default async function BookmarksPage() {
	const { isLoggedIn, user } = await serverAuthState();

	if (!isLoggedIn || !user) {
		redirect('/auth/login');
	}

	return <Component user={user} />;
}
