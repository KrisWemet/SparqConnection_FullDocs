import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import dotenv from 'dotenv';
import './config/passport';
import authRoutes from './routes/authRoutes';
import promptRoutes from './routes/promptRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import quizRoutes from './routes/quizRoutes';
import messagesRoutes from './routes/messages';
import { initializeSocket, setupSocketEvents } from './services/socketService';
import { initializeFirebase } from './config/firebase';
import { connectDB } from './config/db';
import errorHandler from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket service
initializeSocket(io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  setupSocketEvents(socket);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sparq Connection API' });
});

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

export default app; 