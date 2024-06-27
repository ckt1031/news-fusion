'use client';

import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
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
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { Suspense, useState } from 'react';
import LoadingComponent from '../../loading';

const Switch = dynamic(
	() => import('@/app/components/ui/switch').then((mod) => mod.Switch),
	{
		ssr: false,
	},
);
const RangeDateSelect = dynamic(() => import('./range'), {
	ssr: false,
});
const SingleDateSelect = dynamic(() => import('./single'), {
	ssr: false,
});

export default function DateSwitcher() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const clientCurrentDate = dayjs().format('YYYY-MM-DD');
	const queryDate = searchParams.get('date');
	const date = queryDate
		? dayjs(queryDate).format('YYYY-MM-DD')
		: clientCurrentDate;

	const [to, from] = [searchParams.get('to'), searchParams.get('from')];

	const [rangeMode, setRangeMode] = useState(!!(to && from));

	const isToday = queryDate === clientCurrentDate;

	const getAllQueriesRequired = (date: string) => {
		const { to, from, ...all } = queryString.parse(location.search);

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

	return (
		<TooltipProvider>
			<div className="flex flex-row justify-between items-center py-2">
				<Tooltip>
					<TooltipTrigger asChild>
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
						<Button variant="ghost">
							{to && from ? `${from} - ${to}` : date}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full">
						<Suspense fallback={<LoadingComponent />}>
							<div className="flex items-center space-x-2 mb-3">
								<Switch
									id="range-mode"
									checked={rangeMode}
									onCheckedChange={() => setRangeMode(!rangeMode)}
								/>
								<Label htmlFor="range-mode">Range Mode</Label>
							</div>
							{rangeMode ? (
								<RangeDateSelect to={to} from={from} />
							) : (
								<SingleDateSelect
									clientCurrentDate={clientCurrentDate}
									date={date}
								/>
							)}
						</Suspense>
					</PopoverContent>
				</Popover>

				<Tooltip>
					<TooltipTrigger asChild>
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
