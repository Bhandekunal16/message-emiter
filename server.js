const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const query = require("./database");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const activeUsers = {};

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (username) => {
    activeUsers[socket.id] = username;
    console.log(`${username} joined`);
  });

  socket.on("disconnect", () => {
    const username = activeUsers[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      delete activeUsers[socket.id];
    }
  });

  socket.on("chat message", (message) => {
    const username = activeUsers[socket.id];
    if (username) {
      console.log(`${username}: ${message}`);
      io.emit("chat message", `${username}: ${message}`);
    }
  });
});

app.post("/api/messages", (req, res) => {
  const { username, message } = req.body;
  // messages.push({ username, message });
  new query().create({ username, message });
  io.emit("chat message", `${username}: ${message}`);
  res.status(200).json({ message: "Message sent successfully" });
});

app.get("/api/messages", async (req, res) => {
  let messages = await new query().getMessage();
  res.status(200).json(messages.data);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
