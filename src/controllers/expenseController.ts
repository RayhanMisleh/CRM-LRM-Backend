import { NextFunction, Request, Response } from 'express';
import expenseService from '../services/expenseService';
import { sendSuccess } from '../utils/response';

class ExpenseController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await expenseService.listExpenses(req.query);
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
      const expense = await expenseService.getById(req.params.id);
      return sendSuccess(res, 200, expense);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.createExpense(req.body);
      return sendSuccess(res, 201, expense);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.updateExpense(req.params.id, req.body);
      return sendSuccess(res, 200, expense);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await expenseService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpenseController();
