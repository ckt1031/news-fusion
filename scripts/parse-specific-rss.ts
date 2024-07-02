import { EARLIEST_HOURS } from '@/config/news-sources';
import logging from '@/lib/console';
import { parseRSS } from '@/lib/news/parse-news';

const rssURL = process.argv[2];

if (!rssURL || !rssURL.startsWith('http')) {
	logging.error('Please provide the RSS URL');
	process.exit(1);
}

await parseRSS(rssURL, EARLIEST_HOURS);
