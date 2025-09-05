const { Server } = require("socket.io");
const SocketError = require("../errors/socket.error");
const AppError = require("../errors/AppError")
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Client join room theo userId
    socket.on("join", (userId) => {
      if (!userId) {
        return socket.emit("errorMessage", SocketError.USER_NOT_FOUND);
      }
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Client gửi tin nhắn 1-1
    socket.on("sendMessage", (message) => {
      try {
        if (!message || !message.receiverId || !message.content) {
          return socket.emit("errorMessage", SocketError.INVALID_MESSAGE);
        }
        io.to(message.receiverId).emit("receiveMessage", message);
        console.log("Message sent:", message);
      } catch (err) {
        console.error(err);
        socket.emit("errorMessage", SocketError.SERVER_ERROR);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

// Lấy instance io để dùng ở các file khác
function getIO() {
  if (!io) {
    throw new AppError(SocketError.CONNECTION_FAILED);
  }
  return io;
}

module.exports = { initSocket, getIO };
