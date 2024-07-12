'use server';

import { redirect } from 'next/navigation';

import { nextServerEnv } from '@/app/utils/env/server';
import { action } from '@/app/utils/safe-action';
import { createSupabaseServerClient } from '@/app/utils/supabase/server';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { ForgotPasswordActionSchema, LoginActionSchema } from './schema';

export const login = action
	.schema(LoginActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const supabase = await createSupabaseServerClient();

		const data: SignInWithPasswordCredentials = {
			email: formData.email,
			password: formData.password,
			options: {
				captchaToken: formData.captchaToken,
			},
		};

		const { error } = await supabase.auth.signInWithPassword(data);

		if (error) {
			return { success: false, error: error.message };
		}

		redirect('/');
	});

export const forgotPassword = action
	.schema(ForgotPasswordActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const supabase = await createSupabaseServerClient();

		const { error } = await supabase.auth.resetPasswordForEmail(
			formData.email,
			{
				redirectTo: `${nextServerEnv.SITE_URL}/auth/reset-password`,
				captchaToken: formData.captchaToken,
			},
		);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true };
	});
