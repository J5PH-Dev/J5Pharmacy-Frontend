const socketIo = require('socket.io');
let io;

const initializeSocket = (server) => {
    if (io) {
        console.log('Socket.io already initialized');
        return io;
    }

    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected to socket');

        socket.on('disconnect', () => {
            console.log('Client disconnected from socket');
        });
    });

    console.log('Socket.io initialized successfully');
    return io;
};

const getIo = () => {
    if (!io) {
        console.log('Socket.io not initialized yet');
        return {
            emit: () => console.log('Socket.io emit called before initialization')
        };
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
}; 