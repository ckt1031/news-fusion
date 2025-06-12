<script setup lang="ts">
import { RSS_CATEGORIES } from '~~/config/sources';

const SITE_DOMAIN = useRuntimeConfig().public.siteDomain;
const protocol = SITE_DOMAIN.includes('localhost') ? 'http' : 'https';

useHead({
	title: 'RSS Feed',
	meta: [
		{
			name: 'description',
			content: 'RSS feed for News Fusion',
		},
	],
});
</script>

<style scoped>
@reference "../assets/css/main.css";

code {
    @apply bg-zinc-100 dark:bg-zinc-800 rounded-md px-1 py-0.5;
}
</style>

<template>
    <article class="flex flex-col gap-3 text-zinc-700 dark:text-zinc-400 pt-4 mb-10">
        <p>
            We provide RSS feed for aggregated news for you to read in your favorite RSS reader.
        </p>
        <p>
            The RSS feed is updated every <i>5 minutes</i> and with <i>25 days</i> of history.
            <br>
            Default format is RSS, but you can also use Atom or JSON by adding <code>.atom</code> or <code>.json</code> to the end of the URL.
        </p>
        <!-- Points -->
        <ul class="list-disc list-inside flex flex-col gap-2">
            <li class="flex md:flex-row flex-col justify-between md:items-center gap-2">
                <strong>All categories</strong>
                <code><a :href="`${protocol}://${SITE_DOMAIN}/api/feeds/all`" target="_blank">
                    {{ protocol }}://{{ SITE_DOMAIN }}/api/feeds/all
                </a></code>
            </li>
            <li v-for="category in RSS_CATEGORIES" :key="category.id" class="flex md:flex-row flex-col justify-between md:items-center gap-2">
                <strong>{{ category.name }}</strong>
                <code><a :href="`${protocol}://${SITE_DOMAIN}/api/feeds/${category.id}`" target="_blank">
                    {{ protocol }}://{{ SITE_DOMAIN }}/api/feeds/{{ category.id }}
                </a></code>
            </li>
        </ul>
    </article>
</template>