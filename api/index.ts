import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

/**
 * Vercel chama essa função passando (req, res).
 * O app Express já é um request handler compatível com (req, res).
 * Não chamamos app.listen() aqui.
 * Não conectamos Prisma aqui.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
	return app(req, res);
}