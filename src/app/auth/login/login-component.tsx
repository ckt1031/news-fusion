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
import { cn } from '@/app/utils/cn';
import { nextClientEnv } from '@/app/utils/env/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { forgotPassword, login } from './actions';
import { ForgotPasswordActionSchema, LoginActionSchema } from './schema';

export default function LoginPageComponent() {
	const { theme } = useTheme();
	const { toast } = useToast();
	const ref = useRef<TurnstileInstance>();

	const [authMode, setAuthMode] = useState<'login' | 'forgot-password'>(
		'login',
	);

	const isLogin = authMode === 'login';

	type FormValues = z.infer<typeof LoginActionSchema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(
			isLogin ? LoginActionSchema : ForgotPasswordActionSchema,
		),
	});

	const { isExecuting, executeAsync } = useAction(
		isLogin ? login : forgotPassword,
	);

	const onLogin = async (data: FormValues) => {
		const captchaToken = await ref.current?.getResponsePromise();
		if (!captchaToken && nextClientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
			toast({
				description: 'Please complete the captcha challenge first',
			});
			return;
		}

		const status = await executeAsync({
			...data,
			captchaToken,
		});

		if (!status) return;

		if (status.data && !status.data.success) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: status.data.error,
			});

			// Reset the form and captcha token
			ref.current?.reset();
		}

		if (!isLogin && status.data?.success) {
			toast({
				title: 'Success',
				description: 'Check your email for further instructions',
			});
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onLogin)}
				className="flex flex-col gap-4 py-6"
			>
				<h3 className="text-2xl font-bold">
					{isLogin
						? 'Log in to access the private features'
						: 'Forgot your password?'}
				</h3>

				<FormField
					name="email"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email:</FormLabel>
							<FormControl>
								<Input type="email" placeholder="user@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isLogin && (
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
				)}

				<button
					type="button"
					className="self-start italic underline"
					onClick={() => setAuthMode(isLogin ? 'forgot-password' : 'login')}
				>
					{isLogin ? 'Forgot your password?' : 'Back to log in'}
				</button>

				{nextClientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
					<Turnstile
						ref={ref}
						siteKey={nextClientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
						options={{
							theme:
								theme === 'dark'
									? 'dark'
									: theme === 'system'
										? 'auto'
										: 'light',
						}}
					/>
				)}

				<Button type="submit" disabled={isExecuting}>
					<Loader2
						className={cn(
							'mr-2 h-4 w-4 animate-spin',
							!isExecuting && 'hidden',
						)}
					/>
					{isLogin ? 'Log in' : 'Send reset email'}
				</Button>
			</form>
		</Form>
	);
}
