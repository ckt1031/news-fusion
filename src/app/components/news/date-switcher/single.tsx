import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import queryString from 'query-string';
import { Calendar } from '../../ui/calendar';
import { useToast } from '../../ui/use-toast';

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

		return queryString.stringify({
			...all,
			date,
		});
	};

	const setDate = (date: Date | undefined) => {
		if (!date) return;

		const _date = dayjs(date).format('YYYY-MM-DD');

		// If the selected Date is after the current date, reject it
		if (dayjs(_date).isAfter(clientCurrentDate)) {
			toast({
				description: `You can only view news on or before ${clientCurrentDate}`,
			});
			return;
		}

		// Only allow maximum of 25 days in the past
		if (dayjs(_date).isBefore(dayjs(clientCurrentDate).subtract(25, 'day'))) {
			toast({
				description: `You can only view news from ${dayjs(clientCurrentDate)
					.subtract(25, 'day')
					.format('YYYY-MM-DD')} onwards`,
			});
			return;
		}

		router.push(`${pathname}?${getAllQueriesRequired(_date)}`);
	};

	return (
		<Calendar
			mode="single"
			selected={new Date(date)}
			onSelect={setDate}
			className="rounded-md border"
		/>
	);
}
