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
	modules: [
		'@nuxt/ui',
		'@nuxt/icon',
		'@nuxtjs/robots',
		'@nuxtjs/sitemap',
		'nuxt-easy-lightbox',
	],
	css: ['~/assets/css/main.css'],
	routeRules: {
		'/': { isr: 300 },
		'/category/**': { isr: 300 },
		'/about': { prerender: true },
		'/sitemap.xml': { prerender: true },

		// API routes
		'/api/feeds/**': { cors: true },
		'/api/data/feed': { cors: false },
	},
	icon: {
		serverBundle: 'local',
		clientBundle: {
			scan: {
				globInclude: ['web/**/*.vue'],
				globExclude: ['node_modules', 'dist'],
			},
		},
	},
	site: {
		url: `http://${process.env.SITE_DOMAIN}`,
		name: 'News Fusion',
		indexable: true,
	},
	robots: {
		allow: '/',
	},
	sitemap: {
		sources: ['/api/__sitemap__/urls'],
	},
});
