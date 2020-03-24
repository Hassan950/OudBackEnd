const ss = require('stream');
const fs = require('fs');
const logger = require('./logger');
const activeSockets = [];

/*
  socket = {
    id: socet.id,
    user: user.id,
    stream: streamSource
  }

*/
let io;

const handleSocketConnection = (io) => {
  io.on('connection', socket => {
    logger.info(`Hello socket ${socket.id}...`);

    const existedSocket = activeSockets.find((el) => {
      return el.id === socket.id;
    });

    if (!existedSocket) {
      activeSockets.push({
        id: socket.id
      });
    }

    logger.info(`Connected sockets = ${activeSockets.length}`);

    handleSocketDisconnection(socket);
  })
};

const handleSocketDisconnection = (socket) => {
  socket.on('disconnect', () => {
    logger.info('Disconnected ....');
    const existedSocket = activeSockets.find((el) => {
      return el.id === socket.id;
    });
    const idx = activeSockets.indexOf(existedSocket);
    activeSockets.splice(idx, 1);
    logger.info(`Connected sockets = ${activeSockets.length}`);
  })
}

exports.io = io;

exports.server = (server) => {
  io = require('socket.io').listen(server);
  handleSocketConnection(io);
};