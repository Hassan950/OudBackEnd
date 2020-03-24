
const activeSockets = [];

const handleSocketConnection = (io) => {
  io.on('connection', socket => {
    console.log(`Hello socket ${socket.id}...`);
  })
};

module.exports = (server) => {
  const io = require('socket.io').listen(server);
  handleSocketConnection(io);
};