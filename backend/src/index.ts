import bodyParser from "body-parser";
import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { RoomManager } from "./managers/RoomManager";
import { UserManager } from "./managers/UserManager";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from Server</h1>");
});

// Create a new user manager
const userManager = new UserManager();
const roomManager = new RoomManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  // grab the name from the input box from front end
  const user = socket.handshake.query.name;
  // @ts-ignore
  userManager.createUser(user, socket);

  socket.on("offer", (socket) => {
    roomManager.onOffer(socket);
  });

  // remove the user if he leaves the room
  io.on("disconnect", (socket: Socket) => {
    userManager.deleteUser(socket.id);
  });
});
server.listen(3000, () => {
  console.log("server running at 3000");
});
