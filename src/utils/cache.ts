import NodeCache from 'node-cache';

const feedChecksCache = new NodeCache();
const feedSourcesCache = new NodeCache();
const feedSourcePaginationCache = new NodeCache();

export { feedChecksCache, feedSourcePaginationCache, feedSourcesCache };
