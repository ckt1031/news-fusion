import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
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
					<p>{time.toLocaleString()}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
