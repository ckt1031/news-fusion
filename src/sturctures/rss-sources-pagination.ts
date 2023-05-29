import type { RssFeedSource } from '@/models/RssFeedSources';
import type { RssFeedTag } from '@/models/RssFeedTags';

export interface RssSourcePaginationCache {
  currentPage: number;
  selectedTag: RssFeedTag;
  rssFeedSources: RssFeedSource[];
}
