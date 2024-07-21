import {
	DEFAULT_CHECK_IMPORTANCE_MODEL,
	DEFAULT_SEARCH_QUERY_GENERATE_MODEL,
	DEFAULT_SUMMARIZE_MODEL,
	DEFAULT_TITLE_GENERATE_MODEL,
	DEFAULT_TRANSLATE_MODEL,
} from '@ckt1031/config';
import {
	filterImportancePrompt,
	queryGenerationPrompt,
	summarizeIntoShortTextPrompt,
	summarizeLongTextPrompt,
	titleGenerationPrompt,
	translationPrompt,
} from '@ckt1031/prompts';

import Mustache from 'mustache';
import { requestChatCompletionAPI } from './api';
import type { TextCompletionsGenerateProps } from './types';

export async function summarizeText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
) {
	return await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL,
		temperature: 0.4,
		message: {
			system: summarizeLongTextPrompt,
			user: originalContent,
		},
		taskName: 'Summarize Text',
	});
}

export async function summarizeIntoShortText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
	model?: string,
) {
	return await requestChatCompletionAPI({
		env,
		model: model ?? env.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL,
		temperature: 0.2,
		message: {
			system: summarizeIntoShortTextPrompt,
			user: originalContent,
		},
		timeout: 20 * 1000,
		taskName: 'Summarize Into Short Text',
	});
}

export async function llmTranslateText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
	targetLanguage: string,
) {
	const _translatePrompt = Mustache.render(translationPrompt, {
		language: targetLanguage,
	});

	const content = await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_TRANSLATE_MODEL ?? DEFAULT_TRANSLATE_MODEL,
		temperature: 0.2,
		message: {
			system: _translatePrompt,
			user: originalContent,
		},
		taskName: 'Translate Text',
	});

	return content;
}

export async function generateSearchQuery(
	env: TextCompletionsGenerateProps['env'],
	content: string,
) {
	return await requestChatCompletionAPI({
		env,
		model:
			env.DEFAULT_SEARCH_QUERY_GENERATE_MODEL ??
			DEFAULT_SEARCH_QUERY_GENERATE_MODEL,
		temperature: 0.2,
		message: {
			system: queryGenerationPrompt,
			user: content,
		},
		timeout: 10 * 1000,
		taskName: 'Generate Search Query',
	});
}

export async function generateTitle(
	env: TextCompletionsGenerateProps['env'],
	content: string,
	model?: string,
) {
	// If content is longer than 1900 characters, truncate it
	const truncatedContent =
		content.length > 1900 ? `${content.slice(0, 1900)}...` : content;

	return await requestChatCompletionAPI({
		env,
		model:
			model ?? env.DEFAULT_TITLE_GENERATE_MODEL ?? DEFAULT_TITLE_GENERATE_MODEL,
		temperature: 0,
		message: {
			system: titleGenerationPrompt,
			user: truncatedContent,
		},
		timeout: 10 * 1000,
		taskName: 'Generate Title',
	});
}

export async function checkArticleImportance(
	env: TextCompletionsGenerateProps['env'],
	content: string,
	custom?: {
		customSystemPrompt?: string;
	},
) {
	const result = await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_CHECK_IMPORTANCE_MODEL ?? DEFAULT_CHECK_IMPORTANCE_MODEL,
		temperature: 0.1,
		message: {
			system: custom?.customSystemPrompt ?? filterImportancePrompt,
			user: content,
		},
		timeout: 10 * 1000,
		taskName: 'Check Article Importance',
	});
	return result.toLowerCase().includes('true');
}
