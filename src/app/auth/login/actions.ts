'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { action } from '@/app/utils/safe-action';
import { createSupabaseServerClient } from '@/app/utils/supabase/server';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { LoginActionSchema } from './schema';

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

		revalidatePath('/', 'layout');
		redirect('/');

		return { success: true };
	});
