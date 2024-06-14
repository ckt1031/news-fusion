import { z } from 'zod';

export const LoginActionSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	captchaToken: z.string().optional(),
});
