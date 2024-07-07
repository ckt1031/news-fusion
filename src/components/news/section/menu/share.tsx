import type { StartingSharePageProps } from '@/app/share/page';
import { SummarizeSchema } from '@/app/tools/summarize/schema';
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
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { encode } from 'js-base64';
import { ExternalLink, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import queryString from 'query-string';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { useUIStore } from './store';

interface Props {
	guid: string;
}

export function ShareButton() {
	const setDialog = useUIStore((state) => state.setDialog);

	const openDialog = () => {
		setDialog('share');
	};

	return (
		<DialogTrigger asChild>
			<DropdownMenuItem onClick={openDialog}>
				<Share className="h-4 w-4 mr-2" />
				AI Share
			</DropdownMenuItem>
		</DialogTrigger>
	);
}

export function ShareDialog({ guid }: Props) {
	// const { toast } = useToast();

	const router = useRouter();

	/**
	 * Form and Actions
	 */

	const form = useForm<z.infer<typeof SummarizeSchema>>({
		resolver: zodResolver(SummarizeSchema),
		defaultValues: {
			content: '',
			webSearch: false,
		},
	});

	// const { executeAsync, isExecuting } = useAction(summarizeDetailAction);

	// const setDialog = useUIStore((state) => state.setDialog);

	/**
	 * State
	 */

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const onSubmit = async (values: z.infer<typeof SummarizeSchema>) => {
		// Send the translation request
		// const result = await executeAsync({
		// 	content: `Summarize ${baseItem.url} in detail, including all the important information. ${values.content}`,
		// 	webSearch: values.webSearch,
		// });

		// if (!result?.data) return;

		// setDialog(null);
		const searchParams: StartingSharePageProps['searchParams'] = {
			articleId: baseItem.id.toString(),
			use_search: values.webSearch ? 1 : 0,
			custom_instructions: encodeURIComponent(encode(values.content)),
		};
		router.push(`/share?${queryString.stringify(searchParams)}`);
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Share and Generate Long Summary</DialogTitle>
			</DialogHeader>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-2"
				>
					<FormField
						control={form.control}
						name="webSearch"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center mb-3 justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Web Referencing
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
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor={field.name}>Custom Instructions</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Enter custom instructions" />
								</FormControl>
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full">
						<ExternalLink className="h-4 w-4 mr-2" />
						Submit
					</Button>
				</form>
			</Form>
		</DialogContent>
	);
}
