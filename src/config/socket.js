const ss = require('socket.io-stream');
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

const fileName = '/media/fuboki/ALL/Quran/77-mp3/009-At-Taubah.mp3';

const handleConnection = (socket) => {
  logger.info(`Hello socket ${socket.id}...`);

  let existedSocket = activeSockets.find((el) => {
    return el.id === socket.id;
  });

  if (!existedSocket) {
    existedSocket = {
      id: socket.id,
      stream: ss.createStream()
    };
    activeSockets.push(existedSocket);
  }

  logger.info(`Connected sockets = ${activeSockets.length}`);

  console.log(activeSockets);

  return existedSocket;
};

const handleDisconnection = (socket) => {
  socket.on('disconnect', () => {
    logger.info('Disconnected ....');
    const existedSocket = activeSockets.find((el) => {
      return el.id === socket.id;
    });
    const idx = activeSockets.indexOf(existedSocket);
    activeSockets.splice(idx, 1);
    logger.info(`Connected sockets = ${activeSockets.length}`);
  })
};

const handleAudioStream = (socket, stream, filename) => {
  ss(socket).emit('audio-stream', stream, { name: filename });
  fs.createReadStream(filename).pipe(stream);
  console.log(filename);
}

exports.io = io;

exports.activeSockets = activeSockets;

exports.server = (server) => {
  io = require('socket.io').listen(server);
  // connection 
  io.on('connection', socket => {
    const { stream } = handleConnection(socket);
    handleDisconnection(socket);
    handleAudioStream(socket, stream, fileName);
  })
};