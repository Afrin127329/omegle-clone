import { useEffect } from "react";
import io, { ManagerOptions, SocketOptions } from "socket.io-client";

const serverURL = "http://localhost:3000";

const Room = () => {
  useEffect(() => {
    const connectionOptions: Partial<ManagerOptions & SocketOptions> = {
      reconnectionAttempts: 1000000,
      timeout: 10000,
      transports: ["websocket"],
    };
    const socket = io(serverURL, connectionOptions);

    socket.io.on("error", (error: Error) => {
      alert(error);
    });
    socket.on("message", (message) => {
      alert(message);
    });
    console.log(socket);

    socket.emit("on-offer", socket.id);
  }, []);
  return <div>Hello from Room</div>;
};

export default Room;
