import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
});
server.listen(3000, () => {
  console.log("server running at 3000");
});
