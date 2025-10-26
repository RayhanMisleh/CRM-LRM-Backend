import { Router } from 'express';

import planController from '../controllers/planController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import { createPlanSchema, listPlansQuerySchema, updatePlanSchema } from '../validators/plan';

const router = Router();

router.get('/', validateRequest({ query: listPlansQuerySchema }), planController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), planController.get);
router.post('/', validateRequest({ body: createPlanSchema }), planController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updatePlanSchema }),
  planController.update
);
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  planController.remove
);

export default router;
