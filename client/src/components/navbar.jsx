import { Link, NavLink } from "react-router-dom";
import logo from "../assets/hunter-hugs-logo.png";
import "./navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/home" className="navbar-logo">
        <img src={logo} alt="Hunter Hugs Logo" className="navbar-logo-img" />
      </Link>

      <nav className="navbar-links">
        <NavLink to="/home" className="nav-link">
          Home
        </NavLink>

        <NavLink to="/resources" className="nav-link">
          Resources
        </NavLink>

        <NavLink to="/eligibility" className="nav-link">
          Eligibility Engine
        </NavLink>

        <NavLink to="/roadmap" className="nav-link">
          My Roadmap
        </NavLink>

        <NavLink to="/profile" className="nav-link">
          Profile
        </NavLink>
        <button className="logout-button" type="button">
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
