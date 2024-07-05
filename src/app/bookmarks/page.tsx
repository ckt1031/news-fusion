import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LoadingComponent from '../components/loading';
import { serverAuthState } from '../hooks/auth';
import Component from './content';

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

	return (
		<Suspense fallback={<LoadingComponent />}>
			<Component user={user} />
		</Suspense>
	);
}
