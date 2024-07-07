import { Button } from '@/app/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { useToast } from '@/app/components/ui/use-toast';
import { useAuthStore } from '@/app/store/auth';
import { useNewsStore } from '@/app/store/news';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IFuseOptions } from 'fuse.js';
import { Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import useLocalStorageState from 'use-local-storage-state';
import { z } from 'zod';
import { searchAction } from './actions';
import { SearchSchema } from './schema';

const FormSchema = SearchSchema.pick({
	searchQuery: true,
}).and(
	z.object({
		useReranker: z.boolean().optional(),
	}),
);

export default function NewsSearchingPopoverContent() {
	const { toast } = useToast();

	const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);

	const isBookmark = useNewsStore((state) => state.type === 'bookmarks');
	const pageData = useNewsStore((state) => state.pageData);

	const searchQuery = useNewsStore((state) => state?.pageData?.searchQuery);
	const [useReranker, setUseReranker] = useLocalStorageState(
		'news-search-reranker',
		{
			defaultValue: false,
		},
	);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			searchQuery,

			// Can be momorized
			useReranker: useReranker,
		},
	});

	const { executeAsync, isExecuting } = useAction(searchAction);

	const baseNews = useNewsStore((state) => state.news);

	const setDisplayingNews = useNewsStore((state) => state.setDisplayingNews);

	const setSearching = useNewsStore((state) => state.setSearching);

	const onFuzzyInputChange = async (data: z.infer<typeof FormSchema>) => {
		if (data.useReranker && isUserLoggedIn) {
			const results = await executeAsync({
				searchQuery: data.searchQuery,
				pageParams: location.search,
				isBookmark,
				topic: pageData.topic,
			});

			const response = results?.data;

			if (!response) {
				toast({
					variant: 'destructive',
					description: 'Failed to search',
				});
				return;
			}

			// Choose with index
			const indexes = response.map((result) => result.index);

			const items = baseNews.filter((_, index) => indexes.includes(index));

			setDisplayingNews(items);
			setSearching(data.searchQuery);

			return;
		}

		const options: IFuseOptions<(typeof baseNews)[0]> = {
			keys: ['guid', 'title', 'summary', 'url'],
			includeScore: true,
			threshold: 0.3,
		};

		// Lazy load Fuse
		const Fuse = (await import('fuse.js')).default;

		const fuse = new Fuse(baseNews, options);

		const results = fuse.search(data.searchQuery);

		const items = results.map((result) => result.item);

		setDisplayingNews(items);
		setSearching(data.searchQuery);
	};

	const resetSearch = () => {
		setSearching('');
		setDisplayingNews(baseNews);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onFuzzyInputChange)}
				className="flex flex-col gap-2"
			>
				<FormField
					control={form.control}
					name="searchQuery"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>Query</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Search something..." />
							</FormControl>
						</FormItem>
					)}
				/>
				{isUserLoggedIn && (
					<FormField
						control={form.control}
						name="useReranker"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between">
								<FormLabel htmlFor={field.name} className="mt-2">
									Use AI Re-Ranker
								</FormLabel>
								<FormControl>
									<Switch
										name={field.name}
										id={field.name}
										checked={field.value}
										onCheckedChange={(d) => {
											field.onChange(d);
											setUseReranker(d);
										}}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				)}
				<Button type="submit" className="w-full" disabled={isExecuting}>
					{isExecuting ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<span>Search</span>
					)}
				</Button>
				{searchQuery && searchQuery.length > 0 && (
					<Button
						variant="outline"
						type="button"
						className="w-full"
						onClick={resetSearch}
					>
						Reset Search
					</Button>
				)}
			</form>
		</Form>
	);
}
