import { NextFunction, Request, Response } from 'express';
import contactService from '../services/contactService';
import { sendSuccess } from '../utils/response';

class ContactController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactService.listContacts(req.query);
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
      const contact = await contactService.getById(req.params.id);
      return sendSuccess(res, 200, contact);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.createContact(req.body);
      return sendSuccess(res, 201, contact);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.updateContact(req.params.id, req.body);
      return sendSuccess(res, 200, contact);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await contactService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactController();
