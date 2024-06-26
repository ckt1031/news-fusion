import {
	DEFAULT_CHECK_IMPORTANCE_MODEL,
	DEFAULT_SEARCH_QUERY_GENERATE_MODEL,
	DEFAULT_SUMMARIZE_MODEL,
	DEFAULT_TITLE_GENERATE_MODEL,
	DEFAULT_TRANSLATE_MODEL,
} from '@/config/api';
import filterImportancePrompt from '@/prompts/filter-importance';
import queryGenPrompt from '@/prompts/query-generate';
import summarizePrompt from '@/prompts/summarize';
import summarizeInfoShortTextPrompt from '@/prompts/summarize-to-short-text';
import titleGenPrompt from '@/prompts/title-generate';
import translatePrompt from '@/prompts/translate';
import Mustache from 'mustache';
import {
	type TextCompletionsGenerateProps,
	requestChatCompletionAPI,
} from './api';

export async function summarizeText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
) {
	return await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL,
		temperature: 0.4,
		message: {
			system: summarizePrompt,
			user: originalContent,
		},
		taskName: 'Summarize Text',
	});
}

export async function summarizeIntoShortText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
) {
	return await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL,
		temperature: 0.2,
		message: {
			system: summarizeInfoShortTextPrompt,
			user: originalContent,
		},
		timeout: 20 * 1000,
		taskName: 'Summarize Into Short Text',
	});
}

export async function llmTranslateText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
	targetLanguage: 'Traditional Chinese (Hong Kong)' | 'English',
) {
	const _translatePrompt = Mustache.render(translatePrompt, {
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
			system: queryGenPrompt,
			user: content,
		},
		timeout: 10 * 1000,
		taskName: 'Generate Search Query',
	});
}

export async function generateTitle(
	env: TextCompletionsGenerateProps['env'],
	content: string,
) {
	// If content is longer than 1900 characters, truncate it
	const truncatedContent =
		content.length > 1900 ? `${content.slice(0, 1900)}...` : content;

	return await requestChatCompletionAPI({
		env,
		model: env.DEFAULT_TITLE_GENERATE_MODEL ?? DEFAULT_TITLE_GENERATE_MODEL,
		temperature: 0,
		message: {
			system: titleGenPrompt,
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
