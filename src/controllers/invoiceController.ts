import { Request, Response } from 'express';

import invoiceService from '../services/invoiceService';
import { asyncHandler, sendSuccess } from '../lib/http';
import { CreateInvoiceInput, ListInvoicesQuery, UpdateInvoiceInput } from '../validators/invoice';

class InvoiceController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListInvoicesQuery;
    const result = await invoiceService.listInvoices(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const invoice = await invoiceService.getById(id);
    return sendSuccess(res, 200, invoice);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateInvoiceInput;
    const invoice = await invoiceService.createInvoice(payload);
    return sendSuccess(res, 201, invoice);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateInvoiceInput;
    const invoice = await invoiceService.updateInvoice(id, payload);
    return sendSuccess(res, 200, invoice);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await invoiceService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new InvoiceController();
