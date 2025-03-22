"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const passport_1 = __importDefault(require("passport"));
require("./config/passport");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const promptRoutes_1 = __importDefault(require("./routes/promptRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const messages_1 = __importDefault(require("./routes/messages"));
const socketService_1 = require("./services/socketService");
const firebase_1 = require("./config/firebase");
// Load environment variables
dotenv_1.default.config();
// Initialize Firebase
(0, firebase_1.initializeFirebase)();
// Create Express app
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Initialize socket service
(0, socketService_1.initializeSocket)(io);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    (0, socketService_1.setupSocketEvents)(socket);
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/prompts', promptRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/messages', messages_1.default);
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
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
startServer();
exports.default = app;
