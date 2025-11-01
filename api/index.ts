import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

// Vercel chama essa função passando (req, res)
// Um app Express é ele mesmo um request handler válido.
// Então a gente simplesmente delega req/res pro Express.

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}