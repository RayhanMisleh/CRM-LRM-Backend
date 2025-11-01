import app from '../src/app';

// Vercel chama essa função passando (req, res).
// Um app Express já implementa a interface de request handler do Node.
// Então devolvemos o próprio app para que atenda as requisições diretamente.

export default app;