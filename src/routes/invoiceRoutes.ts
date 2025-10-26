import { Router } from 'express';

import invoiceController from '../controllers/invoiceController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createInvoiceSchema,
  listInvoicesQuerySchema,
  updateInvoiceSchema,
} from '../validators/invoice';

const router = Router();

router.get('/', validateRequest({ query: listInvoicesQuerySchema }), invoiceController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), invoiceController.get);
router.post('/', validateRequest({ body: createInvoiceSchema }), invoiceController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateInvoiceSchema }),
  invoiceController.update
);
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  invoiceController.remove
);

export default router;
