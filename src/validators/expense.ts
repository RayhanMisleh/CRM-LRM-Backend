import { ExpenseKind } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const expenseSortableFields = ['title', 'amount', 'incurredAt', 'createdAt', 'updatedAt'] as const;

export const listExpensesQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(expenseSortableFields).optional(),
    kind: z.nativeEnum(ExpenseKind).optional(),
  })
);

const expenseBaseSchema = z.object({
  clientId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  recurringExpenseId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(1),
  description: z.string().trim().optional(),
  amount: decimalSchema,
  currency: z.string().trim().min(1).default('BRL'),
  kind: z.nativeEnum(ExpenseKind).optional(),
  incurredAt: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createExpenseSchema = expenseBaseSchema;

export const updateExpenseSchema = expenseBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
