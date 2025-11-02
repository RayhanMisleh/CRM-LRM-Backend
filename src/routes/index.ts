import { Request, Response, Router } from 'express';
import prisma from '../lib/db';

import authRoutes from './authRoutes';
import clientRoutes from './clientRoutes';
import contactRoutes from './contactRoutes';
import contractRoutes from './contractRoutes';
import clientServiceRoutes from './clientServiceRoutes';
import serviceBillingRoutes from './serviceBillingRoutes';
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
router.use('/client-services', clientServiceRoutes);
router.use('/service-billings', serviceBillingRoutes);
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
      clientServices: '/api/client-services',
      serviceBillings: '/api/service-billings',
      invoices: '/api/invoices',
      domains: '/api/domains',
      recurringExpenses: '/api/recurring-expenses',
      expenses: '/api/expenses',
      meetings: '/api/meetings',
    },
  });
});

// Lightweight DB health check that runs a simple SELECT 1 via Prisma.
// Use this from the Vercel deployment to validate connectivity from the
// serverless function to Neon without exercising the full application
// logic.
router.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 as result');
    return res.status(200).json({ ok: true, result });
  } catch (err: unknown) {
    console.error('DB health check failed', err);
    return res.status(503).json({ ok: false, error: String(err) });
  }
});

export default router;
