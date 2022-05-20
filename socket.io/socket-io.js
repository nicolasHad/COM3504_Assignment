exports.init = function (io) {
    // the chat namespace
    const chat = io
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

                socket.on('draw', function (room, userId, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness) {
                    socket.broadcast.to(room).emit('draw', room, userId, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness);
                });

                socket.on('clear canvas', function (room, userId) {
                    socket.broadcast.to(room).emit('clear canvas', room, userId);
                });

                socket.on('disconnect', function () {
                    console.log('someone disconnected');
                });
            } catch (e) {
            }

        });

}
