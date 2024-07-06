'use client';

import { Button } from '@/app/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/app/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ResetPasswordActionSchema = z
	.object({
		password: z.string(),
		pssswordConfirmation: z.string(),
	})
	.superRefine(({ pssswordConfirmation, password }, ctx) => {
		if (pssswordConfirmation !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'The passwords did not match',
				path: ['pssswordConfirmation'],
			});
		}
	});

export default function ResetPasswordComponent() {
	const { toast } = useToast();

	const [isReady, setIsReady] = useState(false);

	const supabase = createSupabaseBrowserClient();

	type FormValues = z.infer<typeof ResetPasswordActionSchema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(ResetPasswordActionSchema),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const {
			data: { subscription: authListener },
		} = supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'SIGNED_IN') setIsReady(true);
		});

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	const onPasswordSubmit = async ({ password }: FormValues) => {
		const { data } = await supabase.auth.updateUser({
			password,
		});

		if (!data) return;

		toast({
			description: 'Password updated successfully!',
		});
	};

	return (
		<Form {...form}>
			{isReady && (
				<form
					onSubmit={form.handleSubmit(onPasswordSubmit)}
					className="flex flex-col gap-3"
				>
					<FormField
						name="password"
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password:</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Type your password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						name="pssswordConfirmation"
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password Confirmation:</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Type your password again"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Reset Password</Button>
				</form>
			)}
		</Form>
	);
}
