import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import './config/passport';
import authRoutes from './routes/authRoutes';
import promptRoutes from './routes/promptRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import quizRoutes from './routes/quizRoutes';
import messagesRoutes from './routes/messages';
import { initializeSocket, setupSocketEvents } from './services/socketService';
import { initializeFirebase } from './config/firebase';
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
// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};
startServer();
export default app;
