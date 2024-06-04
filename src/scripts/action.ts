/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { ALL_RSS_CATAGORIES } from '@/config/news-sources';
import { getLangfuse } from '@/lib/llm/api';
import checkRSS from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';
import { exit } from 'node:process';

const env = await envSchema.parseAsync(process.env);

for (const catagory of ALL_RSS_CATAGORIES) {
	await checkRSS({
		env,
		catagory,
	});
}

await getLangfuse(env).shutdownAsync();

exit(0);
