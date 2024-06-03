import { expect, test } from 'bun:test';
import { ALL_RSS_CATAGORIES } from '@/config/news-sources';
import checkRSS from '@/lib/news/check-rss';

test('Test News Availability', async () => {
	for (const catagory of ALL_RSS_CATAGORIES) {
		expect(
			await checkRSS({
				// @ts-ignore
				env: process.env,
				catagory,
				isTesting: true,
			}),
		).not.toBeNull();
	}
});
