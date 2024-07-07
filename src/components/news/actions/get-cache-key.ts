import getSHA256 from '@/app/utils/sha256';

export default function getNewsPageRedisCacheKey(date: string, topic: string) {
	return getSHA256(['NEWS', date, topic]);
}
