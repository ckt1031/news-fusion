'use client';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useToast } from '@/app/components/ui/use-toast';
import { nextEnv } from '@/app/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { login } from './actions';
import { LoginActionSchema } from './schema';

export default function LoginPage() {
	const { theme } = useTheme();
	const { toast } = useToast();
	const ref = useRef<TurnstileInstance>();
	const [captchaToken, setCaptchaToken] = useState<string>();
	const { register, handleSubmit } = useForm<z.infer<typeof LoginActionSchema>>(
		{
			resolver: zodResolver(LoginActionSchema),
		},
	);

	return (
		<form
			onSubmit={handleSubmit(async (data) => {
				if (!captchaToken && nextEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
					toast({
						description: 'Please complete the captcha challenge first',
					});
					return;
				}

				const status = await login({
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
					ref.current?.reset();
					setCaptchaToken(undefined);
				}
			})}
			className="flex flex-col gap-4 py-6"
		>
			<h3 className="text-2xl font-bold">
				Log in to access the private features
			</h3>
			<Label htmlFor="email">Email:</Label>
			<Input
				placeholder="Type your email"
				aria-required
				id="email"
				type="email"
				required
				{...register('email')}
			/>
			<Label htmlFor="password">Password:</Label>
			<Input
				placeholder="Type your password"
				aria-required
				id="password"
				type="password"
				required
				{...register('password')}
			/>
			{nextEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
				<Turnstile
					ref={ref}
					siteKey={nextEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
					onSuccess={setCaptchaToken}
					options={{
						theme:
							theme === 'dark' ? 'dark' : theme === 'system' ? 'auto' : 'light',
					}}
				/>
			)}

			<Button type="submit">Log in</Button>
		</form>
	);
}
