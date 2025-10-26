import { Request, Response } from 'express';

import subscriptionService from '../services/subscriptionService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateSubscriptionInput,
  ListSubscriptionsQuery,
  UpdateSubscriptionInput,
} from '../validators/subscription';

class SubscriptionController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListSubscriptionsQuery;
    const result = await subscriptionService.listSubscriptions(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const subscription = await subscriptionService.getById(id);
    return sendSuccess(res, 200, subscription);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    // TODO(opportunity): Criar assinaturas automaticamente ao fechar oportunidades recorrentes.
    const payload = (req.validated?.body ?? req.body) as CreateSubscriptionInput;
    const subscription = await subscriptionService.createSubscription(payload);
    return sendSuccess(res, 201, subscription);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateSubscriptionInput;
    const subscription = await subscriptionService.updateSubscription(id, payload);
    return sendSuccess(res, 200, subscription);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await subscriptionService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new SubscriptionController();
