# CRM LRM Backend

Back-end em Node.js + TypeScript para suportar o CRM da LRM. O projeto foi estruturado para rodar como um servidor Express tradicional, com build em TypeScript e integrações com Prisma.

## Requisitos

- Node.js 20.x
- npm 10.x
- Banco configurado via Prisma (ver seção de variáveis de ambiente)

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os valores:

```
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."
JWT_SECRET="string-secreta"
PORT=3001
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

Durante o deploy para a Vercel, configure as mesmas chaves no painel (Settings → Environment Variables).

## Instalação

```bash
npm install
```

## Scripts principais

- `npm run dev` – inicia o servidor em modo desenvolvimento com recarregamento (`tsx watch`).
- `npm run build` – compila o TypeScript para JavaScript em `dist/`.
- `npm start` – executa o build compilado (`dist/index.js`).
- `npm run lint` / `npm run lint:fix` – análise estática.
- `npm test` – testes automatizados com Vitest.
- `npm run prisma:*` – utilidades do Prisma (migrate, generate, studio etc.).

## Fluxo de desenvolvimento

1. Instale as dependências.
2. Configure o `.env`.
3. Rode `npm run dev` para iniciar o servidor (porta padrão 3001).
4. Acesse `http://localhost:3001/health` para testar o status.

## Deploy na Vercel

1. No projeto da Vercel, defina:
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
2. Adicione um arquivo `vercel.json` (já incluso no repositório) garantindo que o handler `server.ts` seja usado.
3. Configure as variáveis de ambiente em *Settings → Environment Variables*.
4. Ao finalizar o build, a Vercel utilizará o arquivo `server.ts` para servir o Express compilado.

> Observação: o projeto exporta o próprio app Express e não usa *adapters* `serverless-http`. A Vercel instanciará o Express diretamente a partir de `server.ts`, mantendo o comportamento de servidor tradicional.

## Documentação da API

Os endpoints de documentação (Swagger) estão disponíveis em:

- `/api/docs` – interface visual.
- `/api/docs.json` – JSON para client tooling.
- `/docs` e `/docs.json` – aliases convenientes para o frontend (mesmos conteúdos).

> Todos os endpoints funcionam tanto em `/api/...` quanto diretamente na raiz (`/clients`, `/auth/login`, etc.), garantindo compatibilidade com o frontend existente.

Os arquivos estáticos complementares ficam em `Documentacao Backend/`.

## Estrutura de pastas

```
src/
  app.ts          # Configuração do Express
  index.ts        # Inicialização do servidor
  controllers/    # Controllers HTTP
  middlewares/    # Middlewares globais
  repositories/   # Regras de acesso a dados
  routes/         # Definição das rotas
  services/       # Casos de uso / lógica de negócio
  utils/          # Utilidades
prisma/           # Schema e seeds do Prisma
Documentacao Backend/ # Artefatos Swagger/OpenAPI
```

## Build local

```bash
npm run build
```

Gerará os arquivos compilados em `dist/`. Após o build, o servidor pode ser inicializado com:

```bash
npm start
```

## Testes

```bash
npm test
```

Para verificar cobertura, adapte o comando conforme necessário (por exemplo, `npm test -- --coverage`).

---

Qualquer ajuste adicional (novas rotas, serviços ou integrações) deve seguir os padrões já existentes nas respectivas pastas.
