import type { Article } from '~~/db/types';

export interface NuxtAPIFeedDataResponse {
	error: string | null;
	articles: Article[];
}
