import { create } from 'zustand';
import type { DateType, fetchNewsForPage } from '../components/news/list/fetch';

export enum NewsType {
	News = 'news',
	Bookmarks = 'bookmarks',
}

export interface NewsStore {
	pageData: {
		date: DateType;
		topic: string;

		searchQuery?: string;
	};

	type: NewsType;

	loading: boolean;

	news: Awaited<ReturnType<typeof fetchNewsForPage>>;
	displayingNews: (NewsStore['news'][0] & {
		immersiveTranslate?: boolean;
	})[];

	setLoading: (loading: NewsStore['loading']) => void;

	setPageData: (data: NewsStore['pageData']) => void;
	setSearching: (search: NewsStore['pageData']['searchQuery']) => void;

	setNews: (news: NewsStore['news']) => void;
	setDisplayingNews: (news: NewsStore['displayingNews']) => void;

	getItem: (guid: string) => NewsStore['news'][0];
	getDisplayingItem: (guid: string) => NewsStore['displayingNews'][0];

	setItem: (guid: string, data: Partial<NewsStore['news'][0]>) => void;
	setShowingItem: (
		guid: string,
		data: Partial<NewsStore['displayingNews'][0]>,
	) => void;

	isItemTranslated: (guid: string) => boolean;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
	news: [],
	displayingNews: [],
	type: NewsType.News,
	loading: true,
	pageData: {
		date: '',
		topic: '',
	},
	setLoading: (loading) => set({ loading }),
	setPageData: (data) => set({ pageData: data }),
	setSearching: (search) =>
		set({ pageData: { ...get().pageData, searchQuery: search } }),
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

	setItem: (guid, data) => {
		const news = get().news.map((article) => {
			if (article.guid === guid) {
				return { ...article, ...data };
			}
			return article;
		});
		set({ news });
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
