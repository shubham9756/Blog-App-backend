const http = require("http");
const { Server } = require("socket.io");
const app = require("./index");
const commentSocket = require("./socket/socket");

const port = 1000;

// HTTP server
const server = http.createServer(app);

// Socket server
const io = new Server(server, {
  cors: {
    origin:"http://localhost:5173",
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
