import { create } from 'zustand';

interface UIStore {
	dialog: 'translate' | 'regenerate' | 'share';
	setDialog: (dialog: UIStore['dialog']) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	dialog: 'translate',
	setDialog: (dialog) => set({ dialog }),
}));
