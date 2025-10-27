# CRM-LRM Backend

This project provides the backend services for the CRM-LRM platform, built with Node.js, Express, and Prisma.

## Environment configuration

1. Duplicate `.env.example` and rename the copy to `.env`.
2. Replace the placeholder credentials with your real values. The template already includes the Neon-compatible connection strings that enable PgBouncer and SSL.
3. Ensure all required variables are provided. The application validates them at startup using the schema in [`src/lib/env.ts`](src/lib/env.ts) and will fail fast if any are missing.

### Required variables

- `DATABASE_URL` – Prisma Client connection string (PgBouncer + SSL enabled).
- `DIRECT_URL` – Direct connection string used for migrations.
- `NODE_ENV` – Runtime environment (`development`, `test`, or `production`).
- `JWT_SECRET` – Secret for signing JSON Web Tokens.

Optional variables, such as `PORT`, `CORS_ORIGIN`, and rate limiting settings, are documented inside the `.env.example` file.

## Scripts

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Build the project:

```bash
npm run build
```

Seed the database with the demo client data (after configuring the environment and running migrations):

```bash
npm run seed
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Additional Prisma commands (e.g., `npm run prisma:deploy`) also rely on the environment variables defined in `.env`.
