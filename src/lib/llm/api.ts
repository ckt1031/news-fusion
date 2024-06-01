import type { ServerEnv } from '@/types/env';
import type { MessageContentText } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import {
	CallbackHandler as LangFuseCallbackHandler,
	Langfuse,
} from 'langfuse-langchain';
import packageInfo from '../../../package.json';

type GenerateProps = {
	env: ServerEnv;
	model: string;
	message: {
		system?: string;
		user?: string;
	};
	temperature?: number;
	trace?: {
		name?: string;
		id?: string;
	};
};

export function getLangfuse(env: ServerEnv) {
	return new Langfuse({
		secretKey: env.LANGFUSE_SECRET_KEY,
		publicKey: env.LANGFUSE_PUBLIC_KEY,
		baseUrl: env.LANGFUSE_BASE_URL ?? 'https://us.cloud.langfuse.com',
	});
}

export async function requestChatCompletionAPI({
	env,
	model,
	message,
	temperature,
	trace,
}: GenerateProps): Promise<string> {
	const langfuse = getLangfuse(env);

	const langfuseTrace = langfuse.trace({
		id: trace?.id,
		name: trace?.name,
		version: packageInfo.version,
	});

	const langfuseHandler = new LangFuseCallbackHandler({
		root: langfuseTrace,
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

	// Cloudflare Worker is a short-lived environment, so we need to flush and send the trace immediately
	if (env.D1) {
		await langfuse.flushAsync();
	}

	if (typeof content === 'string') return content;

	// Find one with type === 'text'
	const textResult = content.find((r) => r.type === 'text');

	if (!textResult) {
		throw new Error('Langchain (OpenAI): Failed to generate content');
	}

	return (textResult as MessageContentText).text;
}
