import { Request, Response } from 'express';

import expenseService from '../services/expenseService';
import { asyncHandler, sendSuccess } from '../lib/http';
import { CreateExpenseInput, ListExpensesQuery, UpdateExpenseInput } from '../validators/expense';

class ExpenseController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListExpensesQuery;
    const result = await expenseService.listExpenses(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const expense = await expenseService.getById(id);
    return sendSuccess(res, 200, expense);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateExpenseInput;
    const expense = await expenseService.createExpense(payload);
    return sendSuccess(res, 201, expense);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateExpenseInput;
    const expense = await expenseService.updateExpense(id, payload);
    return sendSuccess(res, 200, expense);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await expenseService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ExpenseController();
