import { createSupabaseServerClient } from '@/app/utils/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ResetPassword from './component';

export const runtime = 'edge';

const title = 'Reset Password';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
};

interface PageProps {
	searchParams: {
		code?: string;
	};
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
	const code = searchParams.code;

	if (!code) {
		redirect('/auth/login');
	}

	const supabase = await createSupabaseServerClient();
	await supabase.auth.exchangeCodeForSession(code);

	return <ResetPassword />;
}
