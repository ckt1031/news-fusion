import Content from '@/components/news/list/content';
import AppInitializer from '@/components/news/list/initializer';
import { NewsType } from '@/components/store/news';
import { ALL_RSS_CATEGORIES } from '@ckt1031/config';
import { parseRSS } from '@ckt1031/news';

interface PageProps {
	params: { rss: string };
}

export const dynamicParams = false;

export async function generateStaticParams() {
	const paths = ALL_RSS_CATEGORIES.map((category) => {
		return category.channels.map((channel) => {
			const url = typeof channel === 'string' ? channel : channel.url;

			return encodeURIComponent(url);
		});
	});

	return paths.flat().map((s) => ({
		slug: s,
	}));
}

// export const revalidate = 60 * 10;

export default async function RSSPage({ params }: PageProps) {
	const news = await parseRSS(decodeURIComponent(params.rss));

	const formattedNews = news.item.map((item) => {
		return {
			...item,
			publishedAt: new Date(item.pubDate),
			id: new Date(item.pubDate).getTime(),
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
