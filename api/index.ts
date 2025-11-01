import type { Request, Response } from 'express';

import app from '../src/app';

// Vercel's Node runtime forwards Express-compatible request/response objects,
// so we can re-use the same Express instance we run locally without an
// additional adapter layer. Using the Express types keeps the file independent
// from the optional `@vercel/node` package, which avoids build failures when
// the dependency is not installed (e.g. in production installs that skip dev
// dependencies).
export default function handler(req: Request, res: Response) {
  return app(req, res);
}