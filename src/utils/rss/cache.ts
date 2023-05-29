import sha256 from 'crypto-js/sha256.js';

import type { RssSourceCheck } from '@/models/RssFeedChecks';
import RssFeedChecks from '@/models/RssFeedChecks';
import type { RssFeedSource } from '@/models/RssFeedSources';
import RssFeedSources from '@/models/RssFeedSources';
import type { RssFeedTag } from '@/models/RssFeedTags';
import RssFeedTags from '@/models/RssFeedTags';
import { feedChecksCache, feedSourcesCache } from '@/utils/cache';

interface CacRssFeedChecksCacheKey {
  sourceURL: string;
  feedURL: string;
}

// Cache of the last time a feed was checked, using node-cache
export class RssFeedChecksCache {
  private cache = feedChecksCache;

  public async get(key: CacRssFeedChecksCacheKey): Promise<RssSourceCheck | undefined> {
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

  private async getFromDatabase(key: CacRssFeedChecksCacheKey) {
    return RssFeedChecks.findOne({
      sourceURL: key.sourceURL,
      feedURL: key.feedURL,
    });
  }

  private getCacheKey(key: CacRssFeedChecksCacheKey) {
    return sha256(`${key.sourceURL}:${key.feedURL}`).toString();
  }
}

// use const allSources = await RssFeedSources.find().populate('tag');
export class RssSourcesCache {
  private cache = feedSourcesCache;

  public async getAllSources(guildId: string): Promise<RssFeedSource[] | undefined> {
    // Get all sources with all tags.
    const sources: RssFeedSource[] = [];

    const tags = await this.getTags(guildId);

    if (!tags) return undefined;

    for (const tag of tags) {
      const sourcesForTag = await this.getSources(guildId, tag.name);

      if (!sourcesForTag) continue;

      sources.push(...sourcesForTag);
    }

    return sources;
  }

  public async getTags(guildId: string): Promise<RssFeedTag[] | undefined> {
    const cacheData: RssFeedTag[] | undefined = this.cache.get(guildId);

    // If we have cache data, return it.
    if (cacheData) return cacheData;

    const response = await this.getFreshTagsFromDatabase(guildId);

    // If we don't have a response, return undefined.
    if (!response) return undefined;

    // Set the cache for 24 hours.
    this.cache.set(guildId, response, 60 * 60 * 24);

    return response;
  }

  public async getSingleTag(guildId: string, tagName: string): Promise<RssFeedTag | undefined> {
    const key = `${guildId}_tags`;
    const cacheData = await this.getTags(guildId);

    // If we have cache data, return it.
    if (cacheData?.some(tag => tag.name === tagName)) {
      return cacheData.find(tag => tag.name === tagName);
    }

    const response = await this.getFreshTagsFromDatabase(guildId);

    // If we don't have a response, return undefined.
    if (!response) return undefined;

    // Set the cache for 24 hours.
    this.cache.set(key, response, 60 * 60 * 24);

    return response.find(tag => tag.name === tagName);
  }

  public async addTag(guildId: string, data: Omit<RssFeedTag, '_id'>) {
    const key = `${guildId}_tags`;
    const cacheData = await this.getTags(guildId);

    // Set to Database
    const savedData = await new RssFeedTags(data).save();

    // If we have cache data, add the new tag to it.
    if (cacheData) {
      cacheData.push(savedData);
      this.cache.set(key, cacheData, 60 * 60 * 24);
    }
  }

  public async updateTag(guildId: string, tagName: string, data: Partial<RssFeedTag>) {
    const key = `${guildId}_tags`;
    const cacheData = await this.getTags(guildId);

    // Update the tag in the database.
    if (cacheData) {
      const newData = cacheData.map(tag => {
        if (tag.name === tagName) {
          return {
            ...tag,
            ...data,
          };
        }

        return tag;
      });

      this.cache.set(key, newData, 60 * 60 * 24);
    }

    // Update the tag in the database.
    await RssFeedTags.findOneAndUpdate({ serverId: guildId, name: tagName }, data);
  }

