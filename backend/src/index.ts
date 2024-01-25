import bodyParser from "body-parser";
import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// middlewares
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Initial route
app.get("/", (req, res) => {
  res.status(200).send("<h1>Hello from Server</h1>");
});

io.on("connection", (socket: Socket) => {
  console.log("User connected");
  // grab the name from the input box from front end
  const user = socket.handshake.query.name;

  socket.on("message", (message: string) => {
    socket.broadcast.emit("message", message);
  });

  // On disconnection
  io.on("disconnect", (socket: Socket) => {
    socket.broadcast.emit("disconnected", "User Disconnected!");
  });
});
server.listen(3000, () => {
  console.log("server running at 3000");
});
