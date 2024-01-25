import { useRef, useState } from "react";

const Home = () => {
  const userVideoRef = useRef();
  const userOnlineVideoRef = useRef();
  const [name, setName] = useState("");

  const handleSubmit = () => {};
  return (
    <div className="container">
      <h1>Welcome to Chat Room</h1>
      <div className="video">
        <video width={400} height={400} controls ref={userOnlineVideoRef} />
        <video width={400} height={400} controls ref={userVideoRef} />
      </div>
      <form className="btn" onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button>Join Room</button>
      </form>
    </div>
  );
};

export default Home;
