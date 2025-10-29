import { Router } from 'express';

import clientServiceController from '../controllers/clientServiceController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createClientServiceSchema,
  listClientServicesQuerySchema,
  updateClientServiceSchema,
} from '../validators/clientService';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listClientServicesQuerySchema }),
  clientServiceController.list,
);
router.get('/:id', validateRequest({ params: idParamSchema }), clientServiceController.get);
router.post(
  '/',
  validateRequest({ body: createClientServiceSchema }),
  clientServiceController.create,
);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateClientServiceSchema }),
  clientServiceController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), clientServiceController.remove);

export default router;
