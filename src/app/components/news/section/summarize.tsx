import { Button } from '@/app/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { useToast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { Loader2, RotateCw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { reGenerateSummary } from '../actions/re-generate-summary';

interface Props {
	guid: string;
}

export default function SummarizeButton({ guid }: Props) {
	const { toast } = useToast();

	const { isExecuting, executeAsync } = useAction(reGenerateSummary);

	const pageData = useNewsStore((state) => state.pageData);
	const baseItem = useNewsStore((state) => state.getItem(guid));
	const setDisplayingItem = useNewsStore((state) => state.setShowingItem);

	const onGenerateSummary = async () => {
		toast({
			description: `Generating summary for "${baseItem.title}"...`,
		});
		const result = await executeAsync({
			guid: baseItem.guid,
			url: baseItem.url,
			date: pageData.date,
			topic: pageData.topic,
		});
		if (!result?.data) return;

		toast({
			description: `Summary generated for "${baseItem.title}"`,
		});

		setDisplayingItem(guid, {
			summary: result.data,
		});
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						onClick={onGenerateSummary}
						disabled={isExecuting}
					>
						{isExecuting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<RotateCw className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Generate summary</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
