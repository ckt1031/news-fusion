<script setup lang="ts">
const props = defineProps<{
	url: string;
	name: string;
}>();
const url = `https://www.google.com/s2/favicons?domain=${props.url}&sz=64`;
</script>

<style scoped>

</style>

<template>
  <div class="flex flex-row items-center gap-1.5">
    <img class="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800" alt="favicon" :src="url"/>
    <span class="text-zinc-400 dark:text-zinc-500 italic font-light">{{ props.name }}</span>
  </div>
</template>