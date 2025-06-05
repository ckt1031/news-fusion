<script setup lang="ts">
useHead({
	titleTemplate: (title) => (title ? `${title} - News Fusion` : 'News Fusion'),
	meta: [
		{
			name: 'description',
			content: 'The news aggregator for modern age',
		},
	],
});
</script>

<style>
html {
	scroll-behavior: smooth;
}
</style>

<template>
	<NuxtRouteAnnouncer/>
	<NuxtLoadingIndicator/>
	<UApp>
		<Global>
			<NuxtPage/>
		</Global>
	</UApp>
</template>