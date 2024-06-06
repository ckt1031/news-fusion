import type { ServerEnv } from '@/types/env';
import type { MessageContentText } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import {
	CallbackHandler as LangFuseCallbackHandler,
	Langfuse,
} from 'langfuse-langchain';
import packageInfo from '../../../package.json';

export type TextCompletionsGenerateProps = {
	env: Pick<
		ServerEnv,
		| 'LANGFUSE_SECRET_KEY'
		| 'LANGFUSE_PUBLIC_KEY'
		| 'LANGFUSE_BASE_URL'
		| 'OPENAI_API_KEY'
		| 'OPENAI_API_BASE_URL'
	>;
	model: string;
	message: {
		system?: string;
		user: string;
	};
	temperature?: number;
	trace?: {
		enabled?: boolean;
		name?: string;
		id?: string;
	};
};

export interface EmbeddingsProp {
	env: Pick<ServerEnv, 'OPENAI_API_KEY' | 'OPENAI_API_BASE_URL'>;
	text: string;
	model: string;
}

export function getLangfuse(env: TextCompletionsGenerateProps['env']) {
	return new Langfuse({
		secretKey: env.LANGFUSE_SECRET_KEY,
		publicKey: env.LANGFUSE_PUBLIC_KEY,
		baseUrl: env.LANGFUSE_BASE_URL ?? 'https://us.cloud.langfuse.com',
	});
}

export async function requestEmbeddingsAPI({
	env,
	text,
	model,
}: EmbeddingsProp) {
	console.log('Request Embeddings API', {
		model,
	});

	const embeddings = new OpenAIEmbeddings({
		model,
		configuration: {
			baseURL: env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1',
		},
	});
	return await embeddings.embedQuery(text);
}

export async function requestChatCompletionAPI({
	env,
	model,
	message,
	temperature,
	trace,
}: TextCompletionsGenerateProps): Promise<string> {
	console.log('Request Chat Completion API', {
		model,
		...trace,
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

	const langfuse = getLangfuse(env);

	const langfuseTrace = langfuse.trace({
		id: trace?.id,
		name: trace?.name,
		version: packageInfo.version,
	});

	const langfuseHandler = new LangFuseCallbackHandler({
		root: langfuseTrace,
	});

	const { content } = await chatLLM.invoke(
		[...systemMessage, ...humanMessages],
		{
			callbacks: env.LANGFUSE_SECRET_KEY ? [langfuseHandler] : [],
		},
	);

	if (env.LANGFUSE_SECRET_KEY && !('bun' in process.versions)) {
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
