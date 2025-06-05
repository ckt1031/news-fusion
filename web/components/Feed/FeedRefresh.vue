<script setup lang="ts">
const props = defineProps<{
	refresh: () => void;
}>();
</script>

<template>
  <UTooltip text="Refresh Feed">
    <UButton
        icon="i-hugeicons-reload"
        label="Reload"
        color="neutral"
        variant="outline"
        title="Refresh Feed"
        @click="props.refresh"
        :ui="{ label: 'hidden sm:block' }"
    />
  </UTooltip>
</template>

<style scoped>

</style>