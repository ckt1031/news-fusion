import { MUST_READ_RSS_LIST, type RSS_CATEGORY } from './config/news-sources';
import { parseRSS } from './lib/parse-news';

for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
	for (const rss of MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]) {
		console.log(rss);
		await parseRSS(rss);
	}
}
