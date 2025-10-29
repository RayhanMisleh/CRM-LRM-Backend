import { Router } from 'express';

import serviceBillingController from '../controllers/serviceBillingController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createServiceBillingSchema,
  listServiceBillingsQuerySchema,
  updateServiceBillingSchema,
} from '../validators/serviceBilling';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listServiceBillingsQuerySchema }),
  serviceBillingController.list,
);
router.get('/:id', validateRequest({ params: idParamSchema }), serviceBillingController.get);
router.post(
  '/',
  validateRequest({ body: createServiceBillingSchema }),
  serviceBillingController.create,
);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateServiceBillingSchema }),
  serviceBillingController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), serviceBillingController.remove);

export default router;
