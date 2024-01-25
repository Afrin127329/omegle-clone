/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from "socket.io-client";

// Variables
let pc: RTCPeerConnection;
let localStream: any;
// let startBtn;
// let hangupBtn;
// let muteBtn;
let remoteVideo: any;
// let localVideo;

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

export async function makeCall() {
  try {
    pc = new RTCPeerConnection(config);

    pc.onicecandidate = (e) => {
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

    pc.ontrack = (e) => {
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

export async function handleOffer(offer) {}

export async function handleAnswer(answer) {}

export async function handleCandidate(candidate) {}

export async function hangup() {}
