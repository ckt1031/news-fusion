import { z } from 'zod';
import type { ServerEnv } from '../types/env';

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ServerEnv, url: string) {
	const extractAPIResponse = await fetch(
		`${env.TOOLS_API_BASE_URL}/web/extract/markdown?url=${url}`,
		{
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${env.TOOLS_API_KEY}`,
			},
		},
	);

	if (!extractAPIResponse.ok) {
		throw new Error('Failed to extract content');
	}

	const schema = z.object({
		content: z.string(),
	});

	return (await schema.parseAsync(await extractAPIResponse.json())).content;
}
