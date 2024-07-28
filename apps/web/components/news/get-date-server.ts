import type { HomeSearchParamsProps } from '@/app/(news)/page';
import dayjs from 'dayjs';
import type { DateType } from './list/fetch';

const FORMAT = 'YYYY-MM-DD';

export const currentDate = dayjs().format(FORMAT);

export function parseDateRange(searchParams: HomeSearchParamsProps) {
	let date: DateType | undefined = searchParams.date;

	if (searchParams.from && searchParams.to) {
		date = {
			from: searchParams.from,
			to: searchParams.to,
		};
	} else {
		const isDateValid = dayjs(date, FORMAT, true).isValid();

		// If date is invalid, set it to today (Server date)
		if (!isDateValid) date = currentDate;
	}

	return date ? date : currentDate;
}
