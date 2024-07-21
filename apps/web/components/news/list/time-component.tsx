import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import dayjs from 'dayjs';
import ago from 's-ago';

interface TimeComponentProps {
	className?: string;
	time: Date;
}

export default function TimeComponent({ className, time }: TimeComponentProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<p className={className}>{ago(time)}</p>
				</TooltipTrigger>
				<TooltipContent>
					<p>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
