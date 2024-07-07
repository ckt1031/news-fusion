'use client';

import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
import { useAuthStore } from '@/components/store/auth';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
	displayName: z.string().min(3).max(30),
});

export default function DisplayName() {
	const { toast } = useToast();
	const user = useAuthStore((state) => state.user);
	const setUser = useAuthStore((state) => state.setUser);

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			displayName: user?.user_metadata?.displayName ?? '',
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (typeof user?.user_metadata?.displayName === 'string') {
			form.setValue('displayName', user?.user_metadata?.displayName);
		}
	}, [user]);

	const supabase = createSupabaseBrowserClient();

	const onChangeDisplayName = async ({
		displayName,
	}: z.infer<typeof Schema>) => {
		if (!user || user?.user_metadata?.displayName === displayName) return;

		const { data, error } = await supabase.auth.updateUser({
			// email: user.email,
			data: {
				...user.user_metadata,
				displayName,
			},
		});

		if (data && !error) {
			setUser({
				...user,
				...data.user,
			});
			toast({
				description: 'Display name updated',
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Display Name</CardTitle>
				<CardDescription>Change your display name</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onChangeDisplayName)}
						className="flex flex-col md:flex-row gap-2"
					>
						<FormField
							control={form.control}
							name="displayName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} placeholder="Enter your display name" />
									</FormControl>
								</FormItem>
							)}
						/>
						<Button type="submit">
							<span>Update</span>
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
