import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import missionRoutes from './routes/missionRoutes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);

// Basic Route
app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to WaypointMap Pro API' });
});

// Health Check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
