import { InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const invoiceSortableFields = [
  'number',
  'amount',
  'status',
  'issuedAt',
  'dueDate',
  'createdAt',
  'updatedAt',
] as const;

export const listInvoicesQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(invoiceSortableFields).optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    clientId: z.string().uuid().optional(),
    clientServiceId: z.string().uuid().optional(),
    serviceBillingId: z.string().uuid().optional(),
  }),
);

const invoiceBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  clientServiceId: z.string().uuid().optional(),
  serviceBillingId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  amount: decimalSchema,
  currency: z.string().trim().min(1).default('BRL'),
  status: z.nativeEnum(InvoiceStatus).optional(),
  issuedAt: z.coerce.date().optional(),
  dueDate: z.coerce.date({ required_error: 'Data de vencimento é obrigatória' }),
  paidAt: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createInvoiceSchema = invoiceBaseSchema;

export const updateInvoiceSchema = invoiceBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
