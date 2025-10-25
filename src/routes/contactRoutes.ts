import { Router } from 'express';
import contactController from '../controllers/contactController';

const router = Router();

router.get('/', contactController.list.bind(contactController));
router.get('/:id', contactController.get.bind(contactController));
router.post('/', contactController.create.bind(contactController));
router.put('/:id', contactController.update.bind(contactController));
router.delete('/:id', contactController.remove.bind(contactController));

export default router;
