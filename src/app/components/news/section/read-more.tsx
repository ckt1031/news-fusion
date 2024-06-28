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
	const displayingURL = url.length > 25 ? `${url.slice(0, 25)}...` : url;

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
					<p>{displayingURL}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
