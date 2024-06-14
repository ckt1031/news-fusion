import { authState } from '@/app/hooks/auth';
import { redis } from '@/app/utils/upstash';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Article } from '@/db/schema';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import getCacheKey from './actions/get-cache-key';
import NewsSection from './news-section';

interface Props {
	topic: RSS_CATEGORY;
	date: string;
}

export async function fetchNews({ topic, date }: Omit<Props, 'userStatus'>) {
	const cacheHash = getCacheKey(date, topic);
	const cache = await redis.get<Article[]>(cacheHash);

	if (cache) {
		return cache.map((article) => {
			return {
				...article,
				publishedAt: new Date(article.publishedAt),
			};
		});
	}

	const articles = await getNewsBasedOnDateAndCategory(date, topic, true);
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
				guid: article.guid,
				title: article.title,
				url: article.url,
				summary: article.summary,
				publisher: reWritePublisherName(article.publisher),
				publishedAt: article.publishedAt,
				similarArticles: article.similarArticles,
			};
		});

	function reWritePublisherName(publisher: string) {
		// Engadget is a web magazine with obsessive daily coverage of everything new in gadgets and consumer electronics
		// Too long, let's just use Engadget
		if (publisher.includes('Engadget')) {
			return 'Engadget';
		}
		// The Verge - All Posts -> The Verge
		if (publisher.includes('The Verge')) {
			return 'The Verge';
		}
		return publisher;
	}

	await redis.set(cacheHash, sortedArticles);
	// 15 minutes
	await redis.expire(cacheHash, 60 * 15);

	return sortedArticles;
}

export default async function NewsList({ topic, date }: Props) {
	const sortedArticles = await fetchNews({ topic, date });
	const { isLoggedIn } = await authState();

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
					<div key={article.guid} className="py-2 align-middle">
						<NewsSection
							article={article}
							date={date}
							topic={topic}
							isLoggedIn={isLoggedIn}
						/>
					</div>
				))}
			</div>
		</>
	);
}
