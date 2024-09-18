import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import { parseDateRange } from '@/utils/get-date-server';
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
