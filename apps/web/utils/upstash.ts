import { getSHA256 } from '@ckt1031/utils';

export const getBookmarkCacheHash = (userId: string) => {
	return getSHA256(`${userId}_NEWS_BOOKMARKS`);
};

export const getSummarizedArticlesCacheHash = (userId?: string) => {
	return getSHA256(
		userId ? `${userId}_SUMMARIZED_ARTICLES` : 'SUMMARIZED_ARTICLES',
	);
};
