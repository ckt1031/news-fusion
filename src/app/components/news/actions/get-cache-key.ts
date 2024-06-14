import getSHA256 from '@/app/utils/sha256';

export default function getCacheKey(date: string, topic: string) {
	return getSHA256(`NEWS_${date}_${topic}`);
}
