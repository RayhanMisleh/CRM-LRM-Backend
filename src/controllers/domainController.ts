import { Request, Response } from 'express';

import domainService from '../services/domainService';
import { asyncHandler, sendSuccess } from '../lib/http';
import { CreateDomainInput, ListDomainsQuery, UpdateDomainInput } from '../validators/domain';

class DomainController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListDomainsQuery;
    const result = await domainService.listDomains(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const domain = await domainService.getById(id);
    return sendSuccess(res, 200, domain);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateDomainInput;
    const domain = await domainService.createDomain(payload);
    return sendSuccess(res, 201, domain);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateDomainInput;
    const domain = await domainService.updateDomain(id, payload);
    return sendSuccess(res, 200, domain);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await domainService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new DomainController();
