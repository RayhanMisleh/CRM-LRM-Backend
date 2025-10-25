import { Router } from 'express';
import invoiceController from '../controllers/invoiceController';

const router = Router();

router.get('/', invoiceController.list.bind(invoiceController));
router.get('/:id', invoiceController.get.bind(invoiceController));
router.post('/', invoiceController.create.bind(invoiceController));
router.put('/:id', invoiceController.update.bind(invoiceController));
router.delete('/:id', invoiceController.remove.bind(invoiceController));

export default router;
