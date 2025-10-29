import { Router } from 'express';

import expenseController from '../controllers/expenseController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from '../validators/expense';

const router = Router();

router.get('/', validateRequest({ query: listExpensesQuerySchema }), expenseController.list);
router.get('/:id', validateRequest({ params: idParamSchema }), expenseController.get);
router.post('/', validateRequest({ body: createExpenseSchema }), expenseController.create);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateExpenseSchema }),
  expenseController.update,
);
router.delete('/:id', validateRequest({ params: idParamSchema }), expenseController.remove);

export default router;
