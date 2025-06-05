<script setup lang="ts">
const props = defineProps<{
	title: string;
	summary: string;
	link: string;
}>();
const toast = useToast();

const copyTitle = () => {
	navigator.clipboard.writeText(props.title);
	toast.add({ title: 'Title copied to clipboard' });
};
const copySummary = () => {
	navigator.clipboard.writeText(props.summary);
	toast.add({ title: 'Summary copied to clipboard' });
};
const copyLink = () => {
	navigator.clipboard.writeText(props.link);
	toast.add({ title: 'Link copied to clipboard' });
};
const copyWhole = () => {
	navigator.clipboard.writeText(
		`${props.title}\n\n${props.summary}\n\n${props.link}`,
	);
	toast.add({ title: 'Whole copied to clipboard' });
};
</script>

<template>
    <UPopover arrow>
        <UButton label="Copy Clipboard" color="neutral" variant="ghost" class="cursor-pointer" icon="i-hugeicons-copy-01"/>
        <template #content>
            <div class="flex flex-col gap-1 p-2 w-36">
            <UButton 
                label="Title"
                color="neutral"
                variant="ghost"
                class="cursor-pointer"
                icon="i-hugeicons-text"
                @click="copyTitle"
            />
            <UButton 
                label="Summary"
                color="neutral"
                variant="ghost"
                class="cursor-pointer"
                icon="i-hugeicons-text-centerline-left"
                @click="copySummary"
            />
            <UButton 
                label="Link"
                color="neutral"
                variant="ghost"
                class="cursor-pointer"
                icon="i-hugeicons-link-01"
                @click="copyLink"
            />
            <UButton 
                label="Whole"
                color="neutral"
                variant="ghost"
                class="cursor-pointer"
                icon="i-hugeicons-text-vertical-alignment"
                @click="copyWhole"
            />
            </div>
        </template>
    </UPopover>
</template>

<style scoped>

</style>