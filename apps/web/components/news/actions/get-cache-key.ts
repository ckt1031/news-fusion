import { getSHA256 } from '@ckt1031/utils';

export default function getNewsPageRedisCacheKey(date: string, topic: string) {
	return getSHA256(['NEWS', date, topic]);
}
