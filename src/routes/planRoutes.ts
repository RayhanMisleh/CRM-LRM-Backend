import { Router } from 'express';
import planController from '../controllers/planController';

const router = Router();

router.get('/', planController.list.bind(planController));
router.get('/:id', planController.get.bind(planController));
router.post('/', planController.create.bind(planController));
router.put('/:id', planController.update.bind(planController));
router.delete('/:id', planController.remove.bind(planController));

export default router;
