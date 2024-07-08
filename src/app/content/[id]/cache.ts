import getSHA256 from '@/app/utils/sha256';

export function getArticleCacheKey(id: string) {
	return getSHA256(`article-${id}`);
}
