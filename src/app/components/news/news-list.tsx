import getSHA256 from '@/app/utils/sha256';
import { redis } from '@/app/utils/upstash';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Article } from '@/db/schema';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import TimeComponent from './time-component';

interface Props {
	topic: RSS_CATEGORY;
	date: string;
}

async function fetchNews({ topic, date }: Props) {
	const cacheHash = getSHA256(`NEWS_${date}_${topic}`);

	const cache = await redis.get<Article[]>(cacheHash);

	if (cache) {
		return cache.map((article) => {
			return {
				...article,
				publishedAt: new Date(article.publishedAt),
			};
		});
	}

	const articles = await getNewsBasedOnDateAndCategory(date, topic);
	const sortedArticles = articles
		.sort((a, b) => {
			return (
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
			);
		})
		// Remove items with duplicated title
		.filter(
			(article, index, self) =>
				index ===
				self.findIndex(
					(t) => t.title.toLowerCase() === article.title.toLowerCase(),
				),
		)
		// Structure the data
		.map((article) => {
			return {
				id: article.id,
				title: article.title,
				url: article.url,
				publisher: article.publisher,
				publishedAt: article.publishedAt,
			};
		});

	await redis.set(cacheHash, sortedArticles);
	// 15 minutes
	await redis.expire(cacheHash, 60 * 15);

	return sortedArticles;
}

export default async function NewsList({ topic, date }: Props) {
	const sortedArticles = await fetchNews({ topic, date });

	return (
		<>
			<p className="text-gray-500 dark:text-gray-400 text-sm">
				{sortedArticles?.length} articles found
			</p>
			<div className="mb-4 flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
				{!sortedArticles?.length && (
					<p className="text-gray-500 dark:text-gray-400 text-center py-4">
						No news found for this topic and date
					</p>
				)}
				{sortedArticles?.map((article) => (
					<div key={article.id} className="py-2 align-middle">
						<div className="flex flex-col lg:flex-row justify-between lg:items-center">
							<div className="flex flex-col">
								<a
									className="text-gray-700 dark:text-gray-300 font-medium"
									href={article.url}
									target="_blank"
									rel="noreferrer"
								>
									{article.title}
								</a>
								<p className="text-gray-500 dark:text-gray-400 text-sm hidden lg:block">
									{article.publisher}
								</p>
							</div>
							<div className="flex flex-row gap-2 lg:flex-col lg:ml-2 items-center">
								<p className="text-gray-500 dark:text-gray-400 text-sm lg:hidden">
									{article.publisher}
								</p>
								<TimeComponent
									className="text-gray-400 dark:text-gray-500 text-sm text-nowrap"
									time={article.publishedAt}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
