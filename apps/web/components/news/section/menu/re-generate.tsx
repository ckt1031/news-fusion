import { useNewsStore } from '@/components/store/news';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { generateContent } from '../../actions/generate-short-summary';
import { GenerateContentActionSchema } from '../../actions/schema';
import LLMSelect from '../../llm-select';
import { useUIStore } from './store';

interface Props {
	guid: string;
}

export function RegenerateButton() {
	const setDialog = useUIStore((state) => state.setDialog);

	const openDialog = () => {
		setDialog('regenerate');
	};

	return (
		<DialogTrigger asChild>
			<DropdownMenuItem onClick={openDialog}>
				<RotateCw className="h-4 w-4 mr-2" />
				Re-Generate Content
			</DropdownMenuItem>
		</DialogTrigger>
	);
}

export function RegenerateDialog({ guid }: Props) {
	const { toast } = useToast();

	/**
	 * Form and Actions
	 */

	const FormSchema = GenerateContentActionSchema.pick({
		generateSummary: true,
		generateTitle: true,
	}).and(
		z.object({
			llmModel: z.string().optional(),
		}),
	);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			generateSummary: false,
			generateTitle: false,
		},
	});

	const { isExecuting, executeAsync } = useAction(generateContent);

	const baseItem = useNewsStore((state) => state.getItem(guid));
	const setItem = useNewsStore((state) => state.setItem);
	const setDisplayingItem = useNewsStore((state) => state.setShowingItem);

	const onGenerateSummary = async (values: z.infer<typeof FormSchema>) => {
		if (!values.generateSummary && !values.generateTitle) {
			toast({
				variant: 'destructive',
				description: 'Please select at least one option to generate',
			});
			return;
		}

		toast({
			description: `Generating summary for "${baseItem.title}"...`,
		});
		const result = await executeAsync({
			guid: baseItem.guid,
			url: baseItem.url,
			catagory: baseItem.category,

			...values,
		});
		if (!result?.data) return;

		toast({
			description: `Content generated for "${baseItem.title}"`,
		});

		const data = {
			...(values.generateSummary &&
				result.data.sumary && { summary: result.data.sumary }),
			...(values.generateTitle &&
				result.data.title && { title: result.data.title }),
		};

		setItem(guid, data);
		setDisplayingItem(guid, data);
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Re-Generate Content</DialogTitle>
			</DialogHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onGenerateSummary)}>
					<FormField
						control={form.control}
						name="generateTitle"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center mb-3 justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Title
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
						name="generateSummary"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center mb-3 justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Summary
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

					<LLMSelect formControl={form.control} />

					<Button type="submit" className="w-full mt-2" disabled={isExecuting}>
						{isExecuting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<span>Generate</span>
						)}
					</Button>
				</form>
			</Form>
		</DialogContent>
	);
}
