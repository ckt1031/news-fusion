import type { DateType } from '@/components/news/list/fetch';

export function getBookmarkTags(userId: string) {
	return `bookmarks:${userId}`;
}

export function getDateTag(date: DateType) {
	return typeof date === 'string' ? date : `${date.from}-${date.to}`;
}
