import { Request, Response } from 'express';

import planService from '../services/planService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreatePlanInput,
  ListPlansQuery,
  UpdatePlanInput,
} from '../validators/plan';

class PlanController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListPlansQuery;
    const result = await planService.listPlans(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const plan = await planService.getById(id);
    return sendSuccess(res, 200, plan);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreatePlanInput;
    const plan = await planService.createPlan(payload);
    return sendSuccess(res, 201, plan);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdatePlanInput;
    const plan = await planService.updatePlan(id, payload);
    return sendSuccess(res, 200, plan);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await planService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new PlanController();
