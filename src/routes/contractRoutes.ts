import { Router } from 'express';

import contractController from '../controllers/contractController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createContractSchema,
  listContractsQuerySchema,
  updateContractSchema,
} from '../validators/contract';

const router = Router();

router.get('/', validateRequest({ query: listContractsQuerySchema }), contractController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), contractController.get);
router.post('/', validateRequest({ body: createContractSchema }), contractController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateContractSchema }),
  contractController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), contractController.remove);

export default router;
