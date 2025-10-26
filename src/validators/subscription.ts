import { ContractStatus, Cycle } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject } from './common';

const subscriptionSortableFields = [
  'status',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
] as const;

const allowedSubscriptionStatuses = [
  ContractStatus.PENDING,
  ContractStatus.ACTIVE,
  ContractStatus.PAUSED,
  ContractStatus.CANCELLED,
  ContractStatus.TERMINATED,
] as const;

export const listSubscriptionsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(subscriptionSortableFields).optional(),
    status: z.enum(allowedSubscriptionStatuses).optional(),
    clientId: z.string().uuid().optional(),
    planId: z.string().uuid().optional(),
  })
);

const subscriptionBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  planId: z.string({ required_error: 'Plano é obrigatório' }).uuid(),
  contractId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  status: z.enum(allowedSubscriptionStatuses).optional(),
  cycle: z.nativeEnum(Cycle).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createSubscriptionSchema = subscriptionBaseSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'Data de término deve ser posterior à data de início', path: ['endDate'] }
);

export const updateSubscriptionSchema = subscriptionBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Data de término deve ser posterior à data de início', path: ['endDate'] }
  );

export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
