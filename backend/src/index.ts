import bodyParser from "body-parser";
import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { UserManager } from "./managers/UserManager";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

// Create a new user manager
const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  // grab the name from the input box from front end
  const user = socket.handshake.query.name;
  // @ts-ignore
  userManager.createUser(user, socket);

  // remove the user
  io.on("disconnect", (socket: Socket) => {
    userManager.deleteUser(socket.id);
  });
});
server.listen(3000, () => {
  console.log("server running at 3000");
});
