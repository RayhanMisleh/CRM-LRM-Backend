import { Router } from 'express';

import subscriptionController from '../controllers/subscriptionController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
  updateSubscriptionSchema,
} from '../validators/subscription';

const router = Router();

router.get('/', validateRequest({ query: listSubscriptionsQuerySchema }), subscriptionController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), subscriptionController.get);
router.post('/', validateRequest({ body: createSubscriptionSchema }), subscriptionController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateSubscriptionSchema }),
  subscriptionController.update
);
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  subscriptionController.remove
);

export default router;
