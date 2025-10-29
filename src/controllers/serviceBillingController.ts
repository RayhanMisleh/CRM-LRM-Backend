import { Request, Response } from 'express';

import serviceBillingService from '../services/serviceBillingService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateServiceBillingInput,
  ListServiceBillingsQuery,
  UpdateServiceBillingInput,
} from '../validators/serviceBilling';

class ServiceBillingController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListServiceBillingsQuery;
    const result = await serviceBillingService.listServiceBillings(query);

    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const billing = await serviceBillingService.getById(id);
    return sendSuccess(res, 200, billing);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateServiceBillingInput;
    const billing = await serviceBillingService.createServiceBilling(payload);
    return sendSuccess(res, 201, billing);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateServiceBillingInput;
    const billing = await serviceBillingService.updateServiceBilling(id, payload);
    return sendSuccess(res, 200, billing);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await serviceBillingService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ServiceBillingController();
