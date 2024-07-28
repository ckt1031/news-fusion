'use client';

import SkeletonSmallButtonIcon from '@/components/skeleton/button';
import { SkeletonSingleNews } from '@/components/skeleton/news-list';
import { useAuthStore } from '@/components/store/auth';
import { useNewsStore } from '@/components/store/news';
import dynamic from 'next/dynamic';

const NewsSection = dynamic(() => import('../section'), {
	loading: () => <SkeletonSingleNews />,
});
const NewsSearching = dynamic(() => import('../searching'), {
	loading: () => <SkeletonSmallButtonIcon />,
});
const NewsPageDropdownMenu = dynamic(() => import('./menu'), {
	loading: () => <SkeletonSmallButtonIcon />,
});

export default function Content() {
	const {
		type,
		displayingNews: news,
		loading,
	} = useNewsStore((state) => state);
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	const Section = () => (
		<div className="mb-4 flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
			{!news.length && (
				<p className="text-gray-500 dark:text-gray-400 text-center py-4">
					No news found for this topic and date
				</p>
			)}
			{news.map((article) => (
				<div key={article.guid} className="py-2 align-middle">
					<NewsSection guid={article.guid} />
				</div>
			))}
		</div>
	);

	return (
		<>
			<div className="flex flex-row items-center mb-1 gap-2 py-2">
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					{news.length} {type} found
				</p>
				<NewsSearching />
				{isLoggedIn && <NewsPageDropdownMenu />}
			</div>
			{!loading && <Section />}
		</>
	);
}
