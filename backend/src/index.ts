import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from './lib/config.js';
import authRoutes from './routes/auth.routes.js';
import cotizacionesRoutes from './routes/cotizaciones.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: config.esProduccion ? config.frontendOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '10mb' }));

// Límite global de peticiones por IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

// Límite más estricto para autenticación (evitar fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'draco-backend' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no controlado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`🚀 Draco backend escuchando en http://localhost:${config.port}`);
});
