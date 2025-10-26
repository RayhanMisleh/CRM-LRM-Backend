import { Request, Response } from 'express';

import recurringExpenseService from '../services/recurringExpenseService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateRecurringExpenseInput,
  ListRecurringExpensesQuery,
  UpdateRecurringExpenseInput,
} from '../validators/recurringExpense';

class RecurringExpenseController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListRecurringExpensesQuery;
    const result = await recurringExpenseService.listRecurringExpenses(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const recurringExpense = await recurringExpenseService.getById(id);
    return sendSuccess(res, 200, recurringExpense);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateRecurringExpenseInput;
    const recurringExpense = await recurringExpenseService.createRecurringExpense(payload);
    return sendSuccess(res, 201, recurringExpense);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateRecurringExpenseInput;
    const recurringExpense = await recurringExpenseService.updateRecurringExpense(id, payload);
    return sendSuccess(res, 200, recurringExpense);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await recurringExpenseService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new RecurringExpenseController();
