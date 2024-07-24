import { checkArticleImportance } from '@ckt1031/ai';
import { getContentMarkdownFromURL } from '@ckt1031/tool-api';
import { describe, expect, test } from 'vitest';
import { nextServerEnv } from '../../apps/web/utils/env/server';

const env = nextServerEnv;

describe(
	'News Importance Prompt Accuracy for Technology',
	{
		timeout: 5 * 60 * 1000,
	},
	async () => {
		test('Should give true for important articles', async () => {
			const list = [
				'https://techcrunch.com/2024/07/20/microsoft-says-8-5m-windows-devices-were-affected-by-crowdstrike-outage/',
				'https://www.theverge.com/2024/7/18/24200714/openai-new-cheaper-smarter-model-gpt-4o-mini',
				'https://vercel.com/blog/introducing-bytecode-caching-for-vercel-functions',
				'https://huggingface.co/blog/space-secrets-disclosure',
				'https://www.anthropic.com/news/claude-3-family',
				'https://www.theverge.com/2024/5/30/24167317/netflix-minecraft-animated-series-microsoft-mojang',
				'https://www.theverge.com/2024/5/29/24167436/chatgpt-4o-custom-gpts-free',
				'https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-launching-free-for-all-chatgpt-users',
				'https://www.theverge.com/2024/5/28/24166451/telegram-copilot-microsoft-ai-chatbot',
				'https://www.theverge.com/2024/5/29/24166216/arm-immortalis-g925-cortex-x925-mobile-soc',
			];

			for (const news of list) {
				const content = await getContentMarkdownFromURL(env, news);

				const importantEnough = await checkArticleImportance(env, content);

				console.log(
					`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`,
					'should be yes',
				);

				expect(importantEnough).toBe(true);
			}
		});

		test('Should give false for unimportant articles', async () => {
			const list = [
				'https://techcrunch.com/2024/07/18/pe-firm-partnerone-paid-28m-for-headspin-a-fraction-of-its-1-1b-valuation-set-by-iconiq-and-dell-technologies-capital/',
				'https://blog.cloudflare.com/tom-evans-chief-partnership-officer',
				'https://www.theverge.com/2024/7/21/24202162/notion-calendar-claude-android-tinypod-ea-football-installer',
				'https://www.theverge.com/24201413/iphone-android-ios-samsung-one-hand-how-to',
				'https://www.theverge.com/24161521/best-memorial-day-sales-2024-tech-deals-tvs-headphones-robot-vacuums-electronics',
				'https://blog.google/products/search/doodle-for-google-2024-state-territory-winners/',
				'https://www.theverge.com/24126218/graduation-grad-gift-ideas-2024-college-high-school-dorm-tech-gadgets',
				'https://www.anthropic.com/news/jay-kreps-appointed-to-board-of-directors',
				'https://cohere.com/blog/cohere-new-york-office',
			];

			for (const news of list) {
				const content = await getContentMarkdownFromURL(env, news);

				const importantEnough = await checkArticleImportance(env, content);

				console.log(
					`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`,
					'should be no',
				);

				expect(importantEnough).toBe(false);
			}
		});
	},
);
