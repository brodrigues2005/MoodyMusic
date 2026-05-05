import { useEffect, useState } from "react";
import "../styling/songcollection.css";

function SongCollection() {
  const [songs, setSongs] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  const [songName, setSongName] = useState("");
  const [emotion, setEmotion] = useState("");
  const [file, setFile] = useState(null);

  const [audioUrls, setAudioUrls] = useState({});

  const API_URL = "http://127.0.0.1:8000";

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

  async function fetchSongs() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/songs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      const fetchedSongs = data.songs;
      setSongs(data.songs);

      const urls = {};

      for (const song of fetchedSongs) {
        urls[song.sid] = await getSongBlobUrl(song.sid);
      }

      setAudioUrls(urls);
    } else {
      alert(data.detail || "Failed to load songs");
    }
  }

  useEffect(() => {
    fetchSongs();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("song_name", songName);
    formData.append("emotion", emotion);
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert("Song uploaded successfully");

      setSongName("");
      setEmotion("");
      setFile(null);
      setShowUpload(false);

      fetchSongs();
    } else {
      alert(data.detail || "Upload failed");
    }
  }

  async function handleDelete(songId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/delete/songs/${songId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setSongs(songs.filter((song) => song.sid !== songId));
    } else {
      alert("Failed to delete song");
    }
  }

  return (
    <div className="songs-page">
      <div className="songs-card">
        <div className="songs-header">
          <h1>Your Songs</h1>

          <button onClick={() => setShowUpload(true)} className="upload-btn">
            Upload Song
          </button>
        </div>

        <div className="song-list">
          {songs.length === 0 ? (
            <p className="empty-message">No songs uploaded yet.</p>
          ) : (
            songs.map((song) => (
              <div className="song-item" key={song.sid}>
                <div>
                  <h3>{song.song_name}</h3>
                  <p>{song.emotion}</p>
                </div>

                <div className="song-actions">
                  <audio controls src={audioUrls[song.sid]} />

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(song.sid)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUpload && (
        <div className="modal-overlay">
          <form className="upload-modal" onSubmit={handleUpload}>
            <h2>Upload Song</h2>

            <input
              type="text"
              placeholder="Song name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              required
            />

            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              required
            >
              <option value="">Select emotion</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="surprised">Surprised</option>
              <option value="neutral">Neutral</option>
            </select>

            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />

            <div className="modal-buttons">
              <button type="submit">Upload</button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SongCollection;
