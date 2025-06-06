<script setup lang="ts">
const props = defineProps<{
	imageURL: string;
}>();

const visibleRef = ref(false);
const indexRef = ref(0);

const showImg = (index: number) => {
	indexRef.value = index;
	visibleRef.value = true;
};
const onHide = () => {
	visibleRef.value = false;
};
</script>

<style scoped>

</style>

<template>
    <img
        :src="props.imageURL"
        class="rounded max-h-[90px] sm:max-h-[100px] md:max-h-[110px] float-right ml-3 mb-3 cursor-zoom-in"
        alt="Thumbnail"
        @click="() => showImg(0)"
    />
    <VueEasyLightbox
        :visible="visibleRef"
        :imgs="[props.imageURL]"
        :index="indexRef"
        @hide="onHide"
    />
</template>