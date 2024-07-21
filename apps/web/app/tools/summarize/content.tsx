'use client';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { readStreamableValue } from 'ai/rsc';
import { Copy, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import type { z } from 'zod';
import { summarizeDetailAction } from './actions';
import { SummarizeSchema, type WebSearchResult } from './schema';
import '@/styles/markdown.css';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Component() {
	const form = useForm<z.infer<typeof SummarizeSchema>>({
		resolver: zodResolver(SummarizeSchema),
	});

	const { isExecuting, executeAsync } = useAction(summarizeDetailAction);

	const [result, setResult] = useState<string>();
	const [webSearchResult, setWebSearchResult] = useState<WebSearchResult>();

	const onSubmit = async (data: z.infer<typeof SummarizeSchema>) => {
		setWebSearchResult(undefined);

		const result = await executeAsync({
			content: data.content,
			webSearch: data.webSearch,
		});

		if (!result?.data) return;

		setWebSearchResult(result.data.searchResults);

		for await (const content of readStreamableValue(result.data.LLM)) {
			setResult(content);
		}
	};

	const onCopy = () => {
		result && navigator.clipboard.writeText(result);
	};

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex my-3 w-full justify-center"
				>
					<div className="flex flex-col w-full max-w-xl gap-3">
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
						<FormField
							name="webSearch"
							control={form.control}
							render={({ field }) => (
								<FormItem className="flex flex-row items-center space-x-2">
									<FormLabel htmlFor={field.name} className="mt-2">
										Search on the web
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
						<Button type="submit" disabled={isExecuting}>
							{isExecuting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Search className="mr-2 h-4 w-4" />
							)}
							Summarize
						</Button>
					</div>
				</form>
			</Form>
			{result && (
				<div className="flex flex-col justify-center items-center mb-5 gap-3">
					<Accordion type="single" collapsible className="w-full max-w-xl">
						{webSearchResult && (
							<AccordionItem value="search-result">
								<AccordionTrigger>Search Results</AccordionTrigger>
								<AccordionContent>
									<ul>
										<li>
											<p>Query: {webSearchResult.query}</p>
										</li>
										{webSearchResult.urls.map((url) => (
											<li key={url}>
												URL: <span>{url}</span>
											</li>
										))}
									</ul>
								</AccordionContent>
							</AccordionItem>
						)}
						<AccordionItem value="result">
							<AccordionTrigger>Response</AccordionTrigger>
							<AccordionContent>
								<TooltipProvider>
									<div className="mt-3 flex flex-col w-full">
										<Markdown className="text-gray-600 dark:text-gray-400 prose prose-neutral markdown-style max-w-full">
											{result}
										</Markdown>
										<div className="flex flex-row gap-2 mt-2 flex-wrap">
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														type="button"
														onClick={onCopy}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Copy to clipboard</p>
												</TooltipContent>
											</Tooltip>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														type="button"
														disabled={isExecuting}
														onClick={form.handleSubmit(onSubmit)}
													>
														<RefreshCcw className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Re-genereate</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								</TooltipProvider>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			)}
		</>
	);
}
