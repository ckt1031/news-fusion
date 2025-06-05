<script setup lang="ts">
import type { Article } from '~~/db/types';

const props = defineProps<{
	entry: Article;
}>();

const openContent = useState(`open-${props.entry.id}`, () => 'false');

const onClick = () => {
	openContent.value = openContent.value === 'true' ? 'false' : 'true';
};
</script>

<style scoped>
</style>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center justify-between gap-4">
      <button class="text-left cursor-pointer" @click="onClick">
        <span class="text-zinc-800 dark:text-zinc-200 font-medium" translatable="true">
          {{ props.entry.title }}
        </span>
      </button>
      <FeedDate :date="props.entry.publishedAt"/>
    </div>
    <div v-if="openContent === 'true'" class="my-2" translatable="true">
      <LazyFeedItemDetail :entry="props.entry"/>
    </div>
  </div>
</template>