import { DEFAULT_EMBEDDING_MODEL } from '@/config/api';
import type { ServerEnv } from '@/types/env';
import { createOpenAI } from '@ai-sdk/openai';
import { embed, generateText } from 'ai';
import { ofetch } from 'ofetch';
import logging from '../console';

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

export interface RerankProps extends AIBaseProps {
	text: string;
	documents: string[];
}

export async function requestRerankerAPI({
	documents,
	env,
	text,
}: RerankProps) {
	/**
	 * We are using the Jina Reranker API to rerank the documents based on the query.
	 *
	 * You can use other reranker APIs like:
	 * - Cohere
	 * - Voyage AI
	 */

	const API_HOST = env.RERANKER_API_BASE_URL ?? 'https://api.jina.ai/v1';

	const MODEL = env.RERANKER_MODEL ?? 'jina-reranker-v2-base-multilingual';

	const body = {
		model: MODEL,
		query: text,
		documents: documents,
		top_n: 3,
	};

	interface RerankResponse {
		// model: string;
		// usage: {
		// 	total_tokens: number;
		// 	prompt_tokens: number;
		// };
		results: {
			index: number;
			document: {
				text: string;
			};
			relevance_score: number;
		}[];
	}

	const { results } = await ofetch<RerankResponse>(`${API_HOST}/rerank`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.RERANKER_API_KEY}`,
		},
		body,
	});

	return results;
}

export async function requestEmbeddingsAPI({
	env,
	text,
	model = DEFAULT_EMBEDDING_MODEL,
	timeout = 10 * 1000,
	taskName,
}: EmbeddingsProp) {
	try {
		logging.info('Request Embeddings API', {
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
		logging.error('Failed to request embeddings API', error);
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
	logging.info('Request Chat Completion API', {
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
