const { Server } = require("socket.io");
const SocketError = require("../errors/socket.error");
const AppError = require("../errors/AppError");
const registerCallHandlers = require("./call.socket");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Mỗi khi có client kết nối
  io.on("connection", (socket) => {
    // Client join room
    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    registerCallHandlers(io, socket);

    socket.on("disconnect", () => {
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
