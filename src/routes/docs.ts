import path from 'path';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc, { Options as SwaggerOptions } from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';

import packageJson from '../../package.json';

const router = Router();

const securedAccess: OpenAPIV3.SecurityRequirementObject[] = [
  { bearerAuth: [] },
  { cookieAuth: [] },
];

const requestBodyWithDescription = (description: string): OpenAPIV3.RequestBodyObject => ({
  required: true,
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/GenericPayload' },
    },
  },
});

const basePaths: OpenAPIV3.PathsObject = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Verifica o status da aplicação',
      description: 'Retorna informações básicas sobre o status da API.',
      responses: {
        '200': {
          description: 'Aplicação saudável',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  uptime: { type: 'number' },
                  environment: { type: 'string' },
                },
                required: ['status', 'timestamp', 'uptime', 'environment'],
              },
            },
          },
        },
      },
    },
  },
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Cria um novo usuário e sessão',
      requestBody: requestBodyWithDescription(
        'Consulte src/validators/session.ts para o formato completo (nome, email, senha, etc).'
      ),
      responses: {
        '201': {
          description: 'Usuário criado com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '400': { description: 'Dados inválidos' },
        '409': { description: 'Usuário já existe' },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Inicia uma sessão para um usuário existente',
      requestBody: requestBodyWithDescription(
        'Consulte src/validators/session.ts para email e senha esperados.'
      ),
      responses: {
        '200': {
          description: 'Login realizado com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '400': { description: 'Dados inválidos' },
        '401': { description: 'Credenciais incorretas' },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Encerra a sessão atual',
      security: securedAccess,
      responses: {
        '200': { description: 'Logout realizado com sucesso' },
        '401': { description: 'Usuário não autenticado' },
      },
    },
  },
};

const resources: Array<{
  tag: string;
  basePath: string;
  description: {
    list: string;
    create: string;
    get: string;
    update: string;
    remove: string;
  };
}> = [
  {
    tag: 'Clients',
    basePath: '/clients',
    description: {
      list: 'Lista clientes',
      create: 'Cria um cliente',
      get: 'Obtém um cliente pelo ID',
      update: 'Atualiza um cliente',
      remove: 'Remove um cliente',
    },
  },
  {
    tag: 'Contacts',
    basePath: '/contacts',
    description: {
      list: 'Lista contatos',
      create: 'Cria um contato',
      get: 'Obtém um contato pelo ID',
      update: 'Atualiza um contato existente',
      remove: 'Remove um contato',
    },
  },
  {
    tag: 'Contracts',
    basePath: '/contracts',
    description: {
      list: 'Lista contratos',
      create: 'Cria um contrato',
      get: 'Obtém um contrato pelo ID',
      update: 'Atualiza um contrato existente',
      remove: 'Remove um contrato',
    },
  },
  {
    tag: 'Plans',
    basePath: '/plans',
    description: {
      list: 'Lista planos',
      create: 'Cria um plano',
      get: 'Obtém um plano pelo ID',
      update: 'Atualiza um plano existente',
      remove: 'Remove um plano',
    },
  },
  {
    tag: 'Subscriptions',
    basePath: '/subscriptions',
    description: {
      list: 'Lista assinaturas',
      create: 'Cria uma assinatura',
      get: 'Obtém uma assinatura pelo ID',
      update: 'Atualiza uma assinatura existente',
      remove: 'Remove uma assinatura',
    },
  },
  {
    tag: 'Invoices',
    basePath: '/invoices',
    description: {
      list: 'Lista faturas',
      create: 'Cria uma fatura',
      get: 'Obtém uma fatura pelo ID',
      update: 'Atualiza uma fatura existente',
      remove: 'Remove uma fatura',
    },
  },
  {
    tag: 'Domains',
    basePath: '/domains',
    description: {
      list: 'Lista domínios',
      create: 'Cria um domínio',
      get: 'Obtém um domínio pelo ID',
      update: 'Atualiza um domínio existente',
      remove: 'Remove um domínio',
    },
  },
  {
    tag: 'Recurring Expenses',
    basePath: '/recurring-expenses',
    description: {
      list: 'Lista despesas recorrentes',
      create: 'Cria uma despesa recorrente',
      get: 'Obtém uma despesa recorrente pelo ID',
      update: 'Atualiza uma despesa recorrente',
      remove: 'Remove uma despesa recorrente',
    },
  },
  {
    tag: 'Expenses',
    basePath: '/expenses',
    description: {
      list: 'Lista despesas',
      create: 'Cria uma despesa',
      get: 'Obtém uma despesa pelo ID',
      update: 'Atualiza uma despesa existente',
      remove: 'Remove uma despesa',
    },
  },
  {
    tag: 'Meetings',
    basePath: '/meetings',
    description: {
      list: 'Lista reuniões',
      create: 'Cria uma reunião',
      get: 'Obtém uma reunião pelo ID',
      update: 'Atualiza uma reunião existente',
      remove: 'Remove uma reunião',
    },
  },
];

const resourcePaths = resources.reduce<OpenAPIV3.PathsObject>((paths, resource) => {
  paths[resource.basePath] = {
    get: {
      tags: [resource.tag],
      summary: resource.description.list,
      security: securedAccess,
      responses: {
        '200': {
          description: 'Operação realizada com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
    post: {
      tags: [resource.tag],
      summary: resource.description.create,
      security: securedAccess,
      requestBody: requestBodyWithDescription(
        `Consulte os validadores em src/validators para os campos aceitos em ${resource.basePath}.`
      ),
      responses: {
        '201': { description: 'Recurso criado com sucesso' },
        '400': { description: 'Dados inválidos' },
      },
    },
  } as OpenAPIV3.PathItemObject;

  paths[`${resource.basePath}/{id}`] = {
    get: {
      tags: [resource.tag],
      summary: resource.description.get,
      security: securedAccess,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Operação realizada com sucesso' },
        '404': { description: 'Recurso não encontrado' },
      },
    },
    put: {
      tags: [resource.tag],
      summary: resource.description.update,
      security: securedAccess,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: requestBodyWithDescription(
        `Consulte os validadores em src/validators para os campos aceitos em ${resource.basePath}.`
      ),
      responses: {
        '200': { description: 'Recurso atualizado com sucesso' },
        '400': { description: 'Dados inválidos' },
        '404': { description: 'Recurso não encontrado' },
      },
    },
    delete: {
      tags: [resource.tag],
      summary: resource.description.remove,
      security: securedAccess,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '204': { description: 'Recurso removido com sucesso' },
        '404': { description: 'Recurso não encontrado' },
      },
    },
  } as OpenAPIV3.PathItemObject;

  return paths;
}, {});

const swaggerDefinition: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: packageJson.name ?? 'CRM LRM Backend API',
    version: packageJson.version ?? '1.0.0',
    description:
      packageJson.description ??
      'API pública do CRM LRM para gerenciamento de clientes, contratos e assinaturas.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor atual',
    },
    {
      url: '/api',
      description: 'Base relativa da API',
    },
  ],
  tags: [
    { name: 'Health', description: 'Monitoramento da aplicação' },
    { name: 'Auth', description: 'Autenticação e gerenciamento de sessões' },
    { name: 'Clients', description: 'Clientes e seus dados principais' },
    { name: 'Contacts', description: 'Contatos associados aos clientes' },
    { name: 'Contracts', description: 'Contratos firmados com os clientes' },
    { name: 'Plans', description: 'Planos e produtos comercializados' },
    { name: 'Subscriptions', description: 'Assinaturas vinculadas aos clientes' },
    { name: 'Invoices', description: 'Faturas emitidas para os clientes' },
    { name: 'Domains', description: 'Domínios gerenciados pela plataforma' },
    { name: 'Recurring Expenses', description: 'Despesas recorrentes cadastradas no sistema' },
    { name: 'Expenses', description: 'Despesas avulsas registradas' },
    { name: 'Meetings', description: 'Reuniões e compromissos com os clientes' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          data: {
            description: 'Carga útil retornada pelo endpoint',
            type: 'object',
            additionalProperties: true,
          },
          meta: {
            $ref: '#/components/schemas/Meta',
            nullable: true,
          },
        },
        required: ['data'],
        additionalProperties: false,
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          data: {
            description: 'Sempre nulo em respostas de erro',
            type: 'object',
            nullable: true,
            default: null,
            additionalProperties: false,
          },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              details: {
                description: 'Informações adicionais do erro',
                nullable: true,
              },
              code: { type: 'string' },
            },
            required: ['message'],
            additionalProperties: true,
          },
        },
        required: ['data', 'error'],
        additionalProperties: false,
      },
      Meta: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1 },
          total: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 0 },
        },
        additionalProperties: true,
      },
      GenericPayload: {
        type: 'object',
        description:
          'Estrutura genérica usada para criação/atualização das entidades. Consulte os validadores em src/validators para o formato detalhado.',
        additionalProperties: true,
      },
    },
  },
  paths: {
    ...basePaths,
    ...resourcePaths,
  },
};

const swaggerOptions: SwaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    path.resolve(process.cwd(), 'src/routes/**/*.{ts,js}'),
    path.resolve(process.cwd(), 'src/controllers/**/*.{ts,js}'),
    path.resolve(process.cwd(), 'src/validators/**/*.{ts,js}'),
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

router.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

router.use('/docs', swaggerUi.serve);
router.get(
  '/docs',
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

export default router;
