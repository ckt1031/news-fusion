<script setup lang="ts">
const props = defineProps<{
	url: string;
	name: string;
}>();
const url = `https://www.google.com/s2/favicons?domain=${props.url}&sz=64`;
</script>

<template>
  <div class="flex flex-row items-center gap-1 px-2 py-1 border-1 border-zinc-300 dark:border-zinc-700 rounded-lg">
    <img class="w-4 h-4" alt="favicon" :src="url"/>
    <span class="text-zinc-500 dark:text-zinc-400">{{ props.name }}</span>
  </div>
</template>

<style scoped>

</style>