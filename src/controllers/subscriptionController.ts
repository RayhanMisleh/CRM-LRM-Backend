import { NextFunction, Request, Response } from 'express';
import subscriptionService from '../services/subscriptionService';
import { sendSuccess } from '../utils/response';

class SubscriptionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.listSubscriptions(req.query);
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
      const subscription = await subscriptionService.getById(req.params.id);
      return sendSuccess(res, 200, subscription);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO(opportunity): Criar assinaturas automaticamente ao fechar oportunidades recorrentes.
      const subscription = await subscriptionService.createSubscription(req.body);
      return sendSuccess(res, 201, subscription);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
      return sendSuccess(res, 200, subscription);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await subscriptionService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new SubscriptionController();
