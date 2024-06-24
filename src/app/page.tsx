import { RSS_CATEGORY } from '@/config/news-sources';
import dayjs from 'dayjs';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingComponent from './components/loading';
import DateSwitcher from './components/news/date-switcher';
import NewsList from './components/news/list';
import TopicSelection from './components/news/topic-selection';

export const runtime = 'nodejs';

const title = 'AI News';
const description = 'Hassle-free news reading experience';

export const metadata: Metadata = {
	title: 'AI News',
	description: 'Hassle-free news reading experience',
	openGraph: {
		title,
		description,
	},
	twitter: {
		title,
		description,
		creator: '@cktsun1031',
	},
};

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
