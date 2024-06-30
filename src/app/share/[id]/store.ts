import { create } from 'zustand';
import type { SharedArticleFetchingReturnProps } from './schema';

interface UIStore {
	data: SharedArticleFetchingReturnProps;
	setData: (data: NonNullable<SharedArticleFetchingReturnProps>) => void;

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
