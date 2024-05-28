import { expect, test } from 'bun:test';
import { ALL_RSS_LIST } from '@/config/news-sources';
import checkRSS from '@/lib/news/check-rss';

test('Test News Availability', async () => {
	expect(
		await checkRSS({
			// @ts-ignore
			env: process.env,
			list: ALL_RSS_LIST,
			allMustRead: true,
			isTesting: true,
		}),
	).not.toBeNull();
});
