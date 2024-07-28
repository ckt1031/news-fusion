import { LOGIN_PATH } from '@/utils/paths';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export default async function AuthLayout({ children }: PropsWithChildren) {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) redirect(LOGIN_PATH);

	return <>{children}</>;
}
