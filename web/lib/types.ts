import type { Article } from '~~/db/types';

export interface NuxtAPIFeedDataResponse {
	error: string | null;
	timestamp: string;
	articles: Article[];
}
