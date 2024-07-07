'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { isArticleSimilar } from '@/lib/news/similarity';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { findSimilaritiesAction } from './actions';
import { similaritySchema } from './schema';

export default function SimilaritiesPageContentComponent() {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof similaritySchema>>({
		resolver: zodResolver(similaritySchema),
		defaultValues: {
			noSameDomain: false,
		},
	});

	const { isExecuting, executeAsync } = useAction(findSimilaritiesAction);

	const [result, setResult] = useState<Awaited<
		ReturnType<typeof isArticleSimilar>
	> | null>(null);

	const onSubmit = async (data: z.infer<typeof similaritySchema>) => {
		const result = await executeAsync(data);

		if (result?.serverError || result?.validationErrors || !result?.data) {
			toast({
				variant: 'destructive',
				description:
					result?.serverError ||
					'An error occurred while fetching similarities',
			});
			return;
		}

		setResult(result.data);
	};

	const SubmitButton = () => (
		<Button type="submit" disabled={isExecuting}>
			{isExecuting ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<Search className="mr-2 h-4 w-4" />
			)}
			Search DB
		</Button>
	);

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-3 mb-5 w-full"
				>
					<Tabs defaultValue="URL" className="flex flex-col items-center">
						<TabsList className="my-3">
							<TabsTrigger value="URL">URL</TabsTrigger>
							<TabsTrigger value="Content">Content</TabsTrigger>
						</TabsList>
						<TabsContent
							value="URL"
							className="flex flex-col w-full max-w-lg gap-4"
						>
							<FormField
								name="url"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Article link to compare</FormLabel>
										<FormControl>
											<Input placeholder="URL" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="noSameDomain"
								control={form.control}
								render={({ field }) => (
									<FormItem className="flex flex-row items-center space-x-2 mb-3">
										<FormLabel htmlFor={field.name} className="mt-2">
											Disable same domain
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
							<SubmitButton />
						</TabsContent>
						<TabsContent
							value="Content"
							className="flex flex-col w-full max-w-lg gap-3"
						>
							<FormField
								name="content"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor={field.name}>Content</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Paste content here" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<SubmitButton />
						</TabsContent>
					</Tabs>
				</form>
				<div className="flex flex-col gap-3 w-full justify-center items-center mt-3">
					{result?.result === false && (
						<div className="text-center">
							<p>No similar articles found</p>
						</div>
					)}
					{result?.result &&
						result.similarities.map((similarity) => (
							<Card key={similarity.url} className="w-full max-w-lg">
								<CardHeader>
									<CardTitle>
										<a href={similarity.url}>{similarity.name}</a>
									</CardTitle>
									<CardDescription>
										{Number(similarity.similarity.toFixed(3)) * 100}% similar
									</CardDescription>
								</CardHeader>
							</Card>
						))}
				</div>
			</Form>
		</>
	);
}
