import { parseDateRange } from '@/components/news/get-date-server';
import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import { RSS_CATEGORY } from '@ckt1031/config';
import { Suspense } from 'react';

export interface HomeSearchParamsProps {
	date?: string;
	to?: string;
	from?: string;
}

interface PageProps {
	searchParams: HomeSearchParamsProps;
}

export const runtime = 'nodejs';

export default async function Home({ searchParams }: PageProps) {
	const date = parseDateRange(searchParams);

	return (
		<>
			<TopicSelection topic={RSS_CATEGORY.GENERAL} />
			<Suspense fallback={<SkeletonNewsList />}>
				<NewsList category={RSS_CATEGORY.GENERAL} date={date} />
			</Suspense>
		</>
	);
}
