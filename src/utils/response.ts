import { Response } from 'express';

interface Meta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export const sendSuccess = <T>(res: Response, statusCode: number, data: T, meta?: Meta) => {
  const payload: { data: T; meta?: Meta } = { data };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (res: Response, statusCode: number, message: string, details?: unknown) => {
  return res.status(statusCode).json({
    data: null,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
};
