import { Request, Response, Router } from 'express';

const authRoutes = require('./authRoutes.js') as Router;

const router = Router();

router.use('/auth', authRoutes);

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'CRM LRM Backend API',
    version: '1.0.0',
    description: 'Backend API for CRM LRM system',
    endpoints: {
      auth: '/api/auth',
    },
  });
});

export default router;
