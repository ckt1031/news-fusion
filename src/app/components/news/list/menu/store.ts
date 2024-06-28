import { create } from 'zustand';

interface UIStore {
	dialog: 'clear-cache';
	setDialog: (dialog: UIStore['dialog']) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	dialog: 'clear-cache',
	setDialog: (dialog) => set({ dialog }),
}));
