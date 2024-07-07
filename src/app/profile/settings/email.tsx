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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
	email: z.string().email(),
});

export default function Email() {
	const { toast } = useToast();
	const user = useAuthStore((state) => state.user);
	// const setUser = useAuthStore((state) => state.setUser);

	type FormValues = z.infer<typeof Schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(Schema),
		defaultValues: {
			email: user?.email ?? '',
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (typeof user?.email === 'string') {
			form.setValue('email', user.email);
		}
	}, [user]);

	const supabase = createSupabaseBrowserClient();

	const onChangeDisplayName = async ({ email }: FormValues) => {
		if (!user) return;

		const { data, error } = await supabase.auth.updateUser({
			email,
		});

		if (data && !error) {
			// setUser(data.user);
			toast({
				description: 'Email update request sent',
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					This is your must-have key to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onChangeDisplayName)}
						className="flex flex-col md:flex-row gap-2"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} placeholder="user@example.com" />
									</FormControl>
									<FormMessage />
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
