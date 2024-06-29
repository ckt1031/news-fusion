import { z } from 'zod';

export const SearchSchema = z.object({
	search: z.string().min(3),
	documents: z.array(z.string().min(3)),
});
