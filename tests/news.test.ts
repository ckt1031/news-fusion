import { expect, test } from 'bun:test';
import {
	MUST_READ_RSS_LIST,
	type RSS_CATEGORY,
} from '../src/config/news-sources';
import { parseRSS } from '../src/lib/parse-news';

test('Test News Availability', async () => {
	for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
		for (const rss of MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]) {
			expect(await parseRSS(rss)).not.toBeNull();
		}
	}
});
