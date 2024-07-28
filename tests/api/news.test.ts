import { ALL_RSS_CATEGORIES } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';
import { expect, test } from 'vitest';

test(
	'Test News Availability',
	{
		timeout: 180000,
	},
	async () => {
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
	},
);
