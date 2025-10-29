import { ClientStatus } from '@prisma/client';
import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject } from './common';

const clientSortableFields = [
  'name',
  'email',
  'status',
  'createdAt',
  'updatedAt',
] as const;

const MAX_CLIENT_PAGE_SIZE = 200;

export const listClientsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    pageSize: z.coerce.number().int().min(1).max(MAX_CLIENT_PAGE_SIZE).default(20),
    sortBy: z.enum(clientSortableFields).optional(),
    status: z.nativeEnum(ClientStatus).optional(),
    companyId: z.string().uuid().optional(),
  })
);

const clientBaseSchema = z.object({
  empresaId: z.string().uuid().optional(),
  externalId: z.string().trim().min(1).optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(1),
  email: z.string().email().optional(),
  phone: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().optional(),
});

export const createClientSchema = clientBaseSchema;

export const updateClientSchema = clientBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe ao menos um campo para atualização' }
);

export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
