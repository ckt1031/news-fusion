<script setup lang="ts">
const props = defineProps<{
	imageURL: string;
}>();
</script>

<style scoped>

</style>

<template>
    <img
        :src="props.imageURL"
        class="rounded max-h-[90px] sm:max-h-[100px] md:max-h-[110px] float-right ml-3 mb-3"
        alt="Thumbnail"
    />
</template>