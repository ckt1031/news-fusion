import { DatePickerWithRange } from '@/app/components/ui/date-picker-with-range';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import queryString from 'query-string';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useToast } from '../../ui/use-toast';

interface RangeDateSelectProps {
	to?: string | null;
	from?: string | null;
}

export default function RangeDateSelect({ to, from }: RangeDateSelectProps) {
	const { toast } = useToast();

	const pathname = usePathname();
	const router = useRouter();

	const [date, setDate] = useState<DateRange>({
		// Dayjs subtracts 1 day from the current date
		from: from ? dayjs(from).toDate() : dayjs().subtract(1, 'day').toDate(),
		to: to ? dayjs(to).toDate() : dayjs().toDate(),
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
			dayjs(range.to).isAfter(dayjs()) ||
			dayjs(range.from).isAfter(dayjs())
		) {
			toast({
				description: `You can only view news on or before ${dayjs().format('YYYY-MM-DD')}`,
			});
			return;
		}

		setDate(range);

		router.push(`${pathname}?${getAllQueriesRequired(range)}`);
	};

	return <DatePickerWithRange date={date} onSelect={onSelect} />;
}
