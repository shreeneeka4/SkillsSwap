import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import { api } from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import SkillCard from "../components/SkillCard.jsx";
import { Loader, EmptyState, ErrorBanner } from "../components/States.jsx";

export default function Dashboard() {
  const { activeUser, loading: userLoading } = useActiveUser();
  const [stats, setStats] = useState(null);
  const [recentSkills, setRecentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeUser) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [statsData, skillsData] = await Promise.all([
          api.getUserStats(activeUser._id),
          api.getSkills(),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setRecentSkills(skillsData.slice(0, 6));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  if (userLoading) {
    return (
      <div className="page">
        <Loader label="Loading your dashboard..." />
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="page">
        <EmptyState
          icon="👋"
          title="No students yet"
          message="Run the seed script or create a profile to get started."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Welcome back, {activeUser.name.split(" ")[0]}</h1>
          <p className="subtitle">
            Here's what's happening with your skills and learning requests.
          </p>
        </div>
        <Link to="/skills/new" className="btn btn-teach">
          + Add a skill
        </Link>
      </div>

      <ErrorBanner message={error} />

      {loading || !stats ? (
        <Loader label="Crunching your stats..." />
      ) : (
        <div className="stat-grid">
          <StatCard label="Skills Offered" value={stats.skillsOffered} accent="#2A9D8F" />
          <StatCard label="Skills Wanted" value={stats.skillsWanted} accent="#E76F51" />
          <StatCard label="Pending Requests" value={stats.pendingRequests} accent="#F4A261" />
          <StatCard label="Requests Accepted" value={stats.acceptedSent} accent="#457B9D" />
        </div>
      )}

      <div className="page-header" style={{ marginTop: 8 }}>
        <div>
          <h2 style={{ fontSize: "1.15rem" }}>Recently added skills</h2>
        </div>
        <Link to="/explore" className="btn btn-outline btn-sm">
          Explore all
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : recentSkills.length === 0 ? (
        <EmptyState
          icon="🧩"
          title="No skills listed yet"
          message="Be the first to add a skill others can learn from."
        />
      ) : (
        <div className="skill-grid">
          {recentSkills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
