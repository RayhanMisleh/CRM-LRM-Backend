import { Request, Response } from 'express';

import serviceTemplateService from '../services/serviceTemplateService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateServiceTemplateInput,
  ListServiceTemplatesQuery,
  UpdateServiceTemplateInput,
} from '../validators/serviceTemplate';

class ServiceTemplateController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListServiceTemplatesQuery;
    const result = await serviceTemplateService.listServiceTemplates(query);

    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const template = await serviceTemplateService.getById(id);
    return sendSuccess(res, 200, template);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateServiceTemplateInput;
    const template = await serviceTemplateService.createServiceTemplate(payload);
    return sendSuccess(res, 201, template);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateServiceTemplateInput;
    const template = await serviceTemplateService.updateServiceTemplate(id, payload);
    return sendSuccess(res, 200, template);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await serviceTemplateService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ServiceTemplateController();
