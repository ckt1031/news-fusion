import { TranslateActionSchema } from '@/components/news/actions/schema';
import { translateNewsInfo } from '@/components/news/actions/translate';
import LLMSelect from '@/components/news/llm-select';
import { useNewsStore } from '@/components/store/news';
import { Button } from '@/components/ui/button';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { TargetLanguageToLLM } from '@ckt1031/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Languages, Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import useLocalStorageState from 'use-local-storage-state';
import { z } from 'zod';

interface Props {
	guid: string;
}

const TranslateActionFormSchema = TranslateActionSchema.pick({
	targetLanguage: true,
	useCache: true,
	llmModel: true,
}).and(
	z.object({
		immersive: z.boolean().optional(),
	}),
);

type FormValues = z.infer<typeof TranslateActionFormSchema>;

export default function TranslateDialog({ guid }: Props) {
	const { toast } = useToast();

	/**
	 * Form and Actions
	 */

	const [immersive, setImmersive] = useLocalStorageState(
		'translate-immersive',
		{
			defaultValue: false,
		},
	);

	const [model, setModel] = useLocalStorageState<FormValues['llmModel']>(
		'translate-llm-model',
		{
			defaultValue: 'gpt-4o-mini',
		},
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(TranslateActionFormSchema),
		defaultValues: {
			targetLanguage: 'zh-tw',
			useCache: true,
			immersive,
			llmModel: model,
		},
	});

	const { executeAsync, isExecuting } = useAction(translateNewsInfo);

	/**
	 * State
	 */

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const setShowingItem = useNewsStore((state) => state.setShowingItem);

	const onTranslate = async (values: FormValues) => {
		// Send the translation request
		const result = await executeAsync({
			title: baseItem.title,
			summary: baseItem.summary,
			targetLanguage: values.targetLanguage,
			useCache: values.useCache,
			llmModel: values.llmModel,
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
									<Switch
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
									<Switch
										name={field.name}
										id={field.name}
										checked={field.value}
										onCheckedChange={(d) => {
											field.onChange(d);
											setImmersive(d);
										}}
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
										{Object.keys(TargetLanguageToLLM).map((lang) => (
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

					<LLMSelect formControl={form.control} onAdditionalChange={setModel} />

					<Button type="submit" className="w-full" disabled={isExecuting}>
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
