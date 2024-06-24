'use client';

import { useNewsStore } from '@/app/store/news';
import NewsSection from '../section';
import ClearCache from './clear-cache';

interface ContentProps {
	isLoggedIn: boolean;
}

export default function Content({ isLoggedIn }: ContentProps) {
	const news = useNewsStore((state) => state.news);
	const pageData = useNewsStore((state) => state.pageData);

	return (
		<>
			<div className="flex flex-row justify-between items-center mb-1">
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					{news.length} articles found
				</p>
				{isLoggedIn && (
					<ClearCache
						date={pageData.date}
						topic={pageData.topic}
						from={pageData.from}
						to={pageData.to}
					/>
				)}
			</div>
			<div className="mb-4 flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
				{!news.length && (
					<p className="text-gray-500 dark:text-gray-400 text-center py-4">
						No news found for this topic and date
					</p>
				)}
				{news.map((article) => (
					<div key={article.guid} className="py-2 align-middle">
						<NewsSection guid={article.guid} isLoggedIn={isLoggedIn} />
					</div>
				))}
			</div>
		</>
	);
}
