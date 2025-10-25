import { NextFunction, Request, Response } from 'express';
import clientService from '../services/clientService';
import { sendSuccess } from '../utils/response';

class ClientController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientService.listClients(req.query);
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
      const client = await clientService.getById(req.params.id);
      return sendSuccess(res, 200, client);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO(opportunity): Automatizar a criação de clientes a partir da conversão de oportunidades.
      const client = await clientService.createClient(req.body);
      return sendSuccess(res, 201, client);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.updateClient(req.params.id, req.body);
      return sendSuccess(res, 200, client);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new ClientController();
