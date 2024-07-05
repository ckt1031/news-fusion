import { cn } from '@/app/utils/cn';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
	summary: string;
}

export default function BriefSummaryBox({ summary }: Props) {
	const [openBriefSummary, setOpenBriefSummary] = useState(false);

	return (
		<div className="mt-1 w-full max-w-3xl bg-gray-100 dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
			<button
				type="button"
				className="font-semibold"
				onClick={() => setOpenBriefSummary(!openBriefSummary)}
			>
				Brief Summary
				<ChevronRight
					className={cn(
						'w-4 h-4 inline-block ml-1',
						openBriefSummary ? 'transform rotate-90' : 'transform rotate-0',
					)}
				/>
			</button>
			{openBriefSummary && (
				<p className="font-mono w-full max-w-full mt-1 text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style">
					{summary}
				</p>
			)}
		</div>
	);
}
