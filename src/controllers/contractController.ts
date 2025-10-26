import { Request, Response } from 'express';

import contractService from '../services/contractService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateContractInput,
  ListContractsQuery,
  UpdateContractInput,
} from '../validators/contract';

class ContractController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListContractsQuery;
    const result = await contractService.listContracts(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const contract = await contractService.getById(id);
    return sendSuccess(res, 200, contract);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    // TODO(opportunity): Converter oportunidades ganhas em contratos automaticamente antes da criação manual.
    const payload = (req.validated?.body ?? req.body) as CreateContractInput;
    const contract = await contractService.createContract(payload);
    return sendSuccess(res, 201, contract);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateContractInput;
    const contract = await contractService.updateContract(id, payload);
    return sendSuccess(res, 200, contract);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await contractService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ContractController();
