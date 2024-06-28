import { create } from 'zustand';

export interface NewsSectionUIStore {
	dialog: 'translate' | 'generate';
	setDialog: (dialog: NewsSectionUIStore['dialog']) => void;
}

export const useNewsSectionUIStore = create<NewsSectionUIStore>((set) => ({
	dialog: 'translate',
	setDialog: (dialog) => set({ dialog }),
}));
