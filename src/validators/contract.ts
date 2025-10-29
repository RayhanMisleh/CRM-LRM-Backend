import { ContractStatus } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const contractSortableFields = [
  'title',
  'reference',
  'status',
  'createdAt',
  'updatedAt',
  'amount',
  'startDate',
  'endDate',
] as const;

export const listContractsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(contractSortableFields).optional(),
    status: z.nativeEnum(ContractStatus).optional(),
    clientId: z.string().uuid().optional(),
  }),
);

const contractBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  externalId: z.string().trim().min(1).optional(),
  reference: z.string().trim().min(1).optional(),
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(1),
  description: z.string().trim().optional(),
  amount: decimalSchema.optional(),
  currency: z.string().trim().min(1).default('BRL'),
  status: z.nativeEnum(ContractStatus).optional(),
  signedAt: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createContractSchema = contractBaseSchema.refine(
  data => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'Data de término deve ser posterior à data de início', path: ['endDate'] },
);

export const updateContractSchema = contractBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Data de término deve ser posterior à data de início', path: ['endDate'] },
  );

export type ListContractsQuery = z.infer<typeof listContractsQuerySchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
