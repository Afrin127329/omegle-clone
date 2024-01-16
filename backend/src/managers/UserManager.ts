import { Socket } from "socket.io";

interface User {
  user: string;
  socket: Socket;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  constructor() {
    this.users = [];
    this.queue = [];
  }

  createUser(user: string, socket: Socket) {
    // Update Users array with new created user
    this.users.push({
      user,
      socket,
    });

    // Add created new user to the queue
    this.queue.push(socket.id);
  }

  deleteUser(socketId: string) {
    // Find the user based on socketId
    const user = this.users.find((x) => x.socket.id === socketId);

    // Update the users Array
    this.users = this.users.filter((x) => x.socket.id !== socketId);
    // Update the queue except the found user that has been matched already
    this.queue = this.queue.filter((x) => x === socketId);
  }
}
