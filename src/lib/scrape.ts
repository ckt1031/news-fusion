import type { ServerEnv } from '@/types/env';
import { z } from 'zod';

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ServerEnv, url: string) {
	const extractAPIResponse = await fetch(
		`${env.TOOLS_API_BASE_URL}/v1/web/extract/markdown?url=${url}`,
		{
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${env.TOOLS_API_KEY}`,
			},
		},
	);

	if (!extractAPIResponse.ok) {
		throw new Error(`Failed to extract content: ${url}`);
	}

	const schema = z.object({
		content: z.string(),
	});

	return (await schema.parseAsync(await extractAPIResponse.json())).content;
}
