import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MusicPlayer from "./pages/MusicPlayer";
import SongCollection from "./pages/SongCollection";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected Page */}
        <Route
          path="/musicplayer"
          element={
            <ProtectedRoute>
              <MusicPlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/songcollection"
          element={
            <ProtectedRoute>
              <SongCollection />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
