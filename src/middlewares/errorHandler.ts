import { NextFunction, Request, Response } from 'express';

import { sendError, toHttpError } from '../lib/http';

const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const normalizedError = toHttpError(error);

  return sendError(res, normalizedError);
};

export default errorHandler;
