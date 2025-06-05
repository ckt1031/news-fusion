<script setup lang="ts">
import { RSS_CATEGORIES } from '~~/config/sources';

const route = useRoute();
const category = RSS_CATEGORIES.find((c) => c.id === route.params.category);

if (!category) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Category Not Found',
	});
}

useHead({
	title: category.name,
	meta: [
		{
			name: 'description',
			content: `Latest news with ${category.name} topic.`,
		},
	],
});
</script>

<template>
  <FeedPage/>
</template>

<style scoped>

</style>