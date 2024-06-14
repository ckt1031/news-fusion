import { RSS_CATEGORY } from '@/config/news-sources';
import { Suspense } from 'react';
import NewsList from './components/news/news-list';
import TopicSelection from './components/news/topic-selection';

export default function Home() {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const date = new Date().toISOString().split('T')[0]!;

	return (
		<>
			<TopicSelection topic={RSS_CATEGORY.GENERAL} />
			<Suspense fallback={<div>Loading...</div>}>
				<NewsList topic={RSS_CATEGORY.GENERAL} date={date} />
			</Suspense>
		</>
	);
}
