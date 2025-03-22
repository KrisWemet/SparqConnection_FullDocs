let io;
export const initializeSocket = (socketIo) => {
    io = socketIo;
};
export const emitGamificationUpdate = (userId, data) => {
    if (io) {
        io.to(`user_${userId}`).emit('gamificationUpdate', data);
    }
};
export const setupSocketEvents = (socket) => {
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
