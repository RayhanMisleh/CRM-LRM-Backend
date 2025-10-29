import { Router } from 'express';

import serviceTemplateController from '../controllers/serviceTemplateController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createServiceTemplateSchema,
  listServiceTemplatesQuerySchema,
  updateServiceTemplateSchema,
} from '../validators/serviceTemplate';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listServiceTemplatesQuerySchema }),
  serviceTemplateController.list,
);
router.get('/:id', validateRequest({ params: idParamSchema }), serviceTemplateController.get);
router.post(
  '/',
  validateRequest({ body: createServiceTemplateSchema }),
  serviceTemplateController.create,
);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateServiceTemplateSchema }),
  serviceTemplateController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), serviceTemplateController.remove);

export default router;
