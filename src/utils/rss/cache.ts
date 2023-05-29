import sha256 from 'crypto-js/sha256.js';

import type { RssSourceCheck } from '@/models/RssFeedChecks';
import RssFeedChecks from '@/models/RssFeedChecks';
import { feedCheckCache } from '@/utils/cache';

interface CacheKey {
  sourceURL: string;
  feedURL: string;
}

// Cache of the last time a feed was checked, using node-cache
export class RssFeedChecksCache {
  private cache = feedCheckCache;

  public async get(key: CacheKey): Promise<RssSourceCheck | undefined> {
    const cacheKey = this.getCacheKey(key);
    const cacheData: RssSourceCheck | undefined = this.cache.get(cacheKey);

    // If we have cache data, return it.
    if (cacheData) return cacheData;

    const response = await this.getFromDatabase(key);

    // If we don't have a response, return undefined.
    if (!response) return undefined;

    const returnData = response.toObject();

    // Set the cache for 24 hours.
    this.cache.set(cacheKey, returnData, 60 * 60 * 24);

    return returnData;
  }

  public async set(data: Omit<RssSourceCheck, '_id'>) {
    const cacheKey = this.getCacheKey(data);

    const newData = new RssFeedChecks({
      sourceURL: data.sourceURL,
      feedURL: data.feedURL,
      lastChecked: Date.now(),
    });

    await newData.save();

    this.cache.set(cacheKey, newData.toObject() as RssSourceCheck, 60 * 60 * 24); // 24 hours
  }

  private async getFromDatabase(key: CacheKey) {
    return RssFeedChecks.findOne({
      sourceURL: key.sourceURL,
      feedURL: key.feedURL,
    });
  }

  private getCacheKey(key: CacheKey) {
    return sha256(`${key.sourceURL}:${key.feedURL}`).toString();
  }
}
