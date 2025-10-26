import { Request, Response, Router } from 'express';

import authRoutes from './authRoutes';
import clientRoutes from './clientRoutes';
import contactRoutes from './contactRoutes';
import contractRoutes from './contractRoutes';
import planRoutes from './planRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import invoiceRoutes from './invoiceRoutes';
import domainRoutes from './domainRoutes';
import recurringExpenseRoutes from './recurringExpenseRoutes';
import expenseRoutes from './expenseRoutes';
import meetingRoutes from './meetingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/contacts', contactRoutes);
router.use('/contracts', contractRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/domains', domainRoutes);
router.use('/recurring-expenses', recurringExpenseRoutes);
router.use('/expenses', expenseRoutes);
router.use('/meetings', meetingRoutes);

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'CRM LRM Backend API',
    version: '1.0.0',
    description: 'Backend API for CRM LRM system',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      contacts: '/api/contacts',
      contracts: '/api/contracts',
      plans: '/api/plans',
      subscriptions: '/api/subscriptions',
      invoices: '/api/invoices',
      domains: '/api/domains',
      recurringExpenses: '/api/recurring-expenses',
      expenses: '/api/expenses',
      meetings: '/api/meetings',
    },
  });
});

export default router;
