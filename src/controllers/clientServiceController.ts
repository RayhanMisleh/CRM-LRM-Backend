import { Request, Response } from 'express';

import clientServiceService from '../services/clientServiceService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateClientServiceInput,
  ListClientServicesQuery,
  UpdateClientServiceInput,
} from '../validators/clientService';

class ClientServiceController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListClientServicesQuery;
    const result = await clientServiceService.listClientServices(query);

    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const clientService = await clientServiceService.getById(id);
    return sendSuccess(res, 200, clientService);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateClientServiceInput;
    const clientService = await clientServiceService.createClientService(payload);
    return sendSuccess(res, 201, clientService);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateClientServiceInput;
    const clientService = await clientServiceService.updateClientService(id, payload);
    return sendSuccess(res, 200, clientService);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await clientServiceService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ClientServiceController();
