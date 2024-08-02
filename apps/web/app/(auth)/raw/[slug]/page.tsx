import Content from '@/components/news/list/content';
import AppInitializer from '@/components/news/list/initializer';
import { NewsType } from '@/components/store/news';
import { parseRSS } from '@ckt1031/news';

interface PageProps {
	params: { slug: string };
}

export default async function RSSPage({ params }: PageProps) {
	const news = await parseRSS(decodeURIComponent(params.slug));

	const formattedNews = news.item.map((item) => {
		return {
			...item,
			publishedAt: new Date(item.pubDate),
			id: -1,
			category: '',
			url: item.link,
			publisher: news.title,
			similarArticles: [],
			summary: item.description ?? '',
			longSummary: null,
			thumbnail: null,
		};
	});

	return (
		<>
			<h1 className="text-3xl">{news.title}</h1>
			<AppInitializer
				type={NewsType.News}
				news={formattedNews}
				disableBookmark
				disableRegenerate
			>
				<Content />
			</AppInitializer>
		</>
	);
}
