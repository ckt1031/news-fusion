import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/app/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { useToast } from '@/app/components/ui/use-toast';
import { Languages, Loader2, Undo2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { supportedTargetLanguages } from './actions/schema';
import { translateNewsInfo } from './actions/translate';
import type { fetchNews } from './news-list';

interface Props {
	title: string;
	summary: string;
	article: Awaited<ReturnType<typeof fetchNews>>[0];
	setTitle: (title: string) => void;
	setSummary: (summary: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onActionError: (result: any) => boolean;
}

export default function TranslateButton({
	title,
	summary,
	article,
	onActionError,
	setTitle,
	setSummary,
}: Props) {
	const { toast } = useToast();

	const translated = article.title !== title;

	const { isExecuting: isTranslating, executeAsync: executeTranslate } =
		useAction(translateNewsInfo);

	const onTranslate = async () => {
		if (translated) {
			setTitle(article.title);
			setSummary(article.summary);
			return;
		}

		const result = await executeTranslate({
			title,
			summary: summary,
		});

		if (onActionError(result)) return;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setTitle(result?.data?.title!);
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setSummary(result?.data?.summary!);

		toast({
			description: `"${article.title}" has been translated to Chinese`,
		});
	};

	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="ghost">
					<Languages className="h-4 w-4 mr-2" />
					Translate
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start">
				{!translated && (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<Switch id="airplane-mode" />
							<Label htmlFor="airplane-mode">
								Use large language model (AI)
							</Label>
						</div>
						<Select defaultValue="zh-tw">
							<SelectTrigger className="w-full mb-2">
								<SelectValue placeholder="Select a language" />
							</SelectTrigger>
							<SelectContent>
								{supportedTargetLanguages.map((lang) => (
									<SelectItem key={lang} value={lang}>
										{lang}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</>
				)}
				<Button
					className="w-full"
					onClick={onTranslate}
					disabled={isTranslating}
				>
					{isTranslating ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : translated ? (
						<Undo2 className="h-4 w-4 mr-2" />
					) : (
						<Languages className="h-4 w-4 mr-2" />
					)}
					{translated ? 'Revert' : 'Translate'}
				</Button>
			</PopoverContent>
		</Popover>
	);
}
