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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, CircleSlash, Loader2, Search } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { checkImportanceAction } from './actions';
import { checkImportanceSchema } from './schema';

export default function CheckImportancePageContentComponent() {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof checkImportanceSchema>>({
		resolver: zodResolver(checkImportanceSchema),
	});

	const { isExecuting, executeAsync } = useAction(checkImportanceAction);

	const [result, setResult] = useState<boolean | null>(null);

	const onSubmit = async (data: z.infer<typeof checkImportanceSchema>) => {
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
			Check importance
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
										<FormLabel>Article link</FormLabel>
										<FormControl>
											<Input placeholder="URL" {...field} />
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
				<div className="flex flex-row gap-3 w-full justify-center items-center mt-3 font-bold">
					{result === true && (
						<>
							<CircleCheck className="h-6 w-6 text-green-500" />
							Important
						</>
					)}
					{result === false && (
						<>
							<CircleSlash className="h-6 w-6 text-red-500" />
							Un-important
						</>
					)}
				</div>
			</Form>
		</>
	);
}
