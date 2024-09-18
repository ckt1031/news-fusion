import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { currentDateString } from '@/utils/get-date-server';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import queryString from 'query-string';

interface Props {
	date: string;
	clientCurrentDate: string;
}

export default function SingleDateSelect({ clientCurrentDate, date }: Props) {
	const { toast } = useToast();

	const pathname = usePathname();
	const router = useRouter();

	const getAllQueriesRequired = (date: string) => {
		const { to, from, ...all } = queryString.parse(location.search);

		if (date === currentDateString) return '';

		const qs = queryString.stringify({
			...all,
			date,
		});

		return `?${qs}`;
	};

	const setDate = (date: Date | undefined) => {
		if (!date) return;

		const selectedDate = dayjs(date).format('YYYY-MM-DD');

		// If the selected Date is after the current date, reject it
		if (dayjs(selectedDate).isAfter(clientCurrentDate)) {
			toast({
				description: `You can only view news on or before ${clientCurrentDate}`,
			});
			return;
		}

		// Only allow maximum of 25 days in the past
		if (
			dayjs(selectedDate).isBefore(dayjs(clientCurrentDate).subtract(25, 'day'))
		) {
			toast({
				description: `You can only view news from ${dayjs(clientCurrentDate)
					.subtract(25, 'day')
					.format('YYYY-MM-DD')} onwards`,
			});
			return;
		}

		// @ts-ignore
		router.push(`${pathname}${getAllQueriesRequired(selectedDate)}`);
	};

	return (
		<Calendar
			mode="single"
			selected={new Date(date)}
			onSelect={setDate}
			className="rounded-md border"
			disabled={{
				after: new Date(clientCurrentDate),
				before: new Date(dayjs(clientCurrentDate).subtract(30, 'day').format()),
			}}
		/>
	);
}
