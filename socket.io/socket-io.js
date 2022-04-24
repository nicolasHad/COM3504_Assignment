
exports.init = function(io) {
  // the chat namespace
  const chat= io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          /**
           * it creates or joins a room
           */
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
          });

          socket.on('chat', function (room, userId, chatText) {
            chat.to(room).emit('chat', room, userId, chatText);
          });

          socket.on('disconnect', function(){
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
}
