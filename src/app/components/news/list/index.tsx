import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import dayjs from 'dayjs';
import { ShieldX } from 'lucide-react';
import { Suspense } from 'react';
import type { DateRange } from 'react-day-picker';
import LoadingComponent from '../../loading';
import Content from './content';
import { type FetchNewsPageProps, fetchNewsForPage } from './fetch';
import AppInitializer from './initializer';

const ALLOWED_DAYS = 30;

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

export default async function NewsList({
	topic,
	date,
	from,
	to,
}: FetchNewsPageProps) {
	if (!isDateInAllowedDayRange(date)) {
		return (
			<Card className="my-3">
				<CardHeader>
					<CardTitle className="flex flex-row gap-2">
						<ShieldX className="w-6 h-6" />
						Invalid Date
					</CardTitle>
					<CardDescription>
						You can only view news from the past 30 days
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const sortedArticles = await fetchNewsForPage({ topic, date, from, to });

	return (
		<Suspense fallback={<LoadingComponent />}>
			<AppInitializer
				news={sortedArticles}
				pageData={{ topic, date, from, to }}
			>
				<Content />
			</AppInitializer>
		</Suspense>
	);
}
