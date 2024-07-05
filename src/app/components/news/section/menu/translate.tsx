import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/app/components/ui/dialog';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/app/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/app/components/ui/select';
import { useToast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { zodResolver } from '@hookform/resolvers/zod';
import { Languages, Loader2, Undo2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	TranslateActionSchema,
	supportedTargetLanguages,
} from '../../actions/schema';
import { translateNewsInfo } from '../../actions/translate';
import { useUIStore } from './store';

interface Props {
	guid: string;
}

const TranslateActionFormSchema = TranslateActionSchema.pick({
	targetLanguage: true,
	useCache: true,
}).and(
	z.object({
		immersive: z.boolean().optional(),
	}),
);

export function TranslateButton({ guid }: Props) {
	const setDialog = useUIStore((state) => state.setDialog);

	const openDialog = () => {
		setDialog('translate');
	};

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const setShowingItem = useNewsStore((state) => state.setShowingItem);

	const revertTranslation = async () => {
		// Revert the translation
		setShowingItem(guid, {
			title: baseItem.title,
			summary: baseItem.summary,
		});
	};

	const translated = useNewsStore((state) => state.isItemTranslated(guid));

	return translated ? (
		<DropdownMenuItem onClick={revertTranslation}>
			<Undo2 className="h-4 w-4 mr-2" />
			Revert Translation
		</DropdownMenuItem>
	) : (
		<DialogTrigger asChild>
			<DropdownMenuItem onClick={openDialog}>
				<Languages className="h-4 w-4 mr-2" />
				Translate
			</DropdownMenuItem>
		</DialogTrigger>
	);
}

export function TranslateDialog({ guid }: Props) {
	const { toast } = useToast();

	/**
	 * Form and Actions
	 */

	const form = useForm<z.infer<typeof TranslateActionFormSchema>>({
		resolver: zodResolver(TranslateActionFormSchema),
		defaultValues: {
			targetLanguage: 'zh-tw',
			useCache: true,
			immersive: false,
		},
	});

	const { executeAsync, isExecuting } = useAction(translateNewsInfo);

	/**
	 * State
	 */

	const translated = useNewsStore((state) => state.isItemTranslated(guid));
	const baseItem = useNewsStore((state) => state.getItem(guid));

	const setShowingItem = useNewsStore((state) => state.setShowingItem);

	const onTranslate = async (
		values: z.infer<typeof TranslateActionFormSchema>,
	) => {
		// Send the translation request
		const result = await executeAsync({
			title: baseItem.title,
			summary: baseItem.summary,
			targetLanguage: values.targetLanguage,
			useCache: values.useCache,
		});

		if (!result?.data) return;

		setShowingItem(guid, {
			title: result.data.title,
			summary: result.data.summary,
			immersiveTranslate: values.immersive,
		});

		toast({
			description: `"${baseItem.title}" has been translated to Chinese`,
		});
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Translate</DialogTitle>
			</DialogHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onTranslate)}>
					<FormField
						control={form.control}
						name="useCache"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center mb-3 justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Use Cache
								</FormLabel>
								<FormControl>
									<Checkbox
										name={field.name}
										id={field.name}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="immersive"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center mb-3 justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Immersive Experience
								</FormLabel>
								<FormControl>
									<Checkbox
										name={field.name}
										id={field.name}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="targetLanguage"
						render={({ field }) => (
							<FormItem className="mb-4">
								<FormLabel htmlFor={field.name}>Target Language</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full mb-2">
											<SelectValue placeholder="Select a language" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{supportedTargetLanguages.map((lang) => (
											<SelectItem key={lang} value={lang}>
												{lang}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type={translated ? 'button' : 'submit'}
						className="w-full"
						disabled={isExecuting}
					>
						{isExecuting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Languages className="h-4 w-4 mr-2" />
						)}
						Translate
					</Button>
				</form>
			</Form>
		</DialogContent>
	);
}
