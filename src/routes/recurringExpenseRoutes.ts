import { Router } from 'express';
import recurringExpenseController from '../controllers/recurringExpenseController';

const router = Router();

router.get('/', recurringExpenseController.list.bind(recurringExpenseController));
router.get('/:id', recurringExpenseController.get.bind(recurringExpenseController));
router.post('/', recurringExpenseController.create.bind(recurringExpenseController));
router.put('/:id', recurringExpenseController.update.bind(recurringExpenseController));
router.delete('/:id', recurringExpenseController.remove.bind(recurringExpenseController));

export default router;