  public async removeTag(serverId: string, tagName: string) {
    const key = `${serverId}_tags`;
    const cacheData = await this.getTags(serverId);

    // If we have cache data, remove the tag from it.
    if (cacheData) {
      const newData = cacheData.filter(tag => tag.name !== tagName);
      this.cache.set(key, newData, 60 * 60 * 24);
    }

    // Remove the tag from the database.
    await RssFeedTags.findOneAndDelete({ serverId, name: tagName });
  }

  public async getSources(guildId: string, tagName: string): Promise<RssFeedSource[] | undefined> {
    const key = `${guildId}_${tagName}_sources`;
    const cacheData: RssFeedSource[] | undefined = this.cache.get(key);

    // If we have cache data, return it.
    if (cacheData) return cacheData;

    const response = await this.getFreshSourcesFromDatabase(guildId, tagName);

    // If we don't have a response, return undefined.
    if (!response) return undefined;

    // Set the cache for 24 hours.
    this.cache.set(key, response, 60 * 60 * 24);

    return response;
  }

  public async getSingleSource(
    guildId: string,
    tagName: string,
    sourceName: string,
  ): Promise<RssFeedSource | undefined> {
    const key = `${guildId}_${tagName}_sources`;

    const cacheData: RssFeedSource[] | undefined = this.cache.get(key);

    // If we have cache data, return it.
    if (cacheData?.some(source => source.name === sourceName)) {
      return cacheData.find(source => source.name === sourceName);
    }

    const response = await this.getFreshSourcesFromDatabase(guildId, tagName);

    // If we don't have a response, return undefined.
    if (!response) return undefined;

    // Set the cache for 24 hours.
    this.cache.set(key, response, 60 * 60 * 24);

    return response.find(source => source.name === sourceName);
  }

  public async addSource(guildId: string, tagName: string, data: Omit<RssFeedSource, '_id'>) {
    const key = `${guildId}_${tagName}_sources`;
    const cacheData = await this.getSources(guildId, tagName);

    // Add the new source to the database.
    const newData = await new RssFeedSources(data).save();

    // If we have cache data, add the new source to it.
    if (cacheData) {
      cacheData.push(newData);
      this.cache.set(key, cacheData, 60 * 60 * 24);
    }
  }

  public async updateSource(
    guildId: string,
    tagName: string,
    sourceName: string,
    data: Partial<RssFeedSource>,
  ) {
    const key = `${guildId}_${tagName}_sources`;
    const cacheData = await this.getSources(guildId, tagName);

    // Update the source in the database.
    if (cacheData) {
      const newData = cacheData.map(source => {
        if (source.name === sourceName) {
          return {
            ...source,
            ...data,
          };
        }

        return source;
      });

      this.cache.set(key, newData, 60 * 60 * 24);
    }

    // Update the source in the database.
    await RssFeedSources.findByIdAndUpdate({ serverId: guildId, name: sourceName }, data);
  }

  public async removeSource(serverId: string, tag: string, sourceName: string) {
    const key = `${serverId}_${tag}_sources`;
    const cacheData = await this.getSources(serverId, tag);

    // If we have cache data, remove the source from it.
    if (cacheData) {
      const newData = cacheData.filter(source => source.name !== sourceName);
      this.cache.set(key, newData, 60 * 60 * 24);
    }

    // Remove the source from the database.
    await RssFeedSources.findOneAndDelete({ serverId, name: sourceName });
  }

  public async removeAllSources(serverId: string, tag: string) {
    const key = `${serverId}_${tag}_sources`;

    // Remove the source from the database.
    await RssFeedSources.deleteMany({ serverId, 'tag.name': tag });

    // Remove the cache.
    this.cache.del(key);

    // Remove the tag from the database.
    await this.removeTag(serverId, tag);
  }

  private async getFreshSourcesFromDatabase(
    serverId: string,
    tagName: string,
  ): Promise<RssFeedSource[] | undefined> {
    return await RssFeedSources.find({ serverId, 'tag.name': tagName }).populate('tag');
  }

  private async getFreshTagsFromDatabase(serverId: string): Promise<RssFeedTag[] | undefined> {
    return await RssFeedTags.find({ serverId });
  }
}
