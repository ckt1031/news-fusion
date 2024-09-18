import type { HomeSearchParamsProps } from '@/app/(news)/page';
import dayjs from 'dayjs';
import type { DateType } from '../components/news/list/fetch';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const currentDate = dayjs();
export const currentDateString = currentDate.format(DATE_FORMAT);

export function parseDateRange(searchParams: HomeSearchParamsProps) {
	let date: DateType | undefined = searchParams.date;

	if (searchParams.from && searchParams.to) {
		date = {
			from: searchParams.from,
			to: searchParams.to,
		};
	} else {
		const isDateValid = dayjs(date, DATE_FORMAT, true).isValid();

		// If date is invalid, set it to today (Server date)
		if (!isDateValid) date = currentDateString;
	}

	return date ? date : currentDateString;
}
