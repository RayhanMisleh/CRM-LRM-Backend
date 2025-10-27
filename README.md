# CRM-LRM Backend

Backend da plataforma CRM-LRM construído com Node.js, Express e Prisma. O serviço expõe endpoints REST para gerenciar clientes, contratos, assinaturas, despesas e demais entidades de relacionamento.

## Sumário
- [Arquitetura em alto nível](#arquitetura-em-alto-nível)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Instalação](#instalação)
- [Banco de dados](#banco-de-dados)
- [Execução local](#execução-local)
- [Testes e qualidade](#testes-e-qualidade)
- [Scripts npm](#scripts-npm)
- [Documentação Swagger](#documentação-swagger)
- [Deploy na Vercel com pooling Neon](#deploy-na-vercel-com-pooling-neon)

## Arquitetura em alto nível
- **`src/app.ts`** monta o aplicativo Express com middlewares de segurança (Helmet, rate-limit, CORS) e registra as rotas de API e documentação.
- **`src/index.ts`** inicia o servidor HTTP tradicional para desenvolvimento/local.
- **Camada de rotas** (`src/routes`) define os endpoints e delega para os controladores.
- **Camada de controladores** (`src/controllers`) traduz requisições HTTP em chamadas de serviço.
- **Camada de serviços** (`src/services`) contém as regras de negócio e orquestração de dados.
- **Camada de repositórios** (`src/repositories`) encapsula o acesso ao banco de dados via Prisma Client.
- **Validações** (`src/validators`) utilizam Zod para validar entradas.
- **Utilitários e libs** (`src/lib`, `src/utils`, `src/middlewares`, `src/types`) concentram integrações compartilhadas, validação de ambiente, middlewares e tipos auxiliares.
- **`api/index.ts`** expõe o app como função serverless usando `serverless-http`, facilitando o deploy em ambientes como Vercel.

## Pré-requisitos
- Node.js 18 LTS ou superior.
- npm 9+ (instalado com o Node).
- Banco de dados PostgreSQL acessível via internet. Recomenda-se o [Neon](https://neon.tech/) com PgBouncer habilitado para pooling.
- Acesso de linha de comando ao banco para executar migrações (`npx prisma ...`).

## Configuração do ambiente
1. Duplique `.env.example` para `.env`.
2. Preencha as variáveis obrigatórias:
   - `DATABASE_URL`: string de conexão usada pelo Prisma Client (ativar `?sslmode=require&pgbouncer=true&connect_timeout=10` para pooling no Neon/PgBouncer).
   - `DIRECT_URL`: string direta sem PgBouncer para migrações (mantém `?sslmode=require`).
   - `NODE_ENV`: `development`, `test` ou `production`.
   - `JWT_SECRET`: segredo forte para assinar tokens.
3. Ajuste opcionais conforme necessário (`PORT`, `CORS_ORIGIN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, etc.).
4. Ao iniciar a aplicação, as variáveis são validadas automaticamente por [`src/lib/env.ts`](src/lib/env.ts); qualquer ausência ou tipo inválido interrompe o boot.

## Instalação
```bash
npm install
```

## Banco de dados
1. Gere e aplique as migrações em ambiente de desenvolvimento (usa `DIRECT_URL` para conexões longas):
   ```bash
   npx prisma migrate dev --name init
   ```
   Substitua `init` por um nome representativo sempre que criar novas migrações.
2. Popule dados de demonstração após migrar:
   ```bash
   npm run seed
   ```
   O script compila o projeto e executa `prisma/seed.ts`, criando cliente, plano, contrato, faturas e despesas exemplo.
3. Outras operações úteis:
   - Abrir Prisma Studio: `npm run prisma:studio`
   - Gerar Prisma Client manualmente: `npm run prisma:generate`

## Execução local
```bash
npm run dev
```
O servidor ficará disponível em `http://localhost:3001` (ou na porta definida em `PORT`). A rota `/health` devolve o status da API.

Para executar em modo de produção local:
```bash
npm run build
npm start
```

## Testes e qualidade
O projeto ainda não possui uma suíte de testes automatizados. Enquanto isso, utilize o lint para garantir qualidade e padrões de código:
```bash
npm run lint
```
Para aplicar correções automáticas:
```bash
npm run lint:fix
```

## Scripts npm
| Script | Descrição |
| ------ | --------- |
| `npm run dev` | Inicia o servidor com `tsx watch` para desenvolvimento. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm start` | Executa o build e sobe o servidor a partir de `dist/index.js`. |
| `npm run seed` | Compila e roda `prisma/seed.ts` para popular dados demo. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa `prisma migrate dev`. |
| `npm run prisma:studio` | Abre o Prisma Studio. |
| `npm run prisma:deploy` | Aplica migrações em produção (`prisma migrate deploy`). |
| `npm run lint` | Roda o ESLint em `src/` e `prisma/`. |
| `npm run lint:fix` | Executa o lint com `--fix`. |

## Documentação Swagger
1. Execute o servidor (`npm run dev`).
2. Acesse `http://localhost:3001/api/docs` para visualizar a UI interativa ou `http://localhost:3001/api/docs.json` para baixar o schema.
3. As definições são geradas dinamicamente por [`src/routes/docs.ts`](src/routes/docs.ts) com `swagger-jsdoc`. Atualize rotas, controladores ou validadores para refletir novos endpoints.
4. Para exportar o arquivo OpenAPI localmente:
   ```bash
   curl http://localhost:3001/api/docs.json -o openapi.json
   ```

## Deploy na Vercel com pooling Neon
1. **Preparação do banco**
   - Em um projeto Neon, habilite o pooler (PgBouncer) e copie a connection string com `?sslmode=require&pgbouncer=true`.
   - Gere uma `DIRECT_URL` sem `pgbouncer=true` para uso exclusivo das migrações.
   - Execute `npx prisma migrate deploy` localmente ou em pipeline antes do primeiro deploy em produção.

2. **Configuração do projeto Vercel**
   - Crie um novo projeto conectado ao repositório Git.
   - Defina os secrets em *Settings → Environment Variables* (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, variáveis opcionais).
   - Ajuste *Build & Development Settings* para usar Node 18+ e o comando de build padrão (`npm install`, `npm run build`).
   - No campo **Output Directory**, mantenha o padrão (a função serverless está em `api/index.ts`, compilada automaticamente pela Vercel).

3. **Pooling e performance**
   - `DATABASE_URL` deve utilizar o host de pooling do Neon; isso garante conexões estáveis para as funções serverless.
   - Caso precise acessar o banco diretamente (migrações, scripts), utilize `DIRECT_URL` com o host primário.

4. **Pós-deploy**
   - Verifique o endpoint `/api/health` na Vercel para confirmar o status.
   - Sempre que atualizar o schema Prisma, rode `npm run build` + `npm run prisma:generate` localmente e faça commit das mudanças antes do deploy.

Com isso o backend fica pronto para desenvolvimento local, validações e deploy serverless com pooling Neon.
