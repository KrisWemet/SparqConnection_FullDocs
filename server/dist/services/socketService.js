"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketEvents = exports.emitGamificationUpdate = exports.initializeSocket = void 0;
let io;
const initializeSocket = (socketIo) => {
    io = socketIo;
};
exports.initializeSocket = initializeSocket;
const emitGamificationUpdate = (userId, data) => {
    if (io) {
        io.to(`user_${userId}`).emit('gamificationUpdate', data);
    }
};
exports.emitGamificationUpdate = emitGamificationUpdate;
const setupSocketEvents = (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        socket.join(`user_${userId}`);
    }
    socket.on('disconnect', () => {
        if (userId) {
            socket.leave(`user_${userId}`);
        }
    });
};
exports.setupSocketEvents = setupSocketEvents;
