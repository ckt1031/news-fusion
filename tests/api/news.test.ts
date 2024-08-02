import { expect, test } from 'bun:test';
import { ALL_RSS_CATEGORIES } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';

test('Test News Availability', async () => {
	for (const category of ALL_RSS_CATEGORIES) {
		expect(
			await checkRSS({
				category,
				isTesting: true,
				// @ts-ignore
				env: process.env,
			}),
		).not.toBeNull();
	}
});
