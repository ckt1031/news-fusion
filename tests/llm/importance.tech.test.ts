import { describe, expect, test } from 'bun:test';
import { checkArticleImportance } from '@/lib/llm/prompt-calls';
import { urlToLLMContent } from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';

const env = await envSchema
	.pick({
		OPENAI_API_KEY: true,
		OPENAI_API_BASE_URL: true,
		TOOLS_API_BASE_URL: true,
		TOOLS_API_KEY: true,
	})
	.parseAsync(process.env);

describe('News Importance Prompt Accuracy for Technology', async () => {
	test('Should give true for important articles', async () => {
		const list = [
			'https://huggingface.co/blog/space-secrets-disclosure',
			'https://www.anthropic.com/news/claude-3-family',
			'https://cohere.com/blog/command-r-plus-microsoft-azure',
			'https://www.theverge.com/2024/5/30/24167317/netflix-minecraft-animated-series-microsoft-mojang',
			'https://www.theverge.com/2024/5/29/24167436/chatgpt-4o-custom-gpts-free',
			'https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-launching-free-for-all-chatgpt-users',
			'https://www.theverge.com/2024/5/28/24166451/telegram-copilot-microsoft-ai-chatbot',
			'https://www.theverge.com/2024/5/29/24166216/arm-immortalis-g925-cortex-x925-mobile-soc',
		];

		for (const news of list) {
			const content = await urlToLLMContent(env, {
				title: 'Test News',
				link: news,
				pubDate: new Date().toISOString(),
				guid: news,
			});

			const importantEnough = await checkArticleImportance(env, content, {
				useGPT4o: false,
			});

			console.log(`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`);
			expect(importantEnough).toBe(true);
		}
	});

	test('Should give false for unimportant articles', async () => {
		const list = [
			'https://blog.cloudflare.com/tom-evans-chief-partnership-officer',
			'https://www.theverge.com/24161521/best-memorial-day-sales-2024-tech-deals-tvs-headphones-robot-vacuums-electronics',
			'https://blog.google/products/search/doodle-for-google-2024-state-territory-winners/',
			'https://www.theverge.com/24126218/graduation-grad-gift-ideas-2024-college-high-school-dorm-tech-gadgets',
			'https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-launching-free-for-all-chatgpt-users',
			'https://www.anthropic.com/news/jay-kreps-appointed-to-board-of-directors',
			'https://cohere.com/blog/cohere-new-york-office',
		];

		for (const news of list) {
			const content = await urlToLLMContent(env, {
				title: 'Test News',
				link: news,
				pubDate: new Date().toISOString(),
				guid: news,
			});

			const importantEnough = await checkArticleImportance(env, content, {
				useGPT4o: false,
			});

			console.log(`Is ${news} important? ${importantEnough ? 'Yes' : 'No'}`);
			expect(importantEnough).toBe(false);
		}
	});
});
