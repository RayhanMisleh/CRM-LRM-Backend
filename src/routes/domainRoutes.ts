import { Router } from 'express';

import domainController from '../controllers/domainController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createDomainSchema,
  listDomainsQuerySchema,
  updateDomainSchema,
} from '../validators/domain';

const router = Router();

router.get('/', validateRequest({ query: listDomainsQuerySchema }), domainController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), domainController.get);
router.post('/', validateRequest({ body: createDomainSchema }), domainController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateDomainSchema }),
  domainController.update
);
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  domainController.remove
);

export default router;
