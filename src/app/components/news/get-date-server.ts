import type { HomeSearchParamsProps } from '@/app/page';
import dayjs from 'dayjs';
import type { DateType } from './list/fetch';

export function parseDateRange(searchParams: HomeSearchParamsProps) {
	let date: DateType | undefined = searchParams.date;

	const FORMAT = 'YYYY-MM-DD';

	const serverCurrentDate = dayjs().format(FORMAT);

	if (searchParams.from && searchParams.to) {
		date = {
			from: searchParams.from,
			to: searchParams.to,
		};
	} else {
		const isDateValid = dayjs(date, FORMAT, true).isValid();

		// If date is invalid, set it to today (Server date)
		if (!isDateValid) date = serverCurrentDate;
	}

	return date ? date : serverCurrentDate;
}
