<script setup lang="ts">
import dayjs from 'dayjs';
import { RSS_CATEGORIES } from '~~/config/sources';

const route = useRoute();
const category = RSS_CATEGORIES.find((c) => c.id === route.params.category);

if (!category) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Category Not Found',
	});
}

// Check if the date is valid and not older than 25 days
const _paramsDate = route.params.date as string;
const djsDate = dayjs(_paramsDate);

// Check if valid using dayjs
if (!djsDate.isValid()) {
	throw createError({
		statusCode: 400,
		statusMessage: `Invalid date format: ${_paramsDate}`,
	});
}

// Not older than 25 days, and not in the future (leave 1 day buffer due to timezone)
if (dayjs().diff(djsDate, 'day') > 25 || dayjs().diff(djsDate, 'day') < 0) {
	throw createError({
		statusCode: 400,
		statusMessage: `Date older than 25 days or in the future: ${_paramsDate}`,
	});
}

useHead({
	title: `${category.name} on ${_paramsDate}`,
	meta: [
		{
			name: 'description',
			content: `Latest news with ${category.name} topic on ${_paramsDate}`,
		},
	],
});
</script>

<template>
  <FeedPage/>
</template>

<style scoped>

</style>