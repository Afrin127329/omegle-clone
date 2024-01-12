import { useState } from "react";

const Home = () => {
  const [name, setName] = useState("");
  return (
    <div className="parent">
      <video width={400} height={400} controls />
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button>Join Room</button>
    </div>
  );
};

export default Home;
