const express = require("express");
const http = require("http");
const query = require("./database");
const socketIo = require("socket.io");
const chats = [];

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("list",  (list) => {
    list
      ? io.emit("backup",  new query().getMessage())
      : io.emit("backup", []);
  });

  socket.on("message", async (message) => {
    console.log("Message received:", message);
    await new query().create(message);
    io.emit("message", message);
    chats.push(message);
    const list = await new query().getMessage();
    io.emit("chats", chats.length > 0 ? chats : list.data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
