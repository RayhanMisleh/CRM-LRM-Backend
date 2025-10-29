import { Router } from 'express';

import recurringExpenseController from '../controllers/recurringExpenseController';
import validateRequest from '../middlewares/validateRequest';
import { idParamSchema } from '../validators/common';
import {
  createRecurringExpenseSchema,
  listRecurringExpensesQuerySchema,
  updateRecurringExpenseSchema,
} from '../validators/recurringExpense';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listRecurringExpensesQuerySchema }),
  recurringExpenseController.list,
);
router.get('/:id', validateRequest({ params: idParamSchema }), recurringExpenseController.get);
router.post(
  '/',
  validateRequest({ body: createRecurringExpenseSchema }),
  recurringExpenseController.create,
);
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateRecurringExpenseSchema }),
  recurringExpenseController.update,
);
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  recurringExpenseController.remove,
);

export default router;
