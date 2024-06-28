import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

export interface AuthStore {
	isLoggedIn: boolean;
	user?: User | null;

	setLoggedIn: (loggedIn: boolean) => void;
	setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isLoggedIn: false,
	setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setUser: (user) => set({ user }),
}));
