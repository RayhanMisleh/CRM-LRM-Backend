import { Cycle, ServiceBillingStatus } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const serviceBillingSortableFields = [
  'status',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
] as const;

export const listServiceBillingsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(serviceBillingSortableFields).optional(),
    status: z.nativeEnum(ServiceBillingStatus).optional(),
    clientServiceId: z.string().uuid().optional(),
  }),
);

const serviceBillingBaseSchema = z.object({
  clientServiceId: z.string({ required_error: 'Serviço do cliente é obrigatório' }).uuid(),
  externalId: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ServiceBillingStatus).optional(),
  cycle: z.nativeEnum(Cycle).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  monthlyAmount: decimalSchema.optional(),
  currency: z.string().trim().min(1).default('BRL'),
  adjustmentIndex: decimalSchema.optional(),
  notes: z.string().trim().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

const validatePeriod = (data: { startDate?: Date; endDate?: Date }) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
};

export const createServiceBillingSchema = serviceBillingBaseSchema
  .extend({
    monthlyAmount: decimalSchema,
  })
  .refine(validatePeriod, {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  });

export const updateServiceBillingSchema = serviceBillingBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  })
  .refine(validatePeriod, {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  });

export type ListServiceBillingsQuery = z.infer<typeof listServiceBillingsQuerySchema>;
export type CreateServiceBillingInput = z.infer<typeof createServiceBillingSchema>;
export type UpdateServiceBillingInput = z.infer<typeof updateServiceBillingSchema>;
