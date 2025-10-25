import { Router } from 'express';
import domainController from '../controllers/domainController';

const router = Router();

router.get('/', domainController.list.bind(domainController));
router.get('/:id', domainController.get.bind(domainController));
router.post('/', domainController.create.bind(domainController));
router.put('/:id', domainController.update.bind(domainController));
router.delete('/:id', domainController.remove.bind(domainController));

export default router;
