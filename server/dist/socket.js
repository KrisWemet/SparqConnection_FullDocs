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
exports.io = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("./models/User"));
let io;
const initializeSocket = (httpServer) => {
    exports.io = io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });
    // Authentication middleware
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = yield User_1.default.findById(decoded.userId);
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    }));
    io.on('connection', (socket) => {
        const userId = socket.data.user._id;
        // Join user's personal room
        socket.join(`user_${userId}`);
        // Join moderator room if applicable
        if (socket.data.user.isModerator) {
            socket.join('moderators');
        }
        // Join post rooms when viewing posts
        socket.on('joinPost', (postId) => {
            socket.join(`post_${postId}`);
        });
        socket.on('leavePost', (postId) => {
            socket.leave(`post_${postId}`);
        });
        socket.on('disconnect', () => {
            // Clean up any necessary resources
        });
    });
};
exports.initializeSocket = initializeSocket;
