// socket.js (Server-side)
const { Server } = require('socket.io');
let io;
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:9999',
        'http://localhost:3000',
        'http://127.0.0.1:9999',
        'http://127.0.0.1:3000',
        'http://localhost:5173'  // Thêm domain của front-end vào đây
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    socket.on('joinRoom', (userId) => {
      console.log('User joined room: ' + userId);
      socket.join(userId); // Each user joins their own room
    });
    socket.on('disconnect', () => {
      console.log('User disconnected: ' + socket.id);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };
