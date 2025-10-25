import { NextFunction, Request, Response } from 'express';
import recurringExpenseService from '../services/recurringExpenseService';
import { sendSuccess } from '../utils/response';

class RecurringExpenseController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recurringExpenseService.listRecurringExpenses(req.query);
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
      const recurringExpense = await recurringExpenseService.getById(req.params.id);
      return sendSuccess(res, 200, recurringExpense);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const recurringExpense = await recurringExpenseService.createRecurringExpense(req.body);
      return sendSuccess(res, 201, recurringExpense);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const recurringExpense = await recurringExpenseService.updateRecurringExpense(req.params.id, req.body);
      return sendSuccess(res, 200, recurringExpense);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await recurringExpenseService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new RecurringExpenseController();
