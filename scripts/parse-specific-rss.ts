import { EARLIEST_HOURS } from '@/config/news-sources';
import { parseRSS } from '@/lib/parse-news';

const rssURL = process.argv[2];

if (!rssURL || !rssURL.startsWith('http')) {
	console.error('Please provide the RSS URL');
	process.exit(1);
}

await parseRSS(rssURL, EARLIEST_HOURS);
