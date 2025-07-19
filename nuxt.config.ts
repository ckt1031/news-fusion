const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';
const protocol = SITE_DOMAIN.includes('localhost') ? 'http' : 'https';

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
		'/sitemap-index.xml': { prerender: true },
		'/rss': { prerender: true },

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
		url: `${protocol}://${SITE_DOMAIN}`,
		name: 'News Fusion',
		indexable: true,
	},
	robots: {
		allow: '/',
		disallow: '/404',
	},
	sitemap: {
		sitemapName: 'sitemap-index.xml',
		sources: ['/api/__sitemap__/urls'],
	},
	runtimeConfig: {
		public: {
			siteDomain: process.env.SITE_DOMAIN || 'localhost:3000',
		},
	},
});
