import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Explore from "./pages/Explore.jsx";
import AddEditSkill from "./pages/AddEditSkill.jsx";
import SkillDetails from "./pages/SkillDetails.jsx";
import MyRequests from "./pages/MyRequests.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/skills/new" element={<AddEditSkill />} />
        <Route path="/skills/:id/edit" element={<AddEditSkill />} />
        <Route path="/skills/:id" element={<SkillDetails />} />
        <Route path="/requests" element={<MyRequests />} />
        <Route
          path="*"
          element={
            <div className="page">
              <div className="state-block">
                <div className="state-icon">🧭</div>
                <h3>Page not found</h3>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
