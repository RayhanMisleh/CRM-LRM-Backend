import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
    user?: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      empresaId: string | null;
      empresa?: unknown;
    };
    user_id?: string;
    user_email?: string;
    user_role?: string;
    user_empresa_id?: string | null;
    session_id?: string;
  }
}
