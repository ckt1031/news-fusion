import { DEFAULT_EMBEDDING_MODEL } from '@/config/api';
import type { ServerEnv } from '@/types/env';
import { createOpenAI } from '@ai-sdk/openai';
import { embed, generateText } from 'ai';
import consola from 'consola';

export function getOpenAI(env: ServerEnv) {
	const openai = createOpenAI({
		baseURL: env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1',
	});

	return openai;
}

export type TextCompletionsGenerateProps = {
	env: ServerEnv;
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
	timeout?: number;
};

export interface EmbeddingsProp {
	env: ServerEnv;
	text: string;
	model?: string;
	timeout?: number;
}

export async function requestEmbeddingsAPI({
	env,
	text,
	model = DEFAULT_EMBEDDING_MODEL,
	timeout = 10 * 1000,
}: EmbeddingsProp) {
	consola.start('Request Embeddings API', {
		model,
	});

	const openai = getOpenAI(env);

	const { embedding } = await embed({
		model: openai.embedding('text-embedding-3-small'),
		value: text,
		abortSignal: AbortSignal.timeout(timeout),
	});

	return embedding;
}

export async function requestChatCompletionAPI({
	env,
	model,
	message,
	temperature,
	trace,
	timeout = 60 * 1000,
}: TextCompletionsGenerateProps): Promise<string> {
	consola.start('Request Chat Completion API', {
		model,
		...trace,
	});

	const openai = getOpenAI(env);

	const { text } = await generateText({
		model: openai(model),
		temperature: temperature ?? 0.5,
		prompt: message.user,
		system: message.system,
		abortSignal: AbortSignal.timeout(timeout),
	});

	return text;
}
