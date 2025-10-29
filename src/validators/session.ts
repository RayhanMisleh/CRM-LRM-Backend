import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string({ required_error: 'Email é obrigatório' }).email(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().trim().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  empresaId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email é obrigatório' }).email(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export const logoutSchema = z.object({});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
