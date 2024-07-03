'use client';

import { Button } from '@/app/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/app/components/ui/use-toast';
import { useAuthStore } from '@/app/store/auth';
import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
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

	const form = useForm<z.infer<typeof Schema>>({
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

	const onChangeDisplayName = async ({ email }: z.infer<typeof Schema>) => {
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
