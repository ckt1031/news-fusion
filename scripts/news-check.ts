import 'dotenv/config';

/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { exit } from 'node:process';
import { ALL_RSS_CATAGORIES } from '@/config/news-sources';
import { getLangfuse } from '@/lib/llm/api';
import checkRSS from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';
import consola from 'consola';

consola.box('News Bot Background Checking Started');

const env = await envSchema.parseAsync(process.env);

consola.success('Environment variables are correctly configured');

for (const catagory of ALL_RSS_CATAGORIES) {
	await checkRSS({
		env,
		catagory,
	});
}

consola.success('All RSS checked');

await getLangfuse(env).shutdownAsync();

consola.success('Langfuse shutdown');

exit(0);
