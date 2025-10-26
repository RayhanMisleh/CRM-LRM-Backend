import { z } from 'zod';

import { applyDateRangeValidation, baseListQueryObject } from './common';

const meetingSortableFields = ['title', 'scheduledAt', 'createdAt', 'updatedAt'] as const;

export const listMeetingsQuerySchema = applyDateRangeValidation(
  baseListQueryObject.extend({
    sortBy: z.enum(meetingSortableFields).optional(),
    clientId: z.string().uuid().optional(),
  })
);

const meetingBaseSchema = z.object({
  clientId: z.string({ required_error: 'Cliente é obrigatório' }).uuid(),
  externalId: z.string().trim().min(1).optional(),
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(1),
  description: z.string().trim().optional(),
  scheduledAt: z.coerce.date({ required_error: 'Data e hora são obrigatórias' }),
  durationMins: z.coerce.number().int().positive().optional(),
  location: z.string().trim().optional(),
  meta: z.record(z.any()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const createMeetingSchema = meetingBaseSchema;

export const updateMeetingSchema = meetingBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
