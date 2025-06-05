<script setup lang="ts">
import dayjs from 'dayjs';

const props = defineProps<{
	date: Date;
}>();

const sAgo = (date: Date) => {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	if (seconds < 60) return seconds > 0 ? `${seconds}s` : 'now';

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;

	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d`;

	const weeks = Math.floor(days / 7);
	if (weeks < 4) return `${weeks}w`;

	const months = Math.floor(days / 30); // Approximation for months
	if (months < 12) return `${months}m`;

	const years = Math.floor(days / 365); // Approximation for years
	return `${years}y`;
};

const dateObject = dayjs(props.date);
const dateString = dateObject.format('MMM D, YYYY (HH:mm)');
const dateAgo = sAgo(dateObject.toDate());
</script>

<template>
  <UTooltip arrow :text="dateString" :content="{ align: 'center', side: 'left' }">
    <p class="text-zinc-500 dark:text-zinc-400" translatable="false">
      {{ dateAgo }}
    </p>
  </UTooltip>
</template>

<style scoped>

</style>