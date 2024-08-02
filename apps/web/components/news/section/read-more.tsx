import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';

type PropsUsingURL = {
	url: string;
};

type PropsUsingID = {
	id: number;
};

type Props = PropsUsingURL | PropsUsingID;

export default function ReadMore(props: Props) {
	if ('url' in props) {
		const { url } = props;
		const displayingURL = url.length > 25 ? `${url.slice(0, 25)}...` : url;

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="underline flex flex-row items-center mb-1"
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							Full Article
						</a>
					</TooltipTrigger>
					<TooltipContent align="start">
						<p>{displayingURL}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	const { id } = props;

	return (
		<a
			href={`/article/${id}`}
			target="_blank"
			rel="noopener noreferrer"
			className="underline flex flex-row items-center mb-1"
		>
			<ExternalLink className="h-4 w-4 mr-2" />
			Details
		</a>
	);
}
