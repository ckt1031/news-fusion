import { Button } from '@/app/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/app/components/ui/form';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/app/components/ui/popover';
import { Switch } from '@/app/components/ui/switch';
import { useToast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { generateShortSummary } from '../actions/generate-short-summary';
import { GenerateContentActionSchema } from '../actions/schema';

interface Props {
	guid: string;
}

export default function SummarizeButton({ guid }: Props) {
	const { toast } = useToast();

	/**
	 * Form and Actions
	 */

	const FormSchema = GenerateContentActionSchema.pick({
		generateSummary: true,
		generateTitle: true,
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			generateSummary: true,
			generateTitle: false,
		},
	});

	const { isExecuting, executeAsync } = useAction(generateShortSummary);

	const baseItem = useNewsStore((state) => state.getItem(guid));
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

			...values,
		});
		if (!result?.data) return;

		toast({
			description: `Content generated for "${baseItem.title}"`,
		});

		setDisplayingItem(guid, {
			...(values.generateSummary &&
				result.data.sumary && { summary: result.data.sumary }),
			...(values.generateTitle &&
				result.data.title && { title: result.data.title }),
		});
	};

	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="ghost">
					<RotateCw className="h-4 w-4" />
					<span className="ml-2 hidden lg:block">Generate</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onGenerateSummary)}>
						<FormField
							control={form.control}
							name="generateTitle"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center mb-3 justify-between">
									<FormLabel htmlFor={field.name} className="mt-2">
										Generate Title
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
							name="generateSummary"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center mb-3 justify-between">
									<FormLabel htmlFor={field.name} className="mt-2">
										Generate Summary
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

						<Button type="submit" className="w-full" disabled={isExecuting}>
							{isExecuting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span>Generate</span>
							)}
						</Button>
					</form>
				</Form>
			</PopoverContent>
		</Popover>
	);
}
