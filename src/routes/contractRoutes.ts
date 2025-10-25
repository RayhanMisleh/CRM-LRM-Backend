import { Router } from 'express';
import contractController from '../controllers/contractController';

const router = Router();

router.get('/', contractController.list.bind(contractController));
router.get('/:id', contractController.get.bind(contractController));
router.post('/', contractController.create.bind(contractController));
router.put('/:id', contractController.update.bind(contractController));
router.delete('/:id', contractController.remove.bind(contractController));

export default router;
