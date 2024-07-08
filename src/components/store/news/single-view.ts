import type { ArticleFetchingReturnProps } from '@/app/content/[id]/schema';
import { create } from 'zustand';

interface SingleNewsViewStore {
	article: ArticleFetchingReturnProps;
	setArticle: (article: ArticleFetchingReturnProps) => void;
}

export const useSingleNewsViewStore = create<SingleNewsViewStore>((set) => ({
	article: undefined,
	setArticle: (article) => set({ article }),
}));
