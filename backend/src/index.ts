import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

app.get("/", (req, res) => {
  console.log("Hello world!");
});

server.listen(3000, () => {
  console.log("Server running on 3000");
});
