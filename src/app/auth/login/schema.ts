import { z } from 'zod';

export const LoginActionSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	captchaToken: z.string().optional(),
});
