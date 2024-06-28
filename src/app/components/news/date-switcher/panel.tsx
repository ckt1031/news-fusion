import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import RangeDateSelect from './range';
import SingleDateSelect from './single';

interface Props {
	rangeMode: boolean;
	setRangeMode: (rangeMode: boolean) => void;

	clientCurrentDate: string;
	date: string;
	to: string | null;
	from: string | null;
}

export default function DateSwitcherPanel({
	rangeMode,
	setRangeMode,
	clientCurrentDate,
	date,
	to,
	from,
}: Props) {
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
				<RangeDateSelect to={to} from={from} />
			) : (
				<SingleDateSelect clientCurrentDate={clientCurrentDate} date={date} />
			)}
		</>
	);
}
