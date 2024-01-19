import { Socket } from "socket.io";
import { User } from "./UserManager";

const roomId = Math.random().toString();

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  public rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  // Create the room based on User1 and user2
  createRoom(user1: User, user2: User) {
    this.rooms.set(roomId, {
      user1,
      user2,
    });
    console.log("Creating room");

    // Send a message to User1
    user1.socket.emit("on-offer", {
      roomId,
    });

    // Send a message to User2
    user2.socket.emit("on-offer", {
      roomId,
    });

    // create the room
  }

  // Logic on Offer
  onOffer(socket: Socket) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    socket.emit("offer", {
      roomId,
    });
  }

  // Logic on Answer
  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  // Logic on Ice candidate
}
