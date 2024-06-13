import type { RSS_CATEGORY } from '@/config/news-sources';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import ago from 's-ago';

interface Props {
	topic: RSS_CATEGORY;
	date: string;
}

export default async function NewsList({ topic, date }: Props) {
	const articles = await getNewsBasedOnDateAndCategory(date, topic);
	const sortedArticles = articles.sort((a, b) => {
		return (
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
		);
	});

	return (
		<div className="mb-4 flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
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
							<p className="text-gray-400 dark:text-gray-500 text-sm text-nowrap">
								{ago(article.publishedAt)}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
