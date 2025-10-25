export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 404, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(message, 409, details);
  }
}

export const handleUnknownError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpError(error.message, 500);
  }

  return new HttpError('Unexpected error', 500);
};
