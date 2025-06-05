<script setup lang="ts">
const props = defineProps<{
	link: string;
}>();
</script>

<template>
  <UButton
    translatable="false"
    label="Read More"
    color="neutral"
    variant="ghost"
    class="cursor-pointer"
    :href="props.link"
    target="_blank"
    icon="i-hugeicons-link-square-02"
  />
</template>

<style scoped>

</style>