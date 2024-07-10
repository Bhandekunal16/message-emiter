const express = require("express");
const http = require("http");
const query = require("./database");
const socketIo = require("socket.io");
const chats = [];
const path = require('path')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("list", async (list) => {
    list
      ? io.emit("backup", await new query().getMessage())
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
