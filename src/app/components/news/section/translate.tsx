import { Button } from '@/app/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/app/components/ui/form';
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
import { useNewsStore } from '@/app/store/news';
import { zodResolver } from '@hookform/resolvers/zod';
import { Languages, Loader2, Undo2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
	TranslateActionSchema,
	supportedTargetLanguages,
} from '../actions/schema';
import { translateNewsInfo } from '../actions/translate';

interface Props {
	guid: string;
}

const TranslateActionFormSchema = TranslateActionSchema.pick({
	useLLM: true,
	targetLanguage: true,
});

export default function TranslateButton({ guid }: Props) {
	const { toast } = useToast();

	/**
	 * Form and Actions
	 */

	const form = useForm<z.infer<typeof TranslateActionFormSchema>>({
		resolver: zodResolver(TranslateActionFormSchema),
		defaultValues: {
			useLLM: false,
			targetLanguage: 'zh-tw',
		},
	});

	const { executeAsync: executeTranslate } = useAction(translateNewsInfo);

	/**
	 * State
	 */

	const translated = useNewsStore((state) => state.isItemTranslated(guid));
	const baseItem = useNewsStore((state) => state.getItem(guid));

	const setShowingItem = useNewsStore((state) => state.setShowingItem);

	const [isTranslating, setIsTranslating] = useState(false);

	const revertTranslation = async () => {
		setIsTranslating(true);

		// Wait for 500ms to ensure the title and summary are updated
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Revert the translation
		setShowingItem(guid, {
			title: baseItem.title,
			summary: baseItem.summary,
		});

		setIsTranslating(false);
	};

	const onTranslate = async (
		values: z.infer<typeof TranslateActionFormSchema>,
	) => {
		setIsTranslating(true);

		// Send the translation request
		const result = await executeTranslate({
			title: baseItem.title,
			summary: baseItem.summary,
			useLLM: values.useLLM,
			targetLanguage: values.targetLanguage,
		});
		setIsTranslating(false);

		if (!result?.data) return;

		setShowingItem(guid, {
			title: result.data.title,
			summary: result.data.summary,
		});

		toast({
			description: `"${baseItem.title}" has been translated to Chinese`,
		});
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost">
					<Languages className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onTranslate)}>
						{!translated && (
							<>
								<FormField
									control={form.control}
									name="useLLM"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center space-x-2 mb-3">
											<FormLabel htmlFor={field.name} className="mt-2">
												Use LLM
											</FormLabel>
											<FormControl>
												<Switch
													name={field.name}
													id={field.name}
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="targetLanguage"
									render={({ field }) => (
										<FormItem className="mb-4">
											<FormLabel htmlFor={field.name}>
												Target Language
											</FormLabel>
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
							</>
						)}
						<Button
							type={translated ? 'button' : 'submit'}
							className="w-full"
							disabled={isTranslating}
							onClick={translated ? revertTranslation : undefined}
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
					</form>
				</Form>
			</PopoverContent>
		</Popover>
	);
}
