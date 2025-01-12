const socketIo = require('socket.io');

let io;
let connectedClients = new Set();

const initializeSocket = (server) => {
    if (io) {
        console.log('Socket.io already initialized');
        return io;
    }

    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        },
        // Add ping timeout and interval settings
        pingTimeout: 60000,
        pingInterval: 25000,
        // Clean up disconnected sockets
        cleanupEmptyChildNamespaces: true
    });

    io.on('connection', (socket) => {
        // Check if client is already connected
        if (connectedClients.has(socket.id)) {
            console.log(`Client ${socket.id} already connected, refusing duplicate connection`);
            socket.disconnect();
            return;
        }

        // Add new client to tracking set
        connectedClients.add(socket.id);
        console.log(`Client connected: ${socket.id} (Total connections: ${connectedClients.size})`);

        socket.on('disconnect', () => {
            // Remove client from tracking set
            connectedClients.delete(socket.id);
            console.log(`Client disconnected: ${socket.id} (Total connections: ${connectedClients.size})`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for client ${socket.id}:`, error);
            connectedClients.delete(socket.id);
            socket.disconnect();
        });

        // Force disconnect if connection is stale
        socket.conn.on('packet', (packet) => {
            if (packet.type === 'ping') {
                if (!socket.connected) {
                    connectedClients.delete(socket.id);
                    socket.disconnect();
                }
            }
        });
    });

    // Clean up on server shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received - cleaning up socket connections');
        io.close(() => {
            console.log('Socket.io server closed');
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

const getConnectedClientsCount = () => {
    return connectedClients.size;
};

module.exports = {
    initializeSocket,
    getIo,
    getConnectedClientsCount
}; 