import { ExpenseKind, Frequency } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const recurringExpenseSortableFields = [
  'title',
  'amount',
  'frequency',
  'nextOccurrence',
  'createdAt',
  'updatedAt',
] as const;

export const listRecurringExpensesQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(recurringExpenseSortableFields).optional(),
    frequency: z.nativeEnum(Frequency).optional(),
    kind: z.nativeEnum(ExpenseKind).optional(),
    clientId: z.string().uuid().optional(),
    subscriptionId: z.string().uuid().optional(),
  })
);

const recurringExpenseBaseSchema = z.object({
  clientId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(1),
  description: z.string().trim().optional(),
  amount: decimalSchema,
  currency: z.string().trim().min(1).default('BRL'),
  kind: z.nativeEnum(ExpenseKind).optional(),
  frequency: z.nativeEnum(Frequency).optional(),
  nextOccurrence: z.coerce.date().optional(),
  lastOccurrence: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createRecurringExpenseSchema = recurringExpenseBaseSchema;

export const updateRecurringExpenseSchema = recurringExpenseBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListRecurringExpensesQuery = z.infer<typeof listRecurringExpensesQuerySchema>;
export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>;
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>;
