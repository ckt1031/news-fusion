<script setup lang="ts">
import type { Article } from '~~/db/types';

const props = defineProps<{
	entry: Article;
}>();
</script>

<style scoped>
</style>

<template>
  <FeedPublisher :url="props.entry.link" :name="props.entry.publisher" class="mb-2"/>
  <p class="text-zinc-600 dark:text-zinc-400 font-serif mb-2">{{ props.entry.summary }}</p>
  <a class="underline" :href="props.entry.link" target="_blank">
    Read More
  </a>
</template>
