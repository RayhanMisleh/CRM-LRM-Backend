import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'ID inválido' }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortingSchema = z.object({
  sortBy: z.string().min(1).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const baseListQueryObject = z.object({
  ...paginationSchema.shape,
  ...sortingSchema.shape,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
});

export const applyDateRangeValidation = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((value, ctx) => {
    const start = (value as { startDate?: Date }).startDate;
    const end = (value as { endDate?: Date }).endDate;

    if (start && end && start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startDate must be before or equal to endDate',
        path: ['endDate'],
      });
    }
  });

export const baseListQuerySchema = applyDateRangeValidation(baseListQueryObject);

export type BaseListQuery = z.infer<typeof baseListQuerySchema>;

export const decimalSchema = z.union([
  z.number(),
  z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?$/, { message: 'Valor numérico inválido' }),
]);
