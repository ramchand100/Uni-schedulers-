import { z } from 'zod';

export const emailSchema = z.email('Enter a valid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores');
