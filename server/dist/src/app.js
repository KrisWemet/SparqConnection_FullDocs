import express from 'express';
import cors from 'cors';
import expertAdviceRoutes from './routes/expertAdvice';
import healthRouter from './routes/health';
import { requestLogger, errorLogger } from './utils/logger';
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
// Routes
app.use('/api/expert-advice', expertAdviceRoutes);
app.use('/api/health', healthRouter);
// Error handling
app.use(errorLogger);
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});
export default app;
