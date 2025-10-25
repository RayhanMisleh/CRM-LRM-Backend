import { NextFunction, Request, Response } from 'express';
import invoiceService from '../services/invoiceService';
import { sendSuccess } from '../utils/response';

class InvoiceController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.listInvoices(req.query);
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
      const invoice = await invoiceService.getById(req.params.id);
      return sendSuccess(res, 200, invoice);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      return sendSuccess(res, 201, invoice);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      return sendSuccess(res, 200, invoice);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
