/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { exit } from 'node:process';
import { ALL_RSS_CATAGORIES, type RSSCatacory } from '@/config/news-sources';
import { getLangfuse } from '@/lib/llm/api';
import checkRSS from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';
import consola from 'consola';

consola.box('News Bot Background Checking Started');

const env = await envSchema.parseAsync(process.env);

/**
 * Run this script with specific RSS URL to check only that RSS
 * Format: CATAGORY_NAME DISCORD_CHANNEL_ID RSS_URL
 *
 */

const [specificCatagoryName, specificDiscordChannelId, specificRSS] = [
	process.argv[2],
	process.argv[3],
	process.argv[4],
];

if (specificRSS && (!specificCatagoryName || !specificDiscordChannelId)) {
	consola.error(
		'Please provide the RSS URL, Catagory Name and Discord Channel ID',
	);
	exit(1);
}

consola.success('Environment variables are correctly configured');

const allCatagories = specificRSS
	? ([
			{
				discordChannelId: specificDiscordChannelId as string,
				name: specificCatagoryName as RSSCatacory['name'],
				channels: [specificRSS as string],
			},
		] satisfies RSSCatacory[])
	: ALL_RSS_CATAGORIES;

for (const catagory of allCatagories) {
	await checkRSS({
		env,
		catagory,
	});
}

consola.success('All RSS checked');

await getLangfuse(env).shutdownAsync();

consola.success('Langfuse shutdown');

exit(0);
