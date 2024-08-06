import { serverAuthState } from '@/components/hooks/auth';
import SkeletonNewsList from '@/components/skeleton/news-list';
import type { Metadata } from 'next';
import { Suspense } from 'react';
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

/**
 * Auth check is not required here because the user is already authenticated
 */

export default async function BookmarksPage() {
	const { user } = await serverAuthState();

	if (!user) return null;

	return (
		<Suspense fallback={<SkeletonNewsList />}>
			<Component user={user} />
		</Suspense>
	);
}
