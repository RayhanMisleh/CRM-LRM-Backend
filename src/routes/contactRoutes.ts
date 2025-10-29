import { Router } from 'express';

import contactController from '../controllers/contactController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createContactSchema,
  listContactsQuerySchema,
  updateContactSchema,
} from '../validators/contact';

const router = Router();

router.get('/', validateRequest({ query: listContactsQuerySchema }), contactController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), contactController.get);
router.post('/', validateRequest({ body: createContactSchema }), contactController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateContactSchema }),
  contactController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), contactController.remove);

export default router;
