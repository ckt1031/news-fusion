export const YOUTUBE_RSS =
	'https://www.youtube.com/feeds/videos.xml?channel_id=';

export const DEFAULT_MINIMUM_SIMILARITY_SCORE = 0.75;

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_SUMMARIZE_MODEL = 'gpt-3.5-turbo-0125';
export const DEFAULT_TRANSLATE_MODEL = 'gpt-4o';
export const DEFAULT_TITLE_GENERATE_MODEL = 'gpt-3.5-turbo-0125';
export const DEFAULT_CHECK_IMPORTANCE_MODEL = 'gpt-4o';
export const DEFAULT_SEARCH_QUERY_GENERATE_MODEL = 'gpt-3.5-turbo-0125';

export const FAVICON_BASE_URL = 'https://www.google.com/s2/favicons';

export const TargetLanguageToLLM = {
	en: 'English',
	'zh-tw': 'Traditional Chinese (Hong Kong)',
	'zh-cn': 'Simplified Chinese (China)',
};

export const availableFrontendCallModels = [
	{
		label: 'GPT-3.5 Turbo',
		value: 'gpt-3.5-turbo',
	},
	{
		label: 'GPT-4o',
		value: 'gpt-4o',
	},
	{
		label: 'LLaMA 3 (70B)',
		value: 'llama3-70b-8192',
	},
	{
		label: 'Gemma 2 (9B)',
		value: 'gemma2-9b-it',
	},
];
