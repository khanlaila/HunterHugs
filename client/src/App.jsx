import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Chatbot from "./pages/EligibilityEngine";
import Profile from "./pages/Profile";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/eligibility" element={<Chatbot />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;