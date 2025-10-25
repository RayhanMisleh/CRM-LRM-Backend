import { Router } from 'express';
import clientController from '../controllers/clientController';

const router = Router();

router.get('/', clientController.list.bind(clientController));
router.get('/:id', clientController.get.bind(clientController));
router.post('/', clientController.create.bind(clientController));
router.put('/:id', clientController.update.bind(clientController));
router.delete('/:id', clientController.remove.bind(clientController));

export default router;
