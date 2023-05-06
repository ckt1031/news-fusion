import SHA256 from 'crypto-js/sha256.js';

import type { RssSourceCheck } from '../models/RssFeedChecks';
import RssFeedChecks from '../models/RssFeedChecks';
import { defaultCache } from '../utils/cache';

// Cache of the last time a feed was checked, using node-cache
export class RssFeedChecksCache {
  private cache = defaultCache;

  public async get(key: {
    sourceURL: string;
    feedURL: string;
  }): Promise<RssSourceCheck | undefined> {
    const cacheKey = SHA256(
      JSON.stringify({
        sourceURL: key.sourceURL,
        feedURL: key.feedURL,
      }),
    ).toString();

    const cacheData: RssSourceCheck | undefined = this.cache.get(cacheKey);

    if (cacheData) {
      // use type RssSourceCheck
      return cacheData;
    }

    const response = await RssFeedChecks.findOne({
      sourceURL: key.sourceURL,
      feedURL: key.feedURL,
    });

    const returnData = response?.toObject();

    if (returnData) {
      this.cache.set(SHA256(cacheKey).toString(), returnData, 60 * 60 * 24); // 24 hours
    }

    return returnData;
  }

  public async set(data: Omit<RssSourceCheck, '_id'>) {
    const cacheKey = SHA256(
      JSON.stringify({
        sourceURL: data.sourceURL,
        feedURL: data.feedURL,
      }),
    ).toString();

    const newData = new RssFeedChecks({
      sourceURL: data.sourceURL,
      feedURL: data.feedURL,
      lastChecked: Date.now(),
    });

    await newData.save();

    this.cache.set(cacheKey, newData.toObject() as RssSourceCheck, 60 * 60 * 24); // 24 hours
  }
}
