import DateSwitcher from '@/components/news/date-switcher';
import { parseDateRange } from '@/components/news/get-date-server';
import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import { RSS_CATEGORY } from '@/config/news-sources';
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
			<DateSwitcher />
			<TopicSelection topic={RSS_CATEGORY.GENERAL} />
			<Suspense fallback={<SkeletonNewsList />}>
				<NewsList catagory={RSS_CATEGORY.GENERAL} date={date} />
			</Suspense>
		</>
	);
}
