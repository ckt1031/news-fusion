import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import SkeletonNewsList from '../components/skeleton/news-list';
import { serverAuthState } from '../hooks/auth';
import { LOGIN_PATH } from '../utils/paths';
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

	if (!isLoggedIn || !user) redirect(LOGIN_PATH);

	return (
		<Suspense fallback={<SkeletonNewsList />}>
			<Component user={user} />
		</Suspense>
	);
}
