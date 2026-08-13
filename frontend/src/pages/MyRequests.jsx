import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import { api } from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import { Loader, EmptyState, ErrorBanner } from "../components/States.jsx";

const STATUS_PILL = {
  Pending: "pill-pending",
  Accepted: "pill-accepted",
  Rejected: "pill-rejected",
};

export default function MyRequests() {
  const { activeUser } = useActiveUser();
  const [tab, setTab] = useState("received"); // received | sent
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    if (!activeUser) return;
    setLoading(true);
    setError("");
    api
      .getRequests(activeUser._id, tab)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeUser, tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id, status) {
    setBusyId(id);
    setError("");
    try {
      await api.updateRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function cancelRequest(id) {
    if (!window.confirm("Withdraw this request?")) return;
    setBusyId(id);
    setError("");
    try {
      await api.deleteRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!activeUser) {
    return (
      <div className="page">
        <Loader label="Loading..." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Requests</span>
          <h1>My Requests</h1>
          <p className="subtitle">
            Manage learning requests you've received as a teacher, and track ones you've sent.
          </p>
        </div>
      </div>

      <div className="tab-row">
        <button
          className={`tab-btn ${tab === "received" ? "active" : ""}`}
          onClick={() => setTab("received")}
        >
          Received
        </button>
        <button className={`tab-btn ${tab === "sent" ? "active" : ""}`} onClick={() => setTab("sent")}>
          Sent
        </button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="📨"
          title={tab === "received" ? "No requests received yet" : "You haven't sent any requests"}
          message={
            tab === "received"
              ? "Once someone wants to learn a skill from you, it'll show up here."
              : "Find a skill in Explore and send a learning request to get started."
          }
        />
      ) : (
        <div className="request-list">
          {requests.map((r) => {
            const otherUser = tab === "received" ? r.fromUser : r.toUser;
            const isBusy = busyId === r._id;
            return (
              <div className="request-row" key={r._id}>
                <Avatar name={otherUser?.name} color={otherUser?.avatarColor} />
                <div className="request-main">
                  <div className="request-title">
                    <Link to={`/skills/${r.skill?._id}`}>{r.skill?.title || "Skill removed"}</Link>
                  </div>
                  <div className="request-sub">
                    {tab === "received" ? "Requested by" : "Requested to"} {otherUser?.name}
                  </div>
                  {r.message && <div className="request-message">"{r.message}"</div>}
                </div>

                <span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span>

                <div className="request-actions">
                  {tab === "received" && r.status === "Pending" && (
                    <>
                      <button
                        className="btn btn-teach btn-sm"
                        onClick={() => respond(r._id, "Accepted")}
                        disabled={isBusy}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => respond(r._id, "Rejected")}
                        disabled={isBusy}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {tab === "sent" && r.status === "Pending" && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => cancelRequest(r._id)}
                      disabled={isBusy}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
