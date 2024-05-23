import summarizePrompt from '@/prompts/summarize';
import titleGenPrompt from '@/prompts/title-generate';
import translatePrompt from '@/prompts/translate';
import type { ServerEnv } from '@/types/env';
import type { MessageContentText } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { isMostlyChinese } from './detect-chinese';

async function generate(
	env: ServerEnv,
	modelName: string,
	message: string,
): Promise<string> {
	const model = new ChatOpenAI({
		temperature: 0.9,
		model: modelName,
		apiKey: env.OPENAI_API_KEY,
		configuration: {
			baseURL: env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1',
		},
	});

	const { content } = await model.invoke(message);

	if (typeof content === 'string') return content;

	// Find one with type === 'text'
	const textResult = content.find((r) => r.type === 'text');

	if (!textResult) {
		throw new Error('Langchain (OpenAI): Failed to generate content');
	}

	return (textResult as MessageContentText).text;
}

export async function summarizeText(env: ServerEnv, originalContent: string) {
	const prompt = `${summarizePrompt}\n\n${originalContent}`;

	const model = isMostlyChinese(originalContent)
		? 'command-r-plus'
		: 'gpt-4o';

	return await generate(env, model, prompt);
}

export async function translateText(env: ServerEnv, originalContent: string) {
	const content = await generate(
		env,
		'command-r-plus',
		`${translatePrompt}\n\n\`\`\`input\n${originalContent}\`\`\``,
	);

	if (!content) {
		throw new Error('Failed to translate content');
	}

	return content;
}

export async function generateTitle(env: ServerEnv, content: string) {
	const model = 'gpt-3.5-turbo';

	// If content is longer than 1900 characters, truncate it
	const truncatedContent =
		content.length > 1900 ? `${content.slice(0, 1900)}...` : content;

	return await generate(
		env,
		model,
		`${titleGenPrompt}\n\n\`\`\`input\n${truncatedContent}\`\`\``,
	);
}
