/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { io } from "socket.io-client";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
const socket = io("http://localhost:3000", { transports: ["websocket"] });

let pc: any;
let localStream: any;
let startButton: any;
let hangupButton: any;
let muteAudButton: any;
let remoteVideo: any;
let localVideo: any;
socket.on("message", (e) => {
  if (!localStream) {
    console.log("not ready yet");
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
      // A second tab joined. This tab will initiate a call unless in a call already.
      if (pc) {
        console.log("already in call, ignoring");
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
      console.log("unhandled", e);
      break;
  }
});

async function makeCall() {
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e: any) => {
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
    pc.ontrack = (e: { streams: any[] }) =>
      (remoteVideo.current.srcObject = e.streams[0]);
    localStream
      .getTracks()
      .forEach((track: any) => pc.addTrack(track, localStream));
    const offer = await pc.createOffer();
    socket.emit("message", { type: "offer", sdp: offer.sdp });
    await pc.setLocalDescription(offer);
  } catch (e) {
    console.log(e);
  }
}

async function handleOffer(offer: any) {
  if (pc) {
    console.error("existing peerconnection");
    return;
  }
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e: any) => {
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
    pc.ontrack = (e: any) => (remoteVideo.current.srcObject = e.streams[0]);
    localStream
      .getTracks()
      .forEach((track: any) => pc.addTrack(track, localStream));
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    socket.emit("message", { type: "answer", sdp: answer.sdp });
    await pc.setLocalDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleAnswer(answer: any) {
  if (!pc) {
    console.error("no peerconnection");
    return;
  }
  try {
    await pc.setRemoteDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleCandidate(candidate: any) {
  try {
    if (!pc) {
      console.error("no peerconnection");
      return;
    }
    if (!candidate) {
      await pc.addIceCandidate(null);
    } else {
      await pc.addIceCandidate(candidate);
    }
  } catch (e) {
    console.log(e);
  }
}
async function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach((track: any) => track.stop());
  localStream = null;
  startButton.current.disabled = false;
  hangupButton.current.disabled = true;
  muteAudButton.current.disabled = true;
}

function App() {
  startButton = useRef(null);
  hangupButton = useRef(null);
  muteAudButton = useRef(null);
  localVideo = useRef(null);
  remoteVideo = useRef(null);
  useEffect(() => {
    hangupButton.current.disabled = true;
    muteAudButton.current.disabled = true;
  }, []);
  const [audiostate, setAudio] = useState(false);

  const startB = async () => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      localVideo.current.srcObject = localStream;
    } catch (err) {
      console.log(err);
    }

    startButton.current.disabled = true;
    hangupButton.current.disabled = false;
    muteAudButton.current.disabled = false;

    socket.emit("message", { type: "ready" });
  };

  const hangB = async () => {
    hangup();
    socket.emit("message", { type: "bye" });
  };

  function muteAudio() {
    if (audiostate) {
      localVideo.current.muted = true;
      setAudio(false);
    } else {
      localVideo.current.muted = false;
      setAudio(true);
    }
  }

  return (
    <>
      <main className="container  ">
        <div className="video bg-main">
          <video
            ref={localVideo}
            className="video-item"
            autoPlay
            playsInline
            src=" "
          ></video>
          <video
            ref={remoteVideo}
            className="video-item"
            autoPlay
            playsInline
            src=" "
          ></video>
        </div>

        <div className="btn">
          <button
            className="btn-item btn-start"
            ref={startButton}
            onClick={startB}
          >
            {" "}
            <FiVideo />
          </button>
          <button
            className="btn-item btn-end"
            ref={hangupButton}
            onClick={hangB}
          >
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
        </div>
      </main>
    </>
  );
}

export default App;
