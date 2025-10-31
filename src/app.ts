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
app.set('trust proxy', 1);

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

app.use(
  rateLimit({
    windowMs,
    max: maxRequests,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
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
