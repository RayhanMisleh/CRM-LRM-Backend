import { NextFunction, Request, Response } from 'express';
import planService from '../services/planService';
import { sendSuccess } from '../utils/response';

class PlanController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await planService.listPlans(req.query);
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
      const plan = await planService.getById(req.params.id);
      return sendSuccess(res, 200, plan);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.createPlan(req.body);
      return sendSuccess(res, 201, plan);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updatePlan(req.params.id, req.body);
      return sendSuccess(res, 200, plan);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await planService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
