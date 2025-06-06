<script setup lang="ts">
import type { Article } from '~~/db/types';

const props = defineProps<{
	entry: Article;
}>();
</script>

<style scoped>
</style>

<template>
  <FeedPublisher :url="props.entry.link" :name="props.entry.publisher" class="mt-1 mb-2"/>
  <div class="relative mx-auto">
    <FeedItemThumbnail :imageURL="props.entry.thumbnail" v-if="props.entry.thumbnail && props.entry.thumbnail.length > 0" />
    <p class="text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">{{ props.entry.summary }}</p>
    <div class="clear-both"></div>
  </div>
  <a class="underline" :href="props.entry.link" target="_blank">
    Read More
  </a>
</template>
