import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { FeedItemWithFeedData } from '../crawler/entry.js';
import { NewsProcessorPrompt, NewsProcessorSchema } from './prompt/news.js';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function processNewsWithLLM(
	item: FeedItemWithFeedData,
	content: string,
) {
	const userPrompt = `Title: ${item.feedData.title}
Publisher: ${item.feedConfig.name}
Published At: ${new Date(item.feedData.pubDate).toISOString()}
Content: ${content}`;

	const response = await openai.chat.completions.parse({
		model: process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: NewsProcessorPrompt },
			{ role: 'user', content: userPrompt },
		],
		response_format: zodResponseFormat(NewsProcessorSchema, 'data'),
	});

	if (!response.choices[0]?.message.parsed) {
		throw new Error('Failed to process news with LLM');
	}

	const data = response.choices[0].message.parsed;

	if (!data) {
		throw new Error('Failed to process news with LLM');
	}

	return data;
}
