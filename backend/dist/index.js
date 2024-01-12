"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.get("/", (req, res) => {
    console.log("Hello world!");
});
server.listen(3000, () => {
    console.log("Server running on 3000");
});
