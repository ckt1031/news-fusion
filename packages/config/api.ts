export const YOUTUBE_RSS =
	'https://www.youtube.com/feeds/videos.xml?channel_id=';

export const DEFAULT_MINIMUM_SIMILARITY_SCORE = 0.75;

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_SUMMARIZE_MODEL = 'gpt-4o-mini';
export const DEFAULT_TRANSLATE_MODEL = 'gpt-4o-mini';
export const DEFAULT_TITLE_GENERATE_MODEL = 'gpt-4o-mini';
export const DEFAULT_CHECK_IMPORTANCE_MODEL = 'gpt-4o-mini';
export const DEFAULT_SEARCH_QUERY_GENERATE_MODEL = 'gpt-4o-mini';

export const FAVICON_BASE_URL = 'https://www.google.com/s2/favicons';

export const TargetLanguageToLLM = {
	en: 'English',
	'zh-tw': 'Traditional Chinese (Hong Kong)',
	'zh-cn': 'Simplified Chinese (China)',
};

export const AVAILABLE_CONTENT_GENERATION_MODELS = [
	{
		label: 'GPT-4o',
		value: 'gpt-4o',
	},
	{
		label: 'GPT-4o Mini',
		value: 'gpt-4o-mini',
	},
	{
		label: 'LLaMA 3.1 (70B)',
		value: 'llama-3.1-70b-versatile',
	},
	{
		label: 'LLaMA 3.1 (8B)',
		value: 'llama-3.1-8b-instant',
	},
];
