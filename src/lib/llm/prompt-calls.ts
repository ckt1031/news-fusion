import {
	DEFAULT_CHECK_IMPORTANCE_MODEL,
	DEFAULT_SUMMARIZE_MODEL,
	DEFAULT_TITLE_GENERATE_MODEL,
	DEFAULT_TRANSLATE_MODEL,
} from '@/config/api';
import filterImportancePrompt from '@/prompts/filter-importance';
import summarizePrompt from '@/prompts/summarize';
import titleGenPrompt from '@/prompts/title-generate';
import translatePrompt from '@/prompts/translate';
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
		model: DEFAULT_SUMMARIZE_MODEL,
		temperature: 0.4,
		message: {
			system: summarizePrompt,
			user: originalContent,
		},
		trace: {
			name: 'summarize-article',
		},
	});
}

export async function translateText(
	env: TextCompletionsGenerateProps['env'],
	originalContent: string,
) {
	const content = await requestChatCompletionAPI({
		env,
		model: DEFAULT_TRANSLATE_MODEL,
		temperature: 0.2,
		message: {
			system: translatePrompt,
			user: originalContent,
		},
		trace: {
			name: 'translate-text',
		},
	});

	return content;
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
		model: DEFAULT_TITLE_GENERATE_MODEL,
		temperature: 0,
		message: {
			system: titleGenPrompt,
			user: truncatedContent,
		},
		trace: {
			name: 'generate-title',
		},
		timeout: 10 * 1000,
	});
}

export async function checkArticleImportance(
	env: TextCompletionsGenerateProps['env'],
	content: string,
	custom?: {
		useAdvancedModel?: boolean;
		trace?: boolean;
	},
) {
	const result = await requestChatCompletionAPI({
		env,
		model: custom?.useAdvancedModel
			? DEFAULT_CHECK_IMPORTANCE_MODEL
			: 'command-r-plus',
		temperature: 0.1,
		message: {
			system: filterImportancePrompt,
			user: content,
		},
		trace: {
			enabled: custom?.trace ?? true,
			name: 'check-article-importance',
		},
		timeout: 10 * 1000,
	});
	return result.toLowerCase().includes('true');
}
