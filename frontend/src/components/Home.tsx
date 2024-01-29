import { useEffect, useRef, useState } from "react";
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from "socket.io-client";

// Variables
let pc: any;
let localStream: any;
let startBtn: { current: { disabled: boolean } };
let hangupButton: { current: { disabled: boolean } };
let muteAudButton: { current: { disabled: boolean } };
let remoteVideo: any;

// Ice server Config for Ice Candidates
const config = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const socket = io("http://localhost:3000", { transports: ["websocket"] });

socket.on("message", (e) => {
  if (!localStream) {
    console.log("Connection not Ready");
    return;
  }

  switch (e.type) {
    case "offer":
      handleOffer(e);
      break;
    case "answer":
      handleAnswer(e);
      break;
    case "candidate":
      handleCandidate(e);
      break;
    case "ready":
      if (pc) {
        console.log("Already Call in progress");
        return;
      }
      makeCall();
      break;
    case "bye":
      if (pc) {
        hangup();
      }
      break;
    default:
      console.log("Unhandled", e);
      break;
  }
});

async function makeCall() {
  try {
    pc = new RTCPeerConnection(config);

    pc.onicecandidate = (e: {
      candidate: { candidate: any; sdpMid: any; sdpMLineIndex: any };
    }) => {
      const message: any = {
        type: "candidate",
        candidate: "",
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };

    pc.ontrack = (e: { streams: any[] }) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    localStream.getTracks().forEach((track: any) => {
      pc.addTrack(track, localStream);
    });

    const offer = await pc.createOffer();

    socket.emit("message", {
      type: "offer",
      sdp: offer.sdp,
    });

    await pc.setRemoteDescription(offer);
  } catch (error) {
    console.log(error);
  }
}

async function handleOffer(offer: any) {
  if (pc) {
    console.error("Peer connection Exists");
    return;
  }

  try {
    pc = new RTCPeerConnection(config);
    pc.onicecandidate = (e: {
      candidate: { candidate: any; sdpMid: any; sdpMLineIndex: any };
    }) => {
      const message: any = {
        type: "candidate",
        candidate: null,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };
    pc.ontrack = async (e: { streams: any[] }) => {
      remoteVideo.current.srcObject = e.streams[0];
      localStream
        .getTracks()
        .forEach((track: any) => pc.addTrack(track, localStream));
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      socket.emit("message", { type: "answer", sdp: answer.sdp });
      await pc.setLocalDescription(answer);
    };
  } catch (error) {
    console.log(error);
  }
}

async function handleAnswer(answer: any) {
  if (!pc) {
    console.error("No Peer Connection");
    return;
  }
  try {
    await pc.setRemoteDescription(answer);
  } catch (error) {
    console.log(error);
  }
}

async function handleCandidate(candidate: any) {
  try {
    if (!pc) {
      console.error("No Peer Connection");
      return;
    }
    if (candidate) {
      await pc.addIceCandidate(candidate);
    }
  } catch (error) {
    console.log(error);
  }
}

async function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach((track: any) => {
    track.stop();
  });
  localStream = null;
  startBtn.current.disabled = false;
  hangupButton.current.disabled = true;
  muteAudButton.current.disabled = true;
}

const Home = () => {
  const startBtn = useRef(null);
  const hangupButton = useRef<HTMLButtonElement>(null);
  const muteAudButton = useRef<HTMLButtonElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef(null);
  const [name, setName] = useState("");
  const [audiostate, setAudio] = useState(false);

  useEffect(() => {
    if (hangupButton.current) {
      hangupButton.current.disabled = true;
    }
    if (muteAudButton.current) {
      muteAudButton.current.disabled = true;
    }
  }, []);

  const startB = async () => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      if (!localVideo.current) {
        return;
      }
      localVideo.current.srcObject = localStream;
    } catch (err) {
      console.log(err);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    startBtn.current.disabled = true;
    if (hangupButton.current) {
      hangupButton.current.disabled = false;
    }
    if (muteAudButton.current) {
      muteAudButton.current.disabled = false;
    }
    socket.emit("message", { type: "ready" });
  };

  const hangB = async () => {
    hangup();
    socket.emit("message", { type: "bye" });
  };

  function muteAudio() {
    if (audiostate) {
      if (localVideo.current) {
        localVideo.current.muted = true;
      }
      setAudio(false);
    } else {
      if (localVideo.current) {
        localVideo.current.muted = false;
      }
      setAudio(true);
    }
  }

  const handleSubmit = () => {};
  return (
    <div className="container">
      <h1>Welcome to Chat Room</h1>
      <div className="video">
        <video
          width={400}
          height={400}
          controls
          ref={localVideo}
          autoPlay
          playsInline
          src=""
        />
        <video
          width={400}
          height={400}
          controls
          ref={remoteVideo}
          autoPlay
          playsInline
          src=""
        />
      </div>
      <form className="btn" onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button className="btn-item btn-start" ref={startBtn} onClick={startB}>
          {" "}
          <FiVideo /> Join Room
        </button>
        <button className="btn-item btn-end" ref={hangupButton} onClick={hangB}>
          {" "}
          <FiVideoOff />
        </button>
        <button
          className="btn-item btn-start"
          ref={muteAudButton}
          onClick={muteAudio}
        >
          {" "}
          {audiostate ? <FiMic /> : <FiMicOff />}
        </button>
      </form>
    </div>
  );
};

export default Home;
