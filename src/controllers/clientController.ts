import { Request, Response } from 'express';

import clientService from '../services/clientService';
import { asyncHandler, sendSuccess } from '../lib/http';
import { CreateClientInput, ListClientsQuery, UpdateClientInput } from '../validators/client';

class ClientController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListClientsQuery;
    const result = await clientService.listClients(query);

    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const client = await clientService.getById(id);
    return sendSuccess(res, 200, client);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    // TODO(opportunity): Automatizar a criação de clientes a partir da conversão de oportunidades.
    const payload = (req.validated?.body ?? req.body) as CreateClientInput;
    const client = await clientService.createClient(payload);
    return sendSuccess(res, 201, client);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateClientInput;
    const client = await clientService.updateClient(id, payload);
    return sendSuccess(res, 200, client);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await clientService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ClientController();
