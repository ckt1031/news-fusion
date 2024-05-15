import type OpenAI from 'openai';
import { z } from 'zod';
import summarizePrompt from '../prompts/summarize';
import titleGenPrompt from '../prompts/title-generate';
import translatePrompt from '../prompts/translate';
import type { ServerEnv } from '../types/env';
import type { RecursivePartial } from '../types/utils';
import { isMostlyChinese } from './detect-chinese';

async function generate(env: ServerEnv, model: string, message: string) {
	const baseURL = env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1';
	const body: OpenAI.ChatCompletionCreateParams = {
		stream: false,
		model,
		messages: [{ role: 'user', content: message }],
		temperature: 0.6,
	};
	const response = await fetch(`${baseURL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error('Failed to generate response');
	}

	const schema: z.ZodType<RecursivePartial<OpenAI.ChatCompletion>> = z.object({
		choices: z.array(
			z.object({
				message: z.object({
					content: z.string(),
				}),
			}),
		),
	});

	const result = await schema.parseAsync(await response.json());

	if (
		!result.choices ||
		result.choices.length === 0 ||
		!result.choices[0]?.message
	) {
		throw new Error('Failed to generate response');
	}

	return result.choices[0].message.content;
}

export async function summarizeText(env: ServerEnv, originalContent: string) {
	const prompt = `${summarizePrompt}\n\n${originalContent}`;

	const model = isMostlyChinese(originalContent)
		? 'yi-medium'
		: 'gemini-1.5-flash-latest';

	return await generate(env, model, prompt);
}

export async function translateText(env: ServerEnv, originalContent: string) {
	// const model = isMostlyChinese(originalContent)
	// 	? 'command-r-plus'
	// 	: 'Qwen/Qwen1.5-110B-Chat';

	const content = await generate(
		env,
		'command-r-plus',
		`${translatePrompt}\n\n\`\`\`input\n${originalContent}\`\`\``,
	);

	if (!content) {
		throw new Error('Failed to translate content');
	}

	// Use ... if the content is too long, 1900 is the limit
	return content.length > 1900 ? `${content.slice(0, 1900)}...` : content;
}

export async function generateTitle(env: ServerEnv, content: string) {
	const model = 'command-r-plus';

	// If content is longer than 1900 characters, truncate it
	const truncatedContent =
		content.length > 1900 ? `${content.slice(0, 1900)}...` : content;

	return await generate(
		env,
		model,
		`${titleGenPrompt}\n\n\`\`\`input\n${truncatedContent}\`\`\``,
	);
}
