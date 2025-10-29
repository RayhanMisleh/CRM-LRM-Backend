import { Cycle, ServiceCategory } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const serviceTemplateSortableFields = [
  'name',
  'baseMonthlyFee',
  'defaultBillingCycle',
  'createdAt',
  'updatedAt',
] as const;

export const listServiceTemplatesQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(serviceTemplateSortableFields).optional(),
    category: z.nativeEnum(ServiceCategory).optional(),
  }),
);

const serviceTemplateBaseSchema = z.object({
  externalId: z.string().trim().min(1).optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(1),
  category: z.nativeEnum(ServiceCategory).optional(),
  description: z.string().trim().optional(),
  baseMonthlyFee: decimalSchema.optional(),
  setupFee: decimalSchema.optional(),
  defaultBillingCycle: z.nativeEnum(Cycle).optional(),
  deliverables: z.string().trim().optional(),
  stack: z.string().trim().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createServiceTemplateSchema = serviceTemplateBaseSchema;

export const updateServiceTemplateSchema = serviceTemplateBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListServiceTemplatesQuery = z.infer<typeof listServiceTemplatesQuerySchema>;
export type CreateServiceTemplateInput = z.infer<typeof createServiceTemplateSchema>;
export type UpdateServiceTemplateInput = z.infer<typeof updateServiceTemplateSchema>;
