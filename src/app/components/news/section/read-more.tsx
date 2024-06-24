import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Props {
	url: string;
}

export default function ReadMore({ url }: Props) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Link
						href={url}
						passHref
						target="_blank"
						rel="noopener noreferrer"
						className="underline flex flex-row items-center mb-1"
					>
						<ExternalLink className="h-4 w-4 mr-2" />
						Read more
					</Link>
				</TooltipTrigger>
				<TooltipContent align="start">
					<p>{url}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
