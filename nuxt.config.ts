import { defineNuxtConfig } from 'nuxt/config';
import type { NuxtCustomSchema } from './.nuxt/schema/nuxt.schema.d.js';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	srcDir: 'web',
	compatibilityDate: '2024-11-01',
	components: [
		'~/components',
		'~/components/Feed',
		'~/components/Feed/Item',
		'~/components/Layout',
	],
	modules: ['@nuxt/ui', '@nuxt/icon', 'nuxt-easy-lightbox'],
	css: ['~/assets/css/main.css'],
	routeRules: {
		'/': { isr: 300 },
		'/category/**': { isr: 300 },
		'/about': { prerender: true },

		// API routes
		'/api/feeds/**': { cors: true, isr: 60 },
		'/api/data/feed': { cors: false, isr: 300 },
	},
	icon: {
		serverBundle: {
			collections: ['lucide', 'hugeicons'],
		},
	},
} as NuxtCustomSchema);
