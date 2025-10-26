import { Request, Response } from 'express';

import contactService from '../services/contactService';
import { asyncHandler, sendSuccess } from '../lib/http';
import {
  CreateContactInput,
  ListContactsQuery,
  UpdateContactInput,
} from '../validators/contact';

class ContactController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListContactsQuery;
    const result = await contactService.listContacts(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const contact = await contactService.getById(id);
    return sendSuccess(res, 200, contact);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateContactInput;
    const contact = await contactService.createContact(payload);
    return sendSuccess(res, 201, contact);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateContactInput;
    const contact = await contactService.updateContact(id, payload);
    return sendSuccess(res, 200, contact);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await contactService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new ContactController();
