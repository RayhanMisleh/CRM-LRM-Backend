import { Cycle } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const planSortableFields = ['name', 'price', 'billingCycle', 'createdAt', 'updatedAt'] as const;

export const listPlansQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(planSortableFields).optional(),
    billingCycle: z.nativeEnum(Cycle).optional(),
  })
);

const planBaseSchema = z.object({
  externalId: z.string().trim().min(1).optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(1),
  description: z.string().trim().optional(),
  price: decimalSchema.optional(),
  currency: z.string().trim().min(1).default('BRL'),
  billingCycle: z.nativeEnum(Cycle).optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createPlanSchema = planBaseSchema.extend({
  price: decimalSchema,
});

export const updatePlanSchema = planBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe ao menos um campo para atualização' }
);

export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
