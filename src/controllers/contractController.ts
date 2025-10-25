import { NextFunction, Request, Response } from 'express';
import contractService from '../services/contractService';
import { sendSuccess } from '../utils/response';

class ContractController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contractService.listContracts(req.query);
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
      const contract = await contractService.getById(req.params.id);
      return sendSuccess(res, 200, contract);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO(opportunity): Converter oportunidades ganhas em contratos automaticamente antes da criação manual.
      const contract = await contractService.createContract(req.body);
      return sendSuccess(res, 201, contract);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await contractService.updateContract(req.params.id, req.body);
      return sendSuccess(res, 200, contract);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await contractService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new ContractController();
