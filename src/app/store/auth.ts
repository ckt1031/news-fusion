import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface ExtendedUser extends User {
	avatarURL: string | null;
}

export interface AuthStore {
	isLoggedIn: boolean;
	user?: ExtendedUser | null;

	setLoggedIn: (loggedIn: boolean) => void;
	setUser: (user: ExtendedUser) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isLoggedIn: false,
	setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setUser: (user) => set({ user }),
}));
