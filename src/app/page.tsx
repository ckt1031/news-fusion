import { RSS_CATEGORY } from '@/config/news-sources';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { parseDateRange } from './components/news/get-date-server';
import NewsList from './components/news/list';
import SkeletonCard from './components/skeleton/card';
import SkeletonNewsList from './components/skeleton/news-list';

const TopicSelection = dynamic(
	() => import('./components/news/topic-selection'),
	{
		ssr: false,
		loading: () => <SkeletonCard className="my-1" />,
	},
);

const DateSwitcher = dynamic(() => import('./components/news/date-switcher'), {
	ssr: false,
	loading: () => <SkeletonCard className="my-1" />,
});

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
				<NewsList topic={RSS_CATEGORY.GENERAL} date={date} />
			</Suspense>
		</>
	);
}
