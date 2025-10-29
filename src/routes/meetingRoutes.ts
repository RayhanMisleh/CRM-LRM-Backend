import { Router } from 'express';

import meetingController from '../controllers/meetingController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createMeetingSchema,
  listMeetingsQuerySchema,
  updateMeetingSchema,
} from '../validators/meeting';

const router = Router();

router.get('/', validateRequest({ query: listMeetingsQuerySchema }), meetingController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), meetingController.get);
router.post('/', validateRequest({ body: createMeetingSchema }), meetingController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateMeetingSchema }),
  meetingController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), meetingController.remove);

export default router;
