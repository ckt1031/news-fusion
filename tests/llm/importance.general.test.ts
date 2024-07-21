import { checkArticleImportance } from '@ckt1031/ai';
import { getContentMarkdownFromURL } from '@ckt1031/tool-api';
import { describe, expect, test } from 'vitest';
import { nextServerEnv } from '../../apps/web/utils/env/server';

const env = nextServerEnv;

describe(
	'News Importance Prompt Accuracy for General',
	{
		timeout: 5 * 60 * 1000,
	},
	async () => {
		test('Should give true for important articles', async () => {
			const list = [
				// Mexico elects Claudia Sheinbaum as first woman president
				'https://www.bbc.com/news/articles/cp4475gwny1o',

				// Heat kills more than 50 people in India in three days
				'https://www.bbc.com/news/articles/cprrv9zp8wyo',

				'https://www.theguardian.com/world/article/2024/jun/03/dutch-pair-face-jail-latvia-helping-refugees-compassion',
			];

			for (const news of list) {
				const content = await getContentMarkdownFromURL(env, news);

				const importantEnough = await checkArticleImportance(env, content);

				console.log(`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`);
				expect(importantEnough).toBe(true);
			}
		});

		test('Should give false for unimportant articles', async () => {
			const list = [
				'https://www.theguardian.com/music/article/2024/may/29/tell-us-what-do-you-spend-on-music-in-a-typical-month',
				'https://www.theguardian.com/football/article/2024/may/28/manchester-united-staff-early-bonus-resign-sir-jim-ratcliffe',
				'https://www.theguardian.com/society/article/2024/may/28/labour-must-beware-the-pitfalls-of-its-new-towns-policy',
				'https://www.theguardian.com/politics/article/2024/may/29/what-are-labours-plans-for-ending-tax-breaks-for-private-schools',
			];

			for (const news of list) {
				const content = await getContentMarkdownFromURL(env, news);

				const importantEnough = await checkArticleImportance(env, content);

				console.log(`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`);
				expect(importantEnough).toBe(false);
			}
		});
	},
);
