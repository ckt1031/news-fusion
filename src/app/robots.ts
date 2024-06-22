import type { MetadataRoute } from 'next';
import { nextEnv } from './env';

export default function robots(): MetadataRoute.Robots {
	const ALL_AI_AGENTS = [
		'ChatGPT-User',
		'Applebot-Extended',
		'Bytespider',
		'CCBot',
		'ClaudeBot',
		'Diffbot',
		'FacebookBot',
		'Google-Extended',
		'GPTBot',
		'omgili',
		'Amazonbot',
		'Applebot',
		'PerplexityBot',
		'YouBot',
		'anthropic-ai',
		'Claude-Web',
		'cohere-ai',
	];

	const ALL_AI_RULES: MetadataRoute.Robots['rules'] = ALL_AI_AGENTS.map(
		(agent) => ({
			userAgent: agent,
			disallow: '/',
		}),
	);

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api', '/404', '/500', '/_next'],
			},
			...ALL_AI_RULES,
		],
		sitemap: `${nextEnv.SITE_URL}/sitemap.xml`,
		host: nextEnv.SITE_URL,
	};
}
