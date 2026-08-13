import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import { api } from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import SkillCard from "../components/SkillCard.jsx";
import { Loader, EmptyState, ErrorBanner, SuccessBanner } from "../components/States.jsx";

export default function Profile() {
  const { activeUser, refreshActiveUser, loading: userLoading } = useActiveUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mySkills, setMySkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    if (activeUser) {
      setForm({
        name: activeUser.name,
        bio: activeUser.bio,
        availability: activeUser.availability,
        college: activeUser.college,
      });
    }
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    let cancelled = false;
    setSkillsLoading(true);
    api
      .getSkills({ teacher: activeUser._id })
      .then((data) => !cancelled && setMySkills(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setSkillsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateUser(activeUser._id, form);
      await refreshActiveUser();
      setSuccess("Profile updated.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (userLoading || !activeUser || !form) {
    return (
      <div className="page">
        <Loader label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Student Profile</span>
          <h1>Your Profile</h1>
          <p className="subtitle">Manage how other students see you on SkillSwap.</p>
        </div>
        {!editing && (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="card card-pad" style={{ marginBottom: 28 }}>
        {!editing ? (
          <>
            <div className="profile-header">
              <Avatar name={activeUser.name} color={activeUser.avatarColor} size="lg" />
              <div>
                <h2>{activeUser.name}</h2>
                <p>{activeUser.email}</p>
              </div>
            </div>
            <p style={{ marginBottom: 14 }}>{activeUser.bio || "No bio yet."}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="pill pill-category">📅 {activeUser.availability || "Flexible"}</span>
              {activeUser.college && <span className="pill pill-category">🎓 {activeUser.college}</span>}
            </div>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                className="form-control"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell other students a bit about yourself..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="availability">Availability</label>
                <input
                  id="availability"
                  className="form-control"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  placeholder="e.g. Weekday evenings"
                />
              </div>
              <div className="form-group">
                <label htmlFor="college">College</label>
                <input
                  id="college"
                  className="form-control"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="e.g. Metro State University"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-teach" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="page-header">
        <h2 style={{ fontSize: "1.15rem" }}>Skills you teach</h2>
        <Link to="/skills/new" className="btn btn-teach btn-sm">
          + Add a skill
        </Link>
      </div>

      {skillsLoading ? (
        <Loader />
      ) : mySkills.length === 0 ? (
        <EmptyState
          icon="🧑‍🏫"
          title="You haven't listed any skills yet"
          message="Share something you're good at so other students can find you."
        />
      ) : (
        <div className="skill-grid">
          {mySkills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
