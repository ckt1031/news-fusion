import { useNewsStore } from '@/components/store/news';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import { currentDateString } from '../get-date-server';
import type { DateRange } from '../list/fetch';
import RangeDateSelect from './range';
import SingleDateSelect from './single';

interface Props {
	rangeMode: boolean;
	setRangeMode: (rangeMode: boolean) => void;
}

export default function DateSwitcherPanel({ rangeMode, setRangeMode }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const pageData = useNewsStore((state) => state.pageData);

	return (
		<>
			<div className="flex items-center space-x-2 mb-3">
				<Switch
					id="range-mode"
					checked={rangeMode}
					onCheckedChange={() => setRangeMode(!rangeMode)}
				/>
				<Label htmlFor="range-mode">Range Mode</Label>
			</div>
			{rangeMode ? (
				<RangeDateSelect
					currentDate={dayjs(currentDateString)}
					to={(pageData.date as DateRange).to ?? currentDateString}
					from={
						(pageData.date as DateRange).from ??
						dayjs(currentDateString).subtract(1, 'day').format('YYYY-MM-DD')
					}
				/>
			) : (
				<SingleDateSelect
					clientCurrentDate={currentDateString}
					date={pageData.date.toString()}
				/>
			)}
			{(rangeMode || pageData.date !== currentDateString) && (
				<Button
					onClick={() => {
						setRangeMode(false);
						router.push(pathname);
					}}
					className="w-full mt-2"
				>
					Reset Date
				</Button>
			)}
		</>
	);
}
