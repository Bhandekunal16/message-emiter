const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const query = require("./database");
const redis = require("redis");
const { promisify } = require("util");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const activeUsers = {};
const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

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

  socket.on("join", async (username) => {
    await setAsync(socket.id, username);
    console.log(`${username} joined`);
  });

  socket.on("disconnect", async () => {
    const username = await getAsync(socket.id);
    if (username) {
      console.log(`${username} disconnected`);
      redisClient.del(socket.id);
    }
  });

  socket.on("chat message", async (message) => {
    const username = await getAsync(socket.id);
    if (username) {
      console.log(`${username}: ${message}`);
      io.emit("chat message", message);
      // io.emit("chat message", `${username}: ${message}`);
    }
  });
});

app.post("/", async (req, res) => {
  const { username, message } = req.body;
  io.emit("chat message", `${username}: ${message}`);
  await new query().create({ username, message });
  res.status(200).json({ message: "Message sent successfully" });
});

app.get("/", async (req, res) => {
  let messages = await new query().getMessage();
  res.status(200).json(messages.data);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
