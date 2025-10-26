import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

import { ValidationError } from '../lib/http';

interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated: Record<string, unknown> = {};

      if (schema.body) {
        const parsedBody = schema.body.parse(req.body);
        req.body = parsedBody;
        validated.body = parsedBody;
      }

      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query);
        req.query = parsedQuery as unknown as Request['query'];
        validated.query = parsedQuery;
      }

      if (schema.params) {
        const parsedParams = schema.params.parse(req.params);
        req.params = parsedParams;
        validated.params = parsedParams;
      }

      if (Object.keys(validated).length > 0) {
        req.validated = {
          ...(req.validated ?? {}),
          ...validated,
        };
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ValidationError('Dados inválidos', error.flatten()));
      }

      return next(error);
    }
  };
};

export default validateRequest;
