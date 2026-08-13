import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import { api } from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import { Loader, ErrorBanner, SuccessBanner } from "../components/States.jsx";

export default function SkillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeUser } = useActiveUser();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getSkill(id)
      .then((data) => !cancelled && setSkill(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSendRequest(e) {
    e.preventDefault();
    if (!activeUser) return;
    setSending(true);
    setError("");
    try {
      await api.sendRequest({ skillId: id, fromUser: activeUser._id, message });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading skill details..." />
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="page">
        <div className="state-block">
          <div className="state-icon">😕</div>
          <h3>Couldn't load this skill</h3>
          <p>{error}</p>
          <Link to="/explore" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!skill) return null;

  const isOwner = activeUser && skill.teacher._id === activeUser._id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">{skill.category}</span>
          <h1>{skill.title}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <span className="pill pill-level">{skill.level}</span>
            <span className="pill pill-category">{skill.category}</span>
          </div>
        </div>
        {isOwner && (
          <Link to={`/skills/${skill._id}/edit`} className="btn btn-outline">
            Edit skill
          </Link>
        )}
      </div>

      <ErrorBanner message={error && skill ? error : ""} />

      <div className="details-layout">
        <div className="card card-pad">
          <h3 style={{ marginBottom: 10 }}>About this skill</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{skill.description}</p>
        </div>

        <div className="card card-pad teacher-card">
          <h3>Taught by</h3>
          <div className="teacher-top">
            <Avatar name={skill.teacher.name} color={skill.teacher.avatarColor} size="lg" />
            <div>
              <strong>{skill.teacher.name}</strong>
              <p style={{ fontSize: "0.85rem" }}>{skill.teacher.email}</p>
            </div>
          </div>
          {skill.teacher.bio && <p style={{ fontSize: "0.88rem" }}>{skill.teacher.bio}</p>}
          <span className="pill pill-category" style={{ width: "fit-content" }}>
            📅 {skill.teacher.availability || "Flexible"}
          </span>

          {!isOwner && (
            <>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "6px 0" }} />
              {sent ? (
                <SuccessBanner message="Request sent! Track it under My Requests." />
              ) : (
                <form onSubmit={handleSendRequest}>
                  <div className="form-group">
                    <label htmlFor="message">Message (optional)</label>
                    <textarea
                      id="message"
                      className="form-control"
                      placeholder={`Hi ${skill.teacher.name.split(" ")[0]}, I'd love to learn this because...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ minHeight: 80 }}
                    />
                  </div>
                  <button type="submit" className="btn btn-teach btn-block" disabled={sending}>
                    {sending ? "Sending..." : "Send learning request"}
                  </button>
                </form>
              )}
            </>
          )}

          {isOwner && (
            <p className="helper-text">This is your own skill listing — students can request it from here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
