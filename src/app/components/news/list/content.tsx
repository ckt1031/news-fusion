'use client';

import { useAuthStore } from '@/app/store/auth';
import { useNewsStore } from '@/app/store/news';
import NewsSection from '../section';
import NewsPageDropdownMenu from './menu';

export default function Content() {
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
	const news = useNewsStore((state) => state.news);

	return (
		<>
			<div className="flex flex-row items-center mb-1 gap-2 py-2">
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					{news.length} articles found
				</p>
				{isLoggedIn && <NewsPageDropdownMenu />}
			</div>
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
		</>
	);
}
