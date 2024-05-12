import type OpenAI from 'openai';
import summarizePrompt from '../prompts/summarize';
import translatePrompt from '../prompts/translate';
import type { ServerEnv } from '../types/env';

async function generate(env: ServerEnv, message: string) {
	const response = await fetch(`${env.OPENAI_API_BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			stream: false,
			model: env.OPENAI_LLM_MODEL,
			messages: [{ role: 'user', content: message }],
			temperature: 0.6,
		} satisfies OpenAI.ChatCompletionCreateParams),
	});

	if (!response.ok) {
		throw new Error('Failed to generate response');
	}

	const result = (await response.json()) as OpenAI.ChatCompletion;

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
