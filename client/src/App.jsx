import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Chatbot from "./pages/EligibilityEngine";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import "./App.css";

function App() {
  const location = useLocation();
  const publicAuthPages = ["/", "/signin", "/signup", "/verify-email"];
  const shouldShowNavbar = !publicAuthPages.includes(location.pathname);
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  function renderPrivateRoute(element) {
    return isAuthenticated ? element : <Navigate to="/signin" replace />;
  }
  return (
    <>
      {shouldShowNavbar ? <Navbar /> : null}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/home" element={renderPrivateRoute(<Home />)} />
        <Route path="/resources" element={renderPrivateRoute(<Resources />)} />
        <Route path="/eligibility" element={renderPrivateRoute(<Chatbot />)} />
        <Route path="/profile" element={renderPrivateRoute(<Profile />)} />
      </Routes>
    </>
  );
}

export default App;
