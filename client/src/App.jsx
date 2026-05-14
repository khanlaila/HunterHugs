import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Resources from "./pages/Resources";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </>
  );
}

export default App;