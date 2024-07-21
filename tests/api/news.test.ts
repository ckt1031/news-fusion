import { ALL_RSS_CATAGORIES } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';
import { expect, test } from 'vitest';

test(
	'Test News Availability',
	{
		timeout: 180000,
	},
	async () => {
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
	},
);
