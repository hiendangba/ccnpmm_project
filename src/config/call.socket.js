function registerCallHandlers(io, socket) {

  socket.on("callRequest", (data) => {
    io.to(data.conversation.conversationId).emit("callRequest", data);
  });

  socket.on("cancelCall", (data) => {
    io.to(data.conversationId).emit("cancelCall", data);
  })

  socket.on("call-accepted", (data) => {
    io.to(data.conversation.conversationId).emit("call-accepted", data);
  })

  socket.on("call-offer", (data) => {
    io.to(data.conversation.conversationId).emit("call-offer", data);
  });

  socket.on("call-answer", (data) => {
    io.to(data.conversationId).emit("call-answer", data);
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.conversationId).emit("ice-candidate", data);
  });

  socket.on("call-ended", (data) => {
    io.to(data.conversationId).emit("call-ended", data);
  });
}

module.exports = registerCallHandlers;
