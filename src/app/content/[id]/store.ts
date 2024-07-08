import { create } from 'zustand';
import type { ArticleFetchingReturnProps } from './schema';

interface UIStore {
	data: ArticleFetchingReturnProps;
	setData: (data: NonNullable<ArticleFetchingReturnProps>) => void;

	setLongSummary: (longSummary: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	data: undefined,
	setData: (data) => set({ data }),

	setLongSummary: (longSummary) => {
		set((state) => {
			if (!state.data) throw new Error('Data is not set');

			return {
				data: {
					...state.data,
					longSummary,
				},
			};
		});
	},
}));
