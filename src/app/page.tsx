import { RSS_CATEGORY } from '@/config/news-sources';
import dayjs from 'dayjs';
import { Suspense } from 'react';
import LoadingComponent from './components/loading';
import DateSwitcher from './components/news/date-switcher';
import NewsList from './components/news/news-list';
import TopicSelection from './components/news/topic-selection';

export const runtime = 'nodejs';

export default function Home({
	searchParams,
}: { searchParams: { date?: string } }) {
	const serverCurrentDate = dayjs().format('YYYY-MM-DD');

	const queryDate = searchParams.date;

	const date = queryDate
		? dayjs(queryDate).format('YYYY-MM-DD')
		: serverCurrentDate;

	return (
		<>
			<DateSwitcher />
			<TopicSelection topic={RSS_CATEGORY.GENERAL} />
			<Suspense fallback={<LoadingComponent />}>
				<NewsList topic={RSS_CATEGORY.GENERAL} date={date} />
			</Suspense>
		</>
	);
}
