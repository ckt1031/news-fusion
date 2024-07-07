import { summarizeDetailAction } from '@/app/tools/summarize/actions';
import { useAuthStore } from '@/components/store/auth';
import {
	AlertDialogFooter,
	AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { readStreamableValue } from 'ai/rsc';
import { RotateCw, Trash2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { deleteSharedArticleAction } from './action';
import { useUIStore } from './store';

export default function SharePageControl() {
	const router = useRouter();
	const { isExecuting: isRegenerating, executeAsync: regenerate } = useAction(
		summarizeDetailAction,
	);
	const { isExecuting: isDeleting, executeAsync: deleteArticle } = useAction(
		deleteSharedArticleAction,
	);

	const user = useAuthStore((state) => state.user);

	const setLongSummary = useUIStore((state) => state.setLongSummary);

	const data = useUIStore((state) => state.data);

	if (!data) return null;

	const article = data.article;

	const onGenerateLongSummary = async () => {
		if (!user || user.id !== data.userId) return;

		const result = await regenerate({
			content: `Summarize ${article.url} in detail, including all the important information.`,
		});

		if (!result?.data) return;

		for await (const content of readStreamableValue(result.data.LLM)) {
			content && setLongSummary(content);
		}
	};

	const onDeleteSharedArticle = async () => {
		if (!user || user.id !== data.userId) return;

		const result = await deleteArticle({ id: data.id.toString() });

		if (!result?.data || !result?.data.success) return;

		router.push('/');
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
			<AlertDialog>
				<AlertDialogTrigger disabled={isDeleting} asChild>
					<Button variant="outline" disabled={isDeleting}>
						<Trash2 className="w-4 h-4" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							shared article and its data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							onClick={onDeleteSharedArticle}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
