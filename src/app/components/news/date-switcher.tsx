'use client';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/app/components/ui/popover';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { useToast } from '../ui/use-toast';

export default function DateSwitcher() {
	const { toast } = useToast();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const clientCurrentDate = dayjs().format('YYYY-MM-DD');
	const queryDate = searchParams.get('date');
	const date = queryDate
		? dayjs(queryDate).format('YYYY-MM-DD')
		: clientCurrentDate;

	const isToday = queryDate === clientCurrentDate;

	const getAllQueriesRequired = (date: string) => {
		const all = queryString.parse(location.search);

		return queryString.stringify({
			...all,
			date,
		});
	};

	const switchToPreviousDate = () => {
		const _date = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');

		const getAllQueryParams = window.location.search;

		console.log(getAllQueryParams);

		router.push(`${pathname}?${getAllQueriesRequired(_date)}`);
	};

	const switchToNextDate = () => {
		const _date = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
		router.push(`${pathname}?${getAllQueriesRequired(_date)}`);
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
		<TooltipProvider>
			<div className="flex flex-row justify-between items-center py-2">
				<Tooltip>
					<TooltipTrigger>
						<Button variant="ghost" size="icon" onClick={switchToPreviousDate}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')}</p>
					</TooltipContent>
				</Tooltip>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost">{date}</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full">
						<Calendar
							mode="single"
							selected={new Date(date)}
							onSelect={setDate}
							className="rounded-md border"
						/>
					</PopoverContent>
				</Popover>

				<Tooltip>
					<TooltipTrigger>
						<Button
							variant="ghost"
							size="icon"
							disabled={!queryDate || isToday}
							onClick={switchToNextDate}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{isToday
								? 'No More!'
								: dayjs(date).add(1, 'day').format('YYYY-MM-DD')}
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
