import { Router } from 'express';
import subscriptionController from '../controllers/subscriptionController';

const router = Router();

router.get('/', subscriptionController.list.bind(subscriptionController));
router.get('/:id', subscriptionController.get.bind(subscriptionController));
router.post('/', subscriptionController.create.bind(subscriptionController));
router.put('/:id', subscriptionController.update.bind(subscriptionController));
router.delete('/:id', subscriptionController.remove.bind(subscriptionController));

export default router;
