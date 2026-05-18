import { Link } from "react-router-dom";
import logo from "../assets/hunter-hugs-logo.png";
import landingBackground from "../assets/landingpage.jpg";
import "./Landing.css";

function Landing() {
  return (
    <main
      className="landing-page"
      style={{ "--landing-bg-image": `url(${landingBackground})` }}
    >
      <section className="landing-hero">
        <img src={logo} alt="Hunter Hugs" className="landing-hero-logo" />
        <h1>Welcome to Hunter Hugs</h1>
        <p className="landing-tagline">Bridging students to the help they deserve.</p>
        <div className="landing-entry-links">
          <Link to="/signup" className="landing-entry-link">
            Create Your Account
          </Link>
          <Link to="/signin" className="landing-entry-link secondary">
            Existing User?
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Landing;
