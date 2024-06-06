import { describe, expect, test } from 'bun:test';
import { checkArticleImportance } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';

const env = await envSchema
	.pick({
		OPENAI_API_KEY: true,
		OPENAI_API_BASE_URL: true,
		TOOLS_API_BASE_URL: true,
		TOOLS_API_KEY: true,
	})
	.parseAsync(process.env);

describe('News Importance Prompt Accuracy for General', async () => {
	test('Should give true for important articles', async () => {
		const list = [
			// Mexico elects Claudia Sheinbaum as first woman president
			'https://www.bbc.com/news/articles/cp4475gwny1o',

			// Heat kills more than 50 people in India in three days
			'https://www.bbc.com/news/articles/cprrv9zp8wyo',

			'https://www.theguardian.com/world/article/2024/jun/03/dutch-pair-face-jail-latvia-helping-refugees-compassion',
		];

		for (const news of list) {
			const content = await getContentMakrdownFromURL(env, news);

			const importantEnough = await checkArticleImportance(env, content, {
				useAdvancedModel: false,
			});

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
			const content = await getContentMakrdownFromURL(env, news);

			const importantEnough = await checkArticleImportance(env, content, {
				useAdvancedModel: false,
			});

			console.log(`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`);
			expect(importantEnough).toBe(false);
		}
	});
});
