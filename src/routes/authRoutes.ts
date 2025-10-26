import { Router } from 'express';

import sessionController from '../controllers/sessionController';
import auth from '../middlewares/auth';
import validateRequest from '../middlewares/validateRequest';
import { loginSchema, signUpSchema } from '../validators/session';

const router = Router();

router.post('/signup', validateRequest({ body: signUpSchema }), sessionController.signUp);
router.post('/login', validateRequest({ body: loginSchema }), sessionController.login);
router.post('/logout', auth, sessionController.logout);

export default router;
