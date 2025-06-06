<script setup lang="ts">
const props = defineProps<{
	imageURL: string;
}>();

const visibleRef = ref(false);
const indexRef = ref(0);
const imageLoadedSuccessfully = ref(true); // New reactive variable

const showImg = (index: number) => {
	indexRef.value = index;
	visibleRef.value = true;
};

const onHide = () => {
	visibleRef.value = false;
};

// New function to handle image loading errors
const handleImageError = () => {
	imageLoadedSuccessfully.value = false;
};
</script>

<style scoped>
/* Your existing styles */
</style>

<template>
    <!-- Conditionally render the img tag based on imageLoadedSuccessfully -->
    <img
        v-if="imageLoadedSuccessfully"
        :src="props.imageURL"
        class="rounded max-h-[90px] sm:max-h-[100px] md:max-h-[110px] float-right ml-3 mb-3 cursor-zoom-in"
        alt="Thumbnail"
        @click="() => showImg(0)"
        @error="handleImageError"
    />
    <VueEasyLightbox
        v-if="imageLoadedSuccessfully"
        :visible="visibleRef"
        :imgs="[props.imageURL]"
        :index="indexRef"
        @hide="onHide"
    />
</template>
