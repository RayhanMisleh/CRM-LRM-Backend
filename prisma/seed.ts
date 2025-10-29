import {
  PrismaClient,
  ClientStatus,
  ContractStatus,
  Cycle,
  InvoiceStatus,
  ExpenseKind,
  Frequency,
  ServiceCategory,
  ServiceStatus,
  ServiceBillingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoClient = await prisma.client.upsert({
    where: { externalId: 'demo-client' },
    update: {
      name: 'Cliente Demo',
      email: 'contato@cliente-demo.com',
      phone: '+55 11 99999-0000',
      status: ClientStatus.ACTIVE,
      tags: ['demo', 'vip'],
      notes: 'Cliente utilizado para demonstrações internas.',
    },
    create: {
      externalId: 'demo-client',
      name: 'Cliente Demo',
      email: 'contato@cliente-demo.com',
      phone: '+55 11 99999-0000',
      status: ClientStatus.ACTIVE,
      tags: ['demo', 'vip'],
      notes: 'Cliente utilizado para demonstrações internas.',
    },
  });

  const demoServiceTemplate = await prisma.serviceTemplate.upsert({
    where: { externalId: 'demo-service-template' },
    update: {
      name: 'Aplicativo Mobile - Retainer',
      category: ServiceCategory.APP,
      description: 'Manutenção evolutiva e suporte para aplicativo mobile nativo.',
      baseMonthlyFee: '499.00',
      setupFee: '0.00',
      defaultBillingCycle: Cycle.MONTHLY,
      deliverables: 'Suporte, atualizações de segurança, publicação nas lojas.',
      stack: 'React Native, Node.js',
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-service-template',
      name: 'Aplicativo Mobile - Retainer',
      category: ServiceCategory.APP,
      description: 'Manutenção evolutiva e suporte para aplicativo mobile nativo.',
      baseMonthlyFee: '499.00',
      setupFee: '0.00',
      defaultBillingCycle: Cycle.MONTHLY,
      deliverables: 'Suporte, atualizações de segurança, publicação nas lojas.',
      stack: 'React Native, Node.js',
      tags: ['demo'],
    },
  });

  const demoContract = await prisma.contract.upsert({
    where: { externalId: 'demo-contract' },
    update: {
      clientId: demoClient.id,
      reference: 'CTR-DEM-001',
      title: 'Contrato de Serviços CRM - Cliente Demo',
      description: 'Contrato anual de prestação de serviços CRM para fins de demonstração.',
      amount: '5988.00',
      currency: 'BRL',
      status: ContractStatus.ACTIVE,
      signedAt: new Date('2024-01-10T12:00:00Z'),
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2025-01-31T23:59:59Z'),
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-contract',
      clientId: demoClient.id,
      reference: 'CTR-DEM-001',
      title: 'Contrato de Serviços CRM - Cliente Demo',
      description: 'Contrato anual de prestação de serviços CRM para fins de demonstração.',
      amount: '5988.00',
      currency: 'BRL',
      status: ContractStatus.ACTIVE,
      signedAt: new Date('2024-01-10T12:00:00Z'),
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2025-01-31T23:59:59Z'),
      tags: ['demo'],
    },
  });

  const demoClientService = await prisma.clientService.upsert({
    where: { externalId: 'demo-client-service' },
    update: {
      clientId: demoClient.id,
      templateId: demoServiceTemplate.id,
      contractId: demoContract.id,
      title: 'Aplicativo Mobile - Cliente Demo',
      scope: 'Suporte integral ao aplicativo mobile, incluindo publicações e monitoramento.',
      status: ServiceStatus.ACTIVE,
      responsible: 'Time Mobile',
      hostingProvider: 'AWS',
      repositoryUrls: ['https://github.com/acme/demo-mobile-app'],
      environmentLinks: { production: 'https://app.cliente-demo.com' },
      defaultMonthlyFee: '499.00',
      currency: 'BRL',
      billingCycle: Cycle.MONTHLY,
      supportLevel: 'SLA 24/7',
      startDate: new Date('2024-02-01T00:00:00Z'),
      goLiveDate: new Date('2024-02-15T00:00:00Z'),
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-client-service',
      clientId: demoClient.id,
      templateId: demoServiceTemplate.id,
      contractId: demoContract.id,
      title: 'Aplicativo Mobile - Cliente Demo',
      scope: 'Suporte integral ao aplicativo mobile, incluindo publicações e monitoramento.',
      status: ServiceStatus.ACTIVE,
      responsible: 'Time Mobile',
      hostingProvider: 'AWS',
      repositoryUrls: ['https://github.com/acme/demo-mobile-app'],
      environmentLinks: { production: 'https://app.cliente-demo.com' },
      defaultMonthlyFee: '499.00',
      currency: 'BRL',
      billingCycle: Cycle.MONTHLY,
      supportLevel: 'SLA 24/7',
      startDate: new Date('2024-02-01T00:00:00Z'),
      goLiveDate: new Date('2024-02-15T00:00:00Z'),
      tags: ['demo'],
    },
  });

  const demoServiceBilling = await prisma.serviceBilling.upsert({
    where: { externalId: 'demo-service-billing' },
    update: {
      clientServiceId: demoClientService.id,
      status: ServiceBillingStatus.ACTIVE,
      cycle: Cycle.MONTHLY,
      startDate: new Date('2024-02-01T00:00:00Z'),
      monthlyAmount: '499.00',
      currency: 'BRL',
      notes: 'Cobrança recorrente principal',
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-service-billing',
      clientServiceId: demoClientService.id,
      status: ServiceBillingStatus.ACTIVE,
      cycle: Cycle.MONTHLY,
      startDate: new Date('2024-02-01T00:00:00Z'),
      monthlyAmount: '499.00',
      currency: 'BRL',
      notes: 'Cobrança recorrente principal',
      tags: ['demo'],
    },
  });

  const demoInvoice = await prisma.invoice.upsert({
    where: { externalId: 'demo-invoice' },
    update: {
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      number: 'INV-DEM-2024-02',
      amount: '499.00',
      currency: 'BRL',
      status: InvoiceStatus.PAID,
      issuedAt: new Date('2024-02-01T00:00:00Z'),
      dueDate: new Date('2024-02-10T00:00:00Z'),
      paidAt: new Date('2024-02-08T10:30:00Z'),
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-invoice',
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      number: 'INV-DEM-2024-02',
      amount: '499.00',
      currency: 'BRL',
      status: InvoiceStatus.PAID,
      issuedAt: new Date('2024-02-01T00:00:00Z'),
      dueDate: new Date('2024-02-10T00:00:00Z'),
      paidAt: new Date('2024-02-08T10:30:00Z'),
      tags: ['demo'],
    },
  });

  await prisma.domain.upsert({
    where: { externalId: 'demo-domain' },
    update: {
      clientId: demoClient.id,
      name: 'Portal Demo',
      hostname: 'demo-cliente.com.br',
      registrar: 'Registro.br',
      expiresAt: new Date('2025-01-15T00:00:00Z'),
      autoRenew: true,
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-domain',
      clientId: demoClient.id,
      name: 'Portal Demo',
      hostname: 'demo-cliente.com.br',
      registrar: 'Registro.br',
      expiresAt: new Date('2025-01-15T00:00:00Z'),
      autoRenew: true,
      tags: ['demo'],
    },
  });

  const demoRecurringExpense = await prisma.recurringExpense.upsert({
    where: { externalId: 'demo-recurring-expense' },
    update: {
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      title: 'Manutenção mensal de infraestrutura',
      description: 'Custos recorrentes associados à infraestrutura do cliente demo.',
      amount: '150.00',
      currency: 'BRL',
      kind: ExpenseKind.OPERATING,
      frequency: Frequency.MONTHLY,
      nextOccurrence: new Date('2024-03-01T00:00:00Z'),
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-recurring-expense',
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      title: 'Manutenção mensal de infraestrutura',
      description: 'Custos recorrentes associados à infraestrutura do cliente demo.',
      amount: '150.00',
      currency: 'BRL',
      kind: ExpenseKind.OPERATING,
      frequency: Frequency.MONTHLY,
      nextOccurrence: new Date('2024-03-01T00:00:00Z'),
      tags: ['demo'],
    },
  });

  await prisma.expense.upsert({
    where: { externalId: 'demo-expense' },
    update: {
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      invoiceId: demoInvoice.id,
      recurringExpenseId: demoRecurringExpense.id,
      title: 'Horas de consultoria adicionais',
      description: 'Ajuste mensal referente a horas extras de consultoria.',
      amount: '250.00',
      currency: 'BRL',
      kind: ExpenseKind.OTHER,
      incurredAt: new Date('2024-02-15T00:00:00Z'),
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-expense',
      clientId: demoClient.id,
      clientServiceId: demoClientService.id,
      serviceBillingId: demoServiceBilling.id,
      invoiceId: demoInvoice.id,
      recurringExpenseId: demoRecurringExpense.id,
      title: 'Horas de consultoria adicionais',
      description: 'Ajuste mensal referente a horas extras de consultoria.',
      amount: '250.00',
      currency: 'BRL',
      kind: ExpenseKind.OTHER,
      incurredAt: new Date('2024-02-15T00:00:00Z'),
      tags: ['demo'],
    },
  });

  await prisma.meeting.upsert({
    where: { externalId: 'demo-meeting' },
    update: {
      clientId: demoClient.id,
      title: 'Reunião de onboarding',
      description: 'Reunião inicial para alinhar expectativas do projeto demo.',
      scheduledAt: new Date('2024-02-05T14:00:00-03:00'),
      durationMins: 60,
      location: 'Videoconferência',
      tags: ['demo'],
    },
    create: {
      externalId: 'demo-meeting',
      clientId: demoClient.id,
      title: 'Reunião de onboarding',
      description: 'Reunião inicial para alinhar expectativas do projeto demo.',
      scheduledAt: new Date('2024-02-05T14:00:00-03:00'),
      durationMins: 60,
      location: 'Videoconferência',
      tags: ['demo'],
    },
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch(error => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
