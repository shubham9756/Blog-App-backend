const http = require("http");
const { Server } = require("socket.io");
const app = require("./index");
const commentSocket = require("./socket/socket");
require('dotenv').config();

const port = process.env.PORT || 4000;

// HTTP server
const server = http.createServer(app);

// Socket server
const io = new Server(server, {
  cors: {
    origin:"https://blog-app-tau-wheat-36.vercel.app",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  commentSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log("Server started on port " + port);
});
