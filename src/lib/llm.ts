import summarizePrompt from '@/prompts/summarize';
import titleGenPrompt from '@/prompts/title-generate';
import translatePrompt from '@/prompts/translate';
import type { ServerEnv } from '@/types/env';
import type { MessageContentText } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { CallbackHandler as LangFuseCallbackHandler } from 'langfuse-langchain';
import { isMostlyChinese } from './detect-chinese';

type GenerateProps = {
	env: ServerEnv;
	model: string;
	message: {
		system?: string;
		user?: string;
	};
	temperature?: number;
};

async function generate({
	env,
	model,
	message,
	temperature,
}: GenerateProps): Promise<string> {
	const langfuseHandler = new LangFuseCallbackHandler({
		secretKey: env.LANGFUSE_SECRET_KEY,
		publicKey: env.LANGFUSE_PUBLIC_KEY,
		baseUrl: env.LANGFUSE_BASE_URL ?? 'https://us.cloud.langfuse.com',
	});

	const chatLLM = new ChatOpenAI({
		temperature: temperature ?? 0.5,
		model,
		apiKey: env.OPENAI_API_KEY,
		configuration: {
			baseURL: env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1',
		},
	});

	const systemMessage = message.system
		? [
				new SystemMessage({
					content: [
						{
							type: 'text',
							text: message.system,
						},
					],
				}),
			]
		: [];

	const humanMessages = message.user
		? [
				new HumanMessage({
					content: [
						{
							type: 'text',
							text: message.user,
						},
					],
				}),
			]
		: [];

	const { content } = await chatLLM.invoke(
		[...systemMessage, ...humanMessages],
		{
			callbacks: env.LANGFUSE_SECRET_KEY ? [langfuseHandler] : [],
		},
	);

	await langfuseHandler.flushAsync();

	if (typeof content === 'string') return content;

	// Find one with type === 'text'
	const textResult = content.find((r) => r.type === 'text');

	if (!textResult) {
		throw new Error('Langchain (OpenAI): Failed to generate content');
	}

	return (textResult as MessageContentText).text;
}

export async function summarizeText(env: ServerEnv, originalContent: string) {
	const model = isMostlyChinese(originalContent) ? 'yi-large-turbo' : 'gpt-4o';

	return await generate({
		env,
		model,
		temperature: 0.4,
		message: {
			system: summarizePrompt,
			user: originalContent,
		},
	});
}

export async function translateText(env: ServerEnv, originalContent: string) {
	const content = await generate({
		env,
		model: 'yi-large-turbo',
		temperature: 0.2,
		message: {
			system: translatePrompt,
			user: originalContent,
		},
	});

	if (!content) throw new Error('Failed to translate content');

	return content;
}

export async function generateTitle(env: ServerEnv, content: string) {
	// If content is longer than 1900 characters, truncate it
	const truncatedContent =
		content.length > 1900 ? `${content.slice(0, 1900)}...` : content;

	return await generate({
		env,
		model: 'gpt-3.5-turbo',
		temperature: 0,
		message: {
			system: titleGenPrompt,
			user: truncatedContent,
		},
	});
}
