import NodeCache from 'node-cache';

const feedCheckCache = new NodeCache();

const feedSourcePaginationCache = new NodeCache();

export { feedCheckCache, feedSourcePaginationCache };
