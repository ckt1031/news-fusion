import type OpenAI from 'openai';
import summarizePrompt from '../prompts/summarize';
import translatePrompt from '../prompts/translate';
import type { ServerEnv } from '../types/env';
import { z } from 'zod';
import type { RecursivePartial } from '../types/utils';

async function generate(env: ServerEnv, message: string) {
	const baseURL = env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1';
	const body: OpenAI.ChatCompletionCreateParams = {
		stream: false,
		model: env.OPENAI_LLM_MODEL ?? 'gpt-3.5-turbo',
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

	if (!result.choices || result.choices.length === 0 || !result.choices[0]?.message) {
		throw new Error('Failed to generate response');
	}

	return result.choices[0].message.content;
}

export async function summarizeText(env: ServerEnv, originalContent: string) {
	return await generate(env, `${summarizePrompt}\n\n${originalContent}`);
}

export async function translateText(env: ServerEnv, originalContent: string) {
	return await generate(
		env,
		`${translatePrompt}\n\n\`\`\`input\n${originalContent}\`\`\``,
	);
}
