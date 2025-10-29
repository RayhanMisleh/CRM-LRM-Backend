import { NextFunction, Request, Response } from 'express';

export interface Meta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export interface SuccessResponse<T> {
  data: T;
  meta?: Meta;
}

export interface ErrorResponse {
  data: null;
  error: {
    message: string;
    details?: unknown;
    code?: string;
  };
}

export class HttpError extends Error {
  public readonly statusCode: number;

  public readonly details?: unknown;

  public readonly code?: string;

  constructor(message: string, statusCode: number, details?: unknown, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 404, details, 'NOT_FOUND');
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 409, details, 'CONFLICT');
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 401, details, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 403, details, 'FORBIDDEN');
  }
}

export const toHttpError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpError(error.message, 500);
  }

  return new HttpError('Unexpected error', 500);
};

export const sendSuccess = <T>(res: Response, statusCode: number, data: T, meta?: Meta) => {
  const payload: SuccessResponse<T> = { data };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (res: Response, error: HttpError) => {
  const payload: ErrorResponse = {
    data: null,
    error: {
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.details ? { details: error.details } : {}),
    },
  };

  return res.status(error.statusCode).json(payload);
};

export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = (handler: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};
