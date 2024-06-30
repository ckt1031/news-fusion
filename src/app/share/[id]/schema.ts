import type { getSharedArticle } from '@/lib/db';
import { z } from 'zod';

export type SharedArticleFetchingReturnProps = Awaited<
	ReturnType<typeof getSharedArticle>
>;

export const DeleteSchema = z.object({
	id: z.string(),
});
