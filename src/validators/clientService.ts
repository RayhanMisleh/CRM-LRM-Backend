import { Cycle, ServiceStatus } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject, decimalSchema } from './common';

const clientServiceSortableFields = [
  'title',
  'status',
  'startDate',
  'goLiveDate',
  'createdAt',
  'updatedAt',
] as const;

export const listClientServicesQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(clientServiceSortableFields).optional(),
    status: z.nativeEnum(ServiceStatus).optional(),
    clientId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional(),
    contractId: z.string().uuid().optional(),
  }),
);

const clientServiceBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  templateId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(1),
  scope: z.string().trim().optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
  responsible: z.string().trim().optional(),
  hostingProvider: z.string().trim().optional(),
  repositoryUrls: z.array(z.string().trim().min(1)).optional(),
  environmentLinks: z.record(z.any()).optional(),
  defaultMonthlyFee: decimalSchema.optional(),
  currency: z.string().trim().min(1).default('BRL'),
  billingCycle: z.nativeEnum(Cycle).optional(),
  supportLevel: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  goLiveDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

const validateDates = (data: { startDate?: Date; goLiveDate?: Date; endDate?: Date }) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }

  if (data.startDate && data.goLiveDate && data.startDate > data.goLiveDate) {
    return false;
  }

  if (data.goLiveDate && data.endDate && data.goLiveDate > data.endDate) {
    return false;
  }

  return true;
};

export const createClientServiceSchema = clientServiceBaseSchema.refine(validateDates, {
  message: 'As datas devem estar em ordem cronológica (início <= go live <= término)',
});

export const updateClientServiceSchema = clientServiceBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  })
  .refine(validateDates, {
    message: 'As datas devem estar em ordem cronológica (início <= go live <= término)',
  });

export type ListClientServicesQuery = z.infer<typeof listClientServicesQuerySchema>;
export type CreateClientServiceInput = z.infer<typeof createClientServiceSchema>;
export type UpdateClientServiceInput = z.infer<typeof updateClientServiceSchema>;
