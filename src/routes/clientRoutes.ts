import { Router } from 'express';

import clientController from '../controllers/clientController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from '../validators/client';

const router = Router();

router.get('/', validateRequest({ query: listClientsQuerySchema }), clientController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), clientController.get);
router.post('/', validateRequest({ body: createClientSchema }), clientController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateClientSchema }),
  clientController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), clientController.remove);

export default router;
