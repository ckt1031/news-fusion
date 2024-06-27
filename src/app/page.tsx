import { RSS_CATEGORY } from '@/config/news-sources';
import dayjs from 'dayjs';
import DateSwitcher from './components/news/date-switcher';
import NewsList from './components/news/list';
import TopicSelection from './components/news/topic-selection';

export const runtime = 'nodejs';

export interface HomeSearchParamsProps {
	date?: string;
	to?: string;
	from?: string;
}

interface PageProps {
	searchParams: HomeSearchParamsProps;
}

export default function Home({ searchParams }: PageProps) {
	const serverCurrentDate = dayjs().format('YYYY-MM-DD');

	const queryDate = searchParams.date;

	const date = queryDate
		? dayjs(queryDate).format('YYYY-MM-DD')
		: serverCurrentDate;

	return (
		<>
			<DateSwitcher />
			<TopicSelection topic={RSS_CATEGORY.GENERAL} />
			<NewsList
				topic={RSS_CATEGORY.GENERAL}
				date={date}
				from={searchParams.from}
				to={searchParams.to}
			/>
		</>
	);
}
