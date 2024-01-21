import { useEffect, useState } from "react";
import io, { ManagerOptions, SocketOptions } from "socket.io-client";

const serverURL = "http://localhost:3000";

const Room = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };
  useEffect(() => {
    const connectionOptions: Partial<ManagerOptions & SocketOptions> = {
      reconnectionAttempts: 1000000,
      timeout: 10000,
      transports: ["websocket"],
    };
    const socket = io(serverURL, connectionOptions);
    console.log(socket);
    console.log(message);

    socket.io.on("error", (error: Error) => {
      alert(error);
    });
    socket.emit("message", (message: string) => {
      setMessage(message);
    });
    console.log(socket);

    socket.emit("on-offer", socket.id);
  }, [message]);
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Message"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSubmit}>Send</button>
      {message && message}
    </div>
  );
};

export default Room;
