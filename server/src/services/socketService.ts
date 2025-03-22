import { Server, Socket } from 'socket.io';
import { IGamification } from '../models/Gamification';

let io: Server;

export const initializeSocket = (socketIo: Server) => {
  io = socketIo;
  console.log('Socket service initialized');
};

export const setupSocketEvents = (socket: Socket) => {
  console.log('Client connected to socket:', socket.id);

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Example: Join a room for personalized events
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Example: Leave a room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  // Example: Send a message to a room
  socket.on('send-message', (data: { roomId: string; message: string }) => {
    io.to(data.roomId).emit('new-message', {
      message: data.message,
      senderId: socket.id,
      timestamp: new Date()
    });
  });
};

export const emitEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

export const emitToRoom = (roomId: string, event: string, data: any) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitGamificationUpdate = (userId: string, data: Partial<IGamification>) => {
  if (io) {
    io.to(`user_${userId}`).emit('gamificationUpdate', data);
  }
}; 