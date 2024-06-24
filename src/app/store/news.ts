import { create } from 'zustand';
import type { fetchNews } from '../components/news/news-list';

export interface NewsModalStore {
	translateDialogOpen: boolean;

	setTranslateDialogOpen: (open: boolean) => void;
}

export const useNewsModalStore = create<NewsModalStore>((set) => ({
	translateDialogOpen: false,
	setTranslateDialogOpen: (open) => set({ translateDialogOpen: open }),
}));

export interface NewsStore {
	pageData: {
		date: string;
		topic: string;
	};

	news: Awaited<ReturnType<typeof fetchNews>>;
	displayingNews: NewsStore['news'];

	setPageData: (data: NewsStore['pageData']) => void;

	setNews: (news: NewsStore['news']) => void;
	setDisplayingNews: (news: NewsStore['news']) => void;

	getItem: (guid: string) => NewsStore['news'][0];
	getDisplayingItem: (guid: string) => NewsStore['news'][0];
	setShowingItem: (guid: string, data: Partial<NewsStore['news'][0]>) => void;

	isItemTranslated: (guid: string) => boolean;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
	news: [],
	displayingNews: [],
	pageData: {
		date: '',
		topic: '',
	},
	setPageData: (data) => set({ pageData: data }),
	setNews: (news) => set({ news, displayingNews: news }),
	setDisplayingNews: (news) => set({ displayingNews: news }),
	getItem: (guid) => {
		const article = get().news.find((article) => article.guid === guid);

		if (!article) throw new Error(`No article found with guid ${guid}`);

		return article;
	},
	getDisplayingItem: (guid) => {
		const d = get().displayingNews.find((article) => article.guid === guid);

		if (!d) throw new Error(`No article found with guid ${guid}`);

		return d;
	},
	isItemTranslated: (guid) => {
		const article = get().news.find((article) => article.guid === guid);
		return (
			article?.title !==
			get().displayingNews.find((article) => article.guid === guid)?.title
		);
	},
	setShowingItem: (guid, data) => {
		const news = get().displayingNews.map((article) => {
			if (article.guid === guid) {
				return { ...article, ...data };
			}
			return article;
		});
		set({ displayingNews: news });
	},
}));
