import { Router } from 'express';
import expenseController from '../controllers/expenseController';

const router = Router();

router.get('/', expenseController.list.bind(expenseController));
router.get('/:id', expenseController.get.bind(expenseController));
router.post('/', expenseController.create.bind(expenseController));
router.put('/:id', expenseController.update.bind(expenseController));
router.delete('/:id', expenseController.remove.bind(expenseController));

export default router;
