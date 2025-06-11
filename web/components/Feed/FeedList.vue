<script setup lang="ts">
import Fuse from 'fuse.js';
import sAgo from 's-ago';
import type { Article } from '~~/db/types';
import type { NuxtAPIFeedDataResponse } from '~~/web/lib/types';

const route = useRoute();
const category = (route.params.category as string) ?? 'world';
const date = route.params.date as string | undefined;

const { status, data, refresh } = await useLazyFetch<NuxtAPIFeedDataResponse>(
	'/api/data/feed',
	{ query: { date, category } },
);

const serverUpdatedAt = computed(() => {
	if (!data.value?.timestamp) return null;

	return {
		ago: sAgo(new Date(data.value.timestamp)),
		dateString: new Date(data.value.timestamp).toLocaleString(),
	};
});

const input = ref('');
const result = computed(() => {
	const entries = (data?.value?.articles ?? []) as Article[];

	const fuse = new Fuse(entries, {
		threshold: 0.5,
		keys: ['title', 'content', 'link', 'author.name'],
		includeMatches: true,
	});

	if (toValue(input).length === 0) return entries;

	return fuse.search(toValue(input)).map((i) => i.item);
});

const centerBox = 'flex flex-row gap-1.5 justify-center items-center h-32';
</script>

<style scoped>
</style>

<template>
  <div v-if="status === 'pending'" :class="centerBox">
    <UIcon name="i-hugeicons-reload" class="w-5 h-5 animate-spin"/>
    Loading...
  </div>
  <div v-else-if="status === 'error'" :class="centerBox">
    <UIcon name="i-hugeicons-bug-01" class="w-5 h-5"/>
    Error fetching data
  </div>
  <div v-else-if="data && data.error" :class="centerBox">
    <UIcon name="i-hugeicons-bug-01" class="w-5 h-5"/>
    {{ data.error }}
  </div>
  <div
      v-else-if="data && data.articles.length > 0"
  >
    <div class="flex flex-col sm:flex-row sm:items-center mb-4 gap-2">
      <p class="text-zinc-700 dark:text-zinc-300 font-light">
        Total: {{ data.articles.length }} articles
      </p>
      <div class="flex flex-row gap-2">
        <UInput
            icon="i-hugeicons-search-01"
            color="neutral"
            :trailing="false"
            placeholder="Search..."
            v-model="input"
        />
        <FeedRefresh :refresh="refresh"/>
      </div>
    </div>
    <div class="mb-3" v-if="serverUpdatedAt">
      <p class="text-zinc-600 dark:text-zinc-400 font-light italic">
        Data updated: {{ serverUpdatedAt.ago }} <span class="hidden sm:inline dark:text-zinc-500">({{ serverUpdatedAt.dateString }})</span>
      </p>
    </div>
    <div class="flex flex-col divide-y divide-zinc-300 dark:divide-zinc-700" v-if="result.length > 0">
      <div v-for="d in result" :key="d.id" class="py-2">
        <FeedItem :entry="d"/>
      </div>
    </div>
    <div v-else class="center-box">
      <UIcon name="i-hugeicons-search-remove" class="w-5 h-5"/>
      No search results
    </div>
  </div>
  <div v-else class="flex flex-col gap-3 items-center">
    <div :class="centerBox">
      <UIcon name="i-hugeicons-no-meeting-room" class="w-5 h-5"/>
      No news found
    </div>
  </div>
</template>
