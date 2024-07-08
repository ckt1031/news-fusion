import type { fetchArticle } from '@/lib/db';
import { z } from 'zod';

export type ArticleFetchingReturnProps = Awaited<
	ReturnType<typeof fetchArticle>
>;

export const RegenerateLongSummarySchema = z.object({
	id: z.number(),
});
