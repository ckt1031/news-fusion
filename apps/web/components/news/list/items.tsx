import { useNewsStore } from '@/components/store/news';
import NewsSection from '../section';

export default function Items() {
	const news = useNewsStore((state) => state.displayingNews);

	return (
		<div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
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
}
