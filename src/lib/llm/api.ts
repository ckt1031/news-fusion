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

export interface AIBaseProps {
	env: ServerEnv;
	timeout?: number;
	taskName?: string;
	model?: string;
}

export interface TextCompletionsGenerateProps extends AIBaseProps {
	temperature?: number;
	message: {
		system?: string;
		user: string;
	};
	model: string;
}

export interface EmbeddingsProp extends AIBaseProps {
	text: string;
}

export async function requestEmbeddingsAPI({
	env,
	text,
	model = DEFAULT_EMBEDDING_MODEL,
	timeout = 10 * 1000,
	taskName,
}: EmbeddingsProp) {
	try {
		consola.start('Request Embeddings API', {
			model,
			task: taskName,
		});

		const openai = getOpenAI(env);

		const { embedding } = await embed({
			model: openai.embedding(DEFAULT_EMBEDDING_MODEL),
			value: text,
			maxRetries: 3,
			abortSignal: AbortSignal.timeout(timeout),
		});

		return embedding;
	} catch (error) {
		consola.error('Failed to request embeddings API', error);
		return null;
	}
}

export async function requestChatCompletionAPI({
	env,
	model,
	message,
	temperature,
	timeout = 60 * 1000,
	taskName,
}: TextCompletionsGenerateProps): Promise<string> {
	consola.start('Request Chat Completion API', {
		model,
		task: taskName,
	});

	const openai = getOpenAI(env);

	const { text } = await generateText({
		model: openai(model),
		temperature: temperature ?? 0.5,
		prompt: message.user,
		system: message.system,
		abortSignal: AbortSignal.timeout(timeout),
		maxRetries: 4,
	});

	return text;
}
