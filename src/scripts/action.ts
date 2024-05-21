/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { checkNews } from '@/lib/news';
import { envSchema } from '@/types/env';

const env = await envSchema.parseAsync(process.env);

await checkNews(env);
