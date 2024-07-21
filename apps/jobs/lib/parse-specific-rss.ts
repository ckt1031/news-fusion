import { EARLIEST_HOURS } from '@ckt1031/config';
import { parseRSS } from '@ckt1031/news';
import { logging } from '@ckt1031/utils';

const rssURL = process.argv[2];

if (!rssURL || !rssURL.startsWith('http')) {
	logging.error('Please provide the RSS URL');
	process.exit(1);
}

await parseRSS(rssURL, EARLIEST_HOURS);
