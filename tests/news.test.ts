import { expect, test } from 'bun:test';
import { env } from 'bun';
import {
	MUST_READ_RSS_LIST,
	type RSS_CATEGORY,
} from '../src/config/news-sources';
import { parseRSS } from '../src/lib/parse-news';

test('Test News Availability', async () => {
	for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
		// Pick a random RSS from the list

		// Have env.D1 means cloudflare worker, cloudfare worker has limited subrequest,
		// so we need to pick a random rss to avoid hitting the limit

		for (const rss of MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]) {
			expect(parseRSS(rss)).resolves.not.toBeNull();
		}
	}
});
