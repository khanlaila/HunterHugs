import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Resources from "./pages/Resources";
import Chatbot from "./pages/EligibilityEngine";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/resources" element={<Resources />} />
        <Route path="/eligibility" element={<Chatbot />} />
      </Routes>
    </>
  );
}

export default App;