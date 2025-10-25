import { NextFunction, Request, Response } from 'express';
import domainService from '../services/domainService';
import { sendSuccess } from '../utils/response';

class DomainController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await domainService.listDomains(req.query);
      return sendSuccess(res, 200, result.data, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const domain = await domainService.getById(req.params.id);
      return sendSuccess(res, 200, domain);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const domain = await domainService.createDomain(req.body);
      return sendSuccess(res, 201, domain);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const domain = await domainService.updateDomain(req.params.id, req.body);
      return sendSuccess(res, 200, domain);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await domainService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new DomainController();
