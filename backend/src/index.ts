import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cotizacionesRoutes from './routes/cotizaciones.routes.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'draco-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Draco backend escuchando en http://localhost:${PORT}`);
});