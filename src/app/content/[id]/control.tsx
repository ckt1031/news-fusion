import { summarizeDetailAction } from '@/app/tools/summarize/actions';
import { useAuthStore } from '@/components/store/auth';
import { Button } from '@/components/ui/button';
import { readStreamableValue } from 'ai/rsc';
import { RotateCw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useUIStore } from './store';

export default function SharePageControl() {
	const { isExecuting: isRegenerating, executeAsync: regenerate } = useAction(
		summarizeDetailAction,
	);

	const user = useAuthStore((state) => state.user);

	const setLongSummary = useUIStore((state) => state.setLongSummary);

	const article = useUIStore((state) => state.data);

	if (!article) return null;

	const onGenerateLongSummary = async () => {
		if (!user) return;

		const result = await regenerate({
			content: `Summarize ${article.url} in detail, including all the important information.`,
		});

		if (!result?.data) return;

		for await (const content of readStreamableValue(result.data.LLM)) {
			content && setLongSummary(content);
		}
	};

	return (
		<div className="flex flex-row gap-3">
			<Button
				variant="outline"
				disabled={isRegenerating}
				onClick={onGenerateLongSummary}
			>
				<RotateCw className="w-4 h-4" />
			</Button>
		</div>
	);
}
