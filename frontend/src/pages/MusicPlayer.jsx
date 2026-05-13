import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import "../styling/musicplayer.css";

function MusicPlayer() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const faceLandmarkerRef = useRef(null);

  const [emotion, setEmotion] = useState("Detecting...");
  const [currentSong, setCurrentSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const songsRef = useRef([]);
  const [audioUrl, setAudioUrl] = useState(null);

  const currentEmotionRef = useRef(null);
  const currentSongRef = useRef(null);

  const emotionRef = useRef("Detecting...");

  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    setup();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  async function setup() {
    await fetchSongs();
    await setupMediaPipe();
    await setupWebcam();
    detectLoop();
  }

  async function handleSongEnded() {
    if (currentEmotionRef.current) {
      await playSongForEmotion(currentEmotionRef.current);
    }
  }

  async function fetchSongs() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/songs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      const fetchedSongs = data.songs || [];

      setSongs(fetchedSongs);

      songsRef.current = fetchedSongs;
    }
  }

  async function setupMediaPipe() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: true,
        numFaces: 1,
      },
    );
  }

  async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;

    return new Promise((resolve) => {
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        resolve();
      };
    });
  }

  function blendshapesToObject(blendshapes) {
    const obj = {};

    blendshapes.forEach((shape) => {
      obj[shape.categoryName] = shape.score;
    });

    return obj;
  }

  async function detectLoop() {
    if (!videoRef.current || !faceLandmarkerRef.current) {
      requestAnimationFrame(detectLoop);
      return;
    }

    const results = faceLandmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now(),
    );

    if (results.faceBlendshapes.length > 0) {
      const blendshapeData = blendshapesToObject(
        results.faceBlendshapes[0].categories,
      );

      await sendEmotion(blendshapeData);
    }

    setTimeout(() => {
      requestAnimationFrame(detectLoop);
    }, 2000);
  }
  async function sendEmotion(blendshapeData) {
    const response = await fetch(`${API_URL}/emotion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(blendshapeData),
    });

    const detectedEmotion = await response.json();

    const emotionValue =
      typeof detectedEmotion === "string"
        ? detectedEmotion
        : detectedEmotion.emotion;

    if (!emotionValue) return;

    const normalizedEmotion = emotionValue.toLowerCase().trim();

    setEmotion(normalizedEmotion);

    if (normalizedEmotion === currentEmotionRef.current) {
      return;
    }

    currentEmotionRef.current = normalizedEmotion;
    await playSongForEmotion(normalizedEmotion);
  }

  async function getSongBlobUrl(songId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/songs/${songId}/file`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await response.blob();

    return URL.createObjectURL(blob);
  }

  async function playSongForEmotion(detectedEmotion) {
    const matchingSongs = songsRef.current.filter(
      (song) =>
        song.emotion.toLowerCase().trim() ===
        detectedEmotion.toLowerCase().trim(),
    );

    if (matchingSongs.length === 0) {
      setCurrentSong(null);
      setAudioUrl(null);
      currentSongRef.current = null;
      return;
    }

    let availableSongs = matchingSongs;

    if (currentSongRef.current && matchingSongs.length > 1) {
      availableSongs = matchingSongs.filter(
        (song) => song.sid !== currentSongRef.current.sid,
      );
    }

    const randomSong =
      availableSongs[Math.floor(Math.random() * availableSongs.length)];

    currentSongRef.current = randomSong;
    setCurrentSong(randomSong);

    const url = await getSongBlobUrl(randomSong.sid);
    setAudioUrl(url);
  }

  return (
    <div className="player-page">
      <div className="player-card">
        <div className="player-header">
          <h1>Moody Music</h1>

          <div className="player-header-buttons">
            <button
              onClick={() => navigate("/songcollection")}
              className="edit-btn"
            >
              Edit Collection
            </button>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <video ref={videoRef} className="webcam" autoPlay muted playsInline />

        <div className="info-panel">
          <h2>Current Emotion</h2>
          <p>{emotion}</p>

          <h2>Current Song</h2>
          <p>{currentSong ? currentSong.song_name : "No matching song yet"}</p>
        </div>
        {audioUrl && (
          <audio
            ref={audioRef}
            controls
            src={audioUrl}
            className="audio-player"
            onCanPlay={() => audioRef.current?.play()}
            onEnded={handleSongEnded}
          />
        )}
      </div>
    </div>
  );
}

export default MusicPlayer;
