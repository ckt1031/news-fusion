import { createSafeActionClient } from 'next-safe-action';
import { createSupabaseServerClient } from './supabase/server';

// Base client
export const action = createSafeActionClient();

// Auth client
export const authActionClient = action.use(async ({ next }) => {
	const supabase = await createSupabaseServerClient();
	const user = await supabase.auth.getUser();

	if (!user.data || user.error) {
		throw new Error('User not found!');
	}

	return next({ ctx: { user: user.data } });
});
