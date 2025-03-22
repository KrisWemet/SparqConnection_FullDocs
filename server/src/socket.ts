import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from './models/User';

let io: Server;

export const initializeSocket = (httpServer: HTTPServer): void => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user._id;
    
    // Join user's personal room
    socket.join(`user_${userId}`);

    // Join moderator room if applicable
    if (socket.data.user.isModerator) {
      socket.join('moderators');
    }

    // Join post rooms when viewing posts
    socket.on('joinPost', (postId: string) => {
      socket.join(`post_${postId}`);
    });

    socket.on('leavePost', (postId: string) => {
      socket.leave(`post_${postId}`);
    });

    socket.on('disconnect', () => {
      // Clean up any necessary resources
    });
  });
};

export { io }; 