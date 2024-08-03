'use client';

import { useNewsStore } from '@/components/store/news';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import queryString from 'query-string';
import { Suspense, useState } from 'react';
import LoadingComponent from '../../loading';
import { DATE_FORMAT } from '../get-date-server';

const DateSwitcherPanel = dynamic(() => import('./panel'), {
	loading: () => <LoadingComponent />,
});

type DateSwitcherProps = {
	currentDateString: string;
};

export default function DateSwitcher({ currentDateString }: DateSwitcherProps) {
	const pathname = usePathname();
	const router = useRouter();

	// Obtained from the client, it is validated DATE_FORMAT, in upper component
	// The target date to be used
	const date = useNewsStore((state) => state.pageData.date);

	const isToday = date === currentDateString;

	const [rangeMode, setRangeMode] = useState(typeof date !== 'string');

	const getAllQueriesRequired = (date: string) => {
		const { to, from, ...all } = queryString.parse(location.search);

		return queryString.stringify({
			...all,
			date,
		});
	};

	const switchToPreviousDate = () => {
		// Only date === string is allowed to be used here
		if (typeof date !== 'string') return;

		const newDateString = dayjs(date).subtract(1, 'day').format(DATE_FORMAT);

		// @ts-ignore
		router.push(`${pathname}?${getAllQueriesRequired(newDateString)}`);
	};

	const switchToNextDate = () => {
		// Only date === string is allowed to be used here
		if (typeof date !== 'string') return;

		const newDateString = dayjs(date).add(1, 'day').format(DATE_FORMAT);

		// @ts-ignore
		router.push(`${pathname}?${getAllQueriesRequired(newDateString)}`);
	};

	return (
		<TooltipProvider>
			<div className="flex flex-row justify-between items-center py-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={switchToPreviousDate}
							disabled={typeof date !== 'string'}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{dayjs(date as string)
								.subtract(1, 'day')
								.format(DATE_FORMAT)}
						</p>
					</TooltipContent>
				</Tooltip>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost">
							{typeof date === 'string' ? date : `${date.from} - ${date.to}`}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full">
						<Suspense fallback={<LoadingComponent />}>
							<DateSwitcherPanel
								rangeMode={rangeMode}
								setRangeMode={setRangeMode}
							/>
						</Suspense>
					</PopoverContent>
				</Popover>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={typeof date !== 'string' || isToday}
							onClick={switchToNextDate}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{dayjs(date as string)
								.add(1, 'day')
								.format(DATE_FORMAT)}
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
