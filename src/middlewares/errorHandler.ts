import { NextFunction, Request, Response } from 'express';
import { handleUnknownError } from '../utils/httpErrors';
import { sendError } from '../utils/response';

const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const normalizedError = handleUnknownError(error);

  return sendError(res, normalizedError.statusCode, normalizedError.message, normalizedError.details);
};

export default errorHandler;
