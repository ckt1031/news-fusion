import { z } from 'zod';

export const LoginActionSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	captchaToken: z.string().optional(),
});

export const ForgotPasswordActionSchema = z.object({
	email: z.string().email(),
	captchaToken: z.string().optional(),
});
