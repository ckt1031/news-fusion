import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { useNewsStore } from '@/app/store/news';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { currentDate } from '../get-date-server';
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
					to={(pageData.date as DateRange).to ?? currentDate}
					from={
						(pageData.date as DateRange).from ??
						dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD')
					}
				/>
			) : (
				<SingleDateSelect
					clientCurrentDate={currentDate}
					date={pageData.date.toString()}
				/>
			)}
			{(rangeMode || pageData.date !== currentDate) && (
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
