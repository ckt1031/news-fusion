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
  <div class="flex flex-row items-center gap-1">
    <img class="w-4 h-4 rounded-full" alt="favicon" :src="url"/>
    <span class="text-zinc-500 dark:text-zinc-400">{{ props.name }}</span>
  </div>
</template>