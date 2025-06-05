<script setup lang="ts">
import type { Article } from '~~/db/types';

const props = defineProps<{
	entry: Article;
}>();
</script>

<style scoped>
</style>

<template>
  <p class="text-zinc-600 dark:text-zinc-400 font-serif">{{ props.entry.summary }}</p>
  <div class="flex flex-col sm:flex-row sm:items-center mt-3" translatable="false">
    <FeedPublisher :url="props.entry.link" :name="props.entry.publisher" class="mb-1 sm:mb-0 sm:mr-1"/>
    <FeedReadMore :link="props.entry.link"/>
    <FeedCopy :title="props.entry.title" :summary="props.entry.summary" :link="props.entry.link"/>
  </div>
</template>
