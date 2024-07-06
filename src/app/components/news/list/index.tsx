import { NewsType } from '@/app/store/news';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import SkeletonCard from '../../skeleton/card';
import Content from './content';
import {
	type DateRange,
	type FetchNewsPageProps,
	fetchNewsForPage,
} from './fetch';
import AppInitializer from './initializer';

const ALLOWED_DAYS = 30;

const NewsInvalidDate = dynamic(() => import('./invalid-date'), {
	ssr: false,
	loading: () => <SkeletonCard />,
});

function isDateInAllowedDayRange(date: string | DateRange) {
	const currentDate = dayjs().format('YYYY-MM-DD');
	const dateToCheck = dayjs(typeof date === 'string' ? date : date.from).format(
		'YYYY-MM-DD',
	);

	return (
		dayjs(dateToCheck).isAfter(
			dayjs(currentDate).subtract(ALLOWED_DAYS, 'day'),
		) && dayjs(dateToCheck).isBefore(dayjs(currentDate).add(2, 'day')) // Timezone issue
	);
}

export default async function NewsList({ topic, date }: FetchNewsPageProps) {
	if (!isDateInAllowedDayRange(date)) {
		return (
			<div className="my-3">
				<NewsInvalidDate />
			</div>
		);
	}

	const sortedArticles = await fetchNewsForPage({ topic, date });

	return (
		<AppInitializer
			type={NewsType.News}
			news={sortedArticles}
			pageData={{ topic, date }}
		>
			<Content />
		</AppInitializer>
	);
}
