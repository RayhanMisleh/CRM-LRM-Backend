import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject } from './common';

const contactSortableFields = ['name', 'email', 'phone', 'createdAt', 'updatedAt'] as const;

export const listContactsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(contactSortableFields).optional(),
    status: z.enum(['linked', 'unlinked']).optional(),
  }),
);

const contactBaseSchema = z.object({
  clientId: z.string().uuid(),
  externalId: z.string().trim().min(1).optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(1),
  email: z.string().email().optional(),
  phone: z.string().trim().min(1).optional(),
  position: z.string().trim().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createContactSchema = contactBaseSchema.refine(
  data => Boolean(data.email || data.phone),
  {
    message: 'Informe email ou telefone',
    path: ['email'],
  },
);

export const updateContactSchema = contactBaseSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
