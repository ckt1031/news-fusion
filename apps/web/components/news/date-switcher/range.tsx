import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { useToast } from '@/components/ui/use-toast';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import queryString from 'query-string';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface RangeDateSelectProps {
	to?: string | null;
	from?: string | null;
	currentDate: dayjs.Dayjs;
}

export default function RangeDateSelect({
	to,
	from,
	currentDate,
}: RangeDateSelectProps) {
	const { toast } = useToast();

	const pathname = usePathname();
	const router = useRouter();

	const [date, setDate] = useState<DateRange>({
		// Dayjs subtracts 1 day from the current date
		from: from ? dayjs(from).toDate() : currentDate.subtract(1, 'day').toDate(),
		to: to ? dayjs(to).toDate() : currentDate.toDate(),
	});

	const getAllQueriesRequired = (range: DateRange) => {
		const { date, ...rest } = queryString.parse(location.search);

		return queryString.stringify({
			...rest,
			from: dayjs(range.from).format('YYYY-MM-DD'),
			to: dayjs(range.to).format('YYYY-MM-DD'),
		});
	};

	const onSelect = (range?: DateRange) => {
		if (!range) return;

		// Reject if the selected date is after the current date
		if (
			dayjs(range.to).isAfter(currentDate) ||
			dayjs(range.from).isAfter(currentDate)
		) {
			toast({
				description: `You can only view news on or before ${currentDate.format('YYYY-MM-DD')}`,
			});
			return;
		}

		setDate(range);

		router.push(`${pathname}?${getAllQueriesRequired(range)}`);
	};

	return <DatePickerWithRange date={date} onSelect={onSelect} />;
}
