import { Router } from 'express';
import meetingController from '../controllers/meetingController';

const router = Router();

router.get('/', meetingController.list.bind(meetingController));
router.get('/:id', meetingController.get.bind(meetingController));
router.post('/', meetingController.create.bind(meetingController));
router.put('/:id', meetingController.update.bind(meetingController));
router.delete('/:id', meetingController.remove.bind(meetingController));

export default router;
