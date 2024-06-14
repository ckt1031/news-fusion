export const DISCORD_API_BASE = 'https://discord.com/api/v10';

export const YOUTUBE_RSS =
	'https://www.youtube.com/feeds/videos.xml?channel_id=';

export const DEFAULT_MINIMUM_SIMILARITY_SCORE = 0.75;

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_SUMMARIZE_MODEL =
	process.env.DEFAULT_SUMMARIZE_MODEL ?? 'gpt-3.5-turbo-0125';
export const DEFAULT_TRANSLATE_MODEL =
	process.env.DEFAULT_TRANSLATE_MODEL ?? 'gpt-4o';
export const DEFAULT_TITLE_GENERATE_MODEL =
	process.env.DEFAULT_TITLE_GENERATE_MODEL ?? 'gpt-3.5-turbo-0125';
export const DEFAULT_CHECK_IMPORTANCE_MODEL =
	process.env.DEFAULT_CHECK_IMPORTANCE_MODEL ?? 'gpt-4o';
export const DEFAULT_SEARCH_QUERY_GENERATE_MODEL =
	process.env.DEFAULT_SEARCH_QUERY_GENERATE_MODEL ?? 'gpt-3.5-turbo-0125';

export const BOT_ALLOWED_ROLES_ID = ['1250437137522884678'];

export const FAVICON_BASE_URL =
	'https://www.google.com/s2/favicons?domain_url=';
