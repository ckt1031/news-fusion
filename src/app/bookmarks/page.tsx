import { serverAuthState } from '@/components/hooks/auth';
import SkeletonNewsList from '@/components/skeleton/news-list';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
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

export const runtime = 'nodejs';

export default async function BookmarksPage() {
	const { isLoggedIn, user } = await serverAuthState();

	if (!isLoggedIn || !user) redirect(LOGIN_PATH);

	return (
		<Suspense fallback={<SkeletonNewsList />}>
			<Component user={user} />
		</Suspense>
	);
}
