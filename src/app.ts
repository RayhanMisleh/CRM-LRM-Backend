import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet, { HelmetOptions } from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import routes from './routes';
import docsRoutes from './routes/docs';
import errorHandler from './middlewares/errorHandler';
import { env } from './lib/env';

const app: Application = express();

// When running behind a proxy (like Vercel), Express needs to trust
// the proxy to correctly determine client IPs (req.ip) and the
// X-Forwarded-* headers. express-rate-limit depends on this to
// generate a key for identifying clients. Set to 1 to trust the
// first proxy hop (Vercel). See: https://expressjs.com/en/guide/behind-proxies.html
// Trust the proxy chain in serverless environments so Express can read
// X-Forwarded-For and similar headers. Use `true` to trust the entire
// proxy chain (Vercel may include multiple hops).
app.set('trust proxy', true);

// Simple request entry logger to help debugging on serverless platforms
// (Vercel). This logs early so we can confirm the function is invoked
// even if something later (DB, rate limiter) blocks or times out.
app.use((req, _res, next) => {
  try {
    console.log('[entry] %s %s x-forwarded-for=%s ip=%s', req.method, req.originalUrl, req.get('x-forwarded-for'), req.ip);
  } catch (err) {
    console.log('[entry] unable to read request info', err);
  }
  next();
});

const helmetOptions: HelmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
};

app.use(helmet(helmetOptions));

const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

const windowMs = env.RATE_LIMIT_WINDOW_MS;
const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

// Provide a safe keyGenerator to avoid express-rate-limit's validation
// errors when req.ip is undefined in some serverless adapters. The
// generator prefers X-Forwarded-For, then req.ip, then socket remote
// address, and falls back to 'unknown'. This prevents the package from
// throwing on malformed requests in Vercel's runtime.
app.use(
  rateLimit({
    windowMs,
    max: maxRequests,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const xfwd = (req.get('x-forwarded-for') as string) || '';
      if (xfwd) {
        // x-forwarded-for can be a comma-separated list
        return xfwd.split(',')[0].trim();
      }
      // prefer Express-populated req.ip when available
      if (req.ip) return String(req.ip);
      // fallback to common headers or socket info
      const realIp = (req.get('x-real-ip') as string) || (req.socket && req.socket.remoteAddress) || 'unknown';
      return String(realIp);
    },
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

app.use('/api', docsRoutes);
app.use('/api', routes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    data: null,
    error: {
      message: 'Route not found',
      details: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use(errorHandler);

export default app;
