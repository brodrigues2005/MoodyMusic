import { Link } from "react-router-dom";
import "../styling/home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="title">Moody Music</h1>

        <p className="subtitle">Let your emotions choose the soundtrack.</p>

        <div className="button-row">
          <Link to="/login" className="home-button">
            Login
          </Link>

          <Link to="/register" className="home-button secondary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
