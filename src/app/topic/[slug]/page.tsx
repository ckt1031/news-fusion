import NewsList from '@/app/components/news/NewsList';
import TopicSelection from '@/app/components/news/TopicSelection';
import { RSS_CATEGORY } from '@/config/news-sources';
import { Suspense } from 'react';

export async function generateStaticParams() {
	return Object.values(RSS_CATEGORY).map((p) => ({
		slug: p,
	}));
}

export default function Page({ params }: { params: { slug: RSS_CATEGORY } }) {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const date = new Date().toISOString().split('T')[0]!;

	return (
		<>
			<TopicSelection topic={params.slug} />
			<Suspense fallback={<div>Loading...</div>}>
				<NewsList topic={params.slug} date={date} />
			</Suspense>
		</>
	);
}
