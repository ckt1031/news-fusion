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
		model: 'gpt-4o',
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
		model: 'gemini-1.5-flash-latest',
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
		model: 'gemini-1.5-flash-latest',
		temperature: 0,
		message: {
			system: titleGenPrompt,
			user: truncatedContent,
		},
		trace: {
			name: 'generate-title',
		},
	});
}

export async function checkArticleImportance(
	env: TextCompletionsGenerateProps['env'],
	content: string,
	custom?: {
		useGPT4o?: boolean;
		trace?: boolean;
	},
) {
	const result = await requestChatCompletionAPI({
		env,
		model: custom?.useGPT4o ? 'gpt-4o' : 'gemini-1.0-pro',
		temperature: 0.1,
		message: {
			system: filterImportancePrompt,
			user: content,
		},
		trace: {
			enabled: custom?.trace ?? true,
			name: 'check-article-importance',
		},
	});
	return result.toLowerCase().includes('true');
}
