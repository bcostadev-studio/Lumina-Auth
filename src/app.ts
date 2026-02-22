import express from 'express';
import cors from 'cors';
import { AuthRoutes } from './routes/AuthRoutes';
import { errorHandler } from './middlewares';
import { generalLimiter } from './middlewares/RateLimiter';
import { i18n } from './i18n/i18n';
import passport from 'passport';
import config from './config/config';
import { swaggerOptions, swaggerSpec, swaggerUi } from './config/swagger';

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || config.appBaseUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware: JSON parsing and rate limiting
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ── Swagger UI ────────────────────────────────────────
// Interactive docs: {appBaseUrl}/api/docs
// Raw spec (JSON):  {appBaseUrl}/api/docs/spec.json
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  app.get('/api/docs/spec.json', (req, res) => {
    res.json(swaggerSpec);
  });
}

app.use('/api/auth', AuthRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: i18n.__('errors.route_not_found'),
  });
});

// Global error handler (should be after all routes)
app.use(errorHandler);

export default app;
