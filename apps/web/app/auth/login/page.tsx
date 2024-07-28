import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginPageComponent from './login-component';

const title = 'Login';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
};

export default async function Login() {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase.auth.getUser();

	if (!error && data?.user) {
		redirect('/');
	}

	return <LoginPageComponent />;
}

export const runtime = 'edge';
