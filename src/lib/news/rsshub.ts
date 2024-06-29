import type { ServerEnv } from '@/types/env';
import logging from '../console';

export function getRSSHubURL(env: ServerEnv, url: string) {
	if (!url.includes('{RSSHUB}')) return url;

	if (!env.RSSHUB_BASE_URL) {
		logging.info(
			`Skipping RSSHub: ${url.replace(
				'{RSSHUB}',
				'',
			)} because RSSHUB_BASE_URL is not set`,
		);
		return undefined;
	}

	const accessKey = env.RSSHUB_ACCESS_KEY
		? `?key=${env.RSSHUB_ACCESS_KEY}`
		: '';

	return `${url.replace('{RSSHUB}', env.RSSHUB_BASE_URL)}${accessKey}`;
}
