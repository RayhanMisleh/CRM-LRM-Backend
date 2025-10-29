import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject } from './common';

const domainSortableFields = ['name', 'hostname', 'expiresAt', 'createdAt'] as const;

export const listDomainsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(domainSortableFields).optional(),
    clientId: z.string().uuid().optional(),
  }),
);

const domainBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  externalId: z.string().trim().min(1).optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(1),
  hostname: z.string({ required_error: 'Domínio é obrigatório' }).trim().min(1),
  registrar: z.string().trim().optional(),
  expiresAt: z.coerce.date().optional(),
  autoRenew: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createDomainSchema = domainBaseSchema;

export const updateDomainSchema = domainBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListDomainsQuery = z.infer<typeof listDomainsQuerySchema>;
export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
