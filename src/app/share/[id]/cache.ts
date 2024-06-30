import getSHA256 from '@/app/utils/sha256';

export function getSharedArticleCacheKey(id: string) {
	return getSHA256(`shared-article-${id}`);
}
