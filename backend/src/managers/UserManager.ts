import { Socket } from "socket.io";

export interface User {
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
    const index = this.users.findIndex((user) => user.socket.id === socketId);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }

    // Update the queue except the found user that has been matched already
    this.queue = this.queue.filter((x) => x === socketId);
  }

  clearQueue() {
    if (this.users.length < 2) {
      return;
    }
    // Extracting last Users from the queue
    const user1 = this.users.find(
      (user) => user.socket.id === this.queue.splice(0, 1)[0]
    );
    const user2 = this.users.find(
      (user) => user.socket.id === this.queue.splice(0, 1)[0]
    );
    if (!user1 || !user2) {
      return;
    }

    // If we have our users, then pass them to the roomManager
    // logic

    // After that clear the queue
    this.clearQueue();
  }
}
