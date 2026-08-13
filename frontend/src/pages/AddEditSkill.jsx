import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import { api } from "../api/client.js";
import { Loader, ErrorBanner } from "../components/States.jsx";

const EMPTY_FORM = { title: "", description: "", category: "", level: "" };

export default function AddEditSkill() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { activeUser } = useActiveUser();

  const [meta, setMeta] = useState({ categories: [], levels: [] });
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notOwner, setNotOwner] = useState(false);

  useEffect(() => {
    api.getSkillMeta().then((data) => {
      setMeta(data);
      setForm((f) => (f.category ? f : { ...f, category: data.categories[0], level: data.levels[0] }));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    api
      .getSkill(id)
      .then((skill) => {
        if (cancelled) return;
        if (activeUser && skill.teacher._id !== activeUser._id) {
          setNotOwner(true);
          return;
        }
        setForm({
          title: skill.title,
          description: skill.description,
          category: skill.category,
          level: skill.level,
        });
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, activeUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activeUser) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const updated = await api.updateSkill(id, form);
        navigate(`/skills/${updated._id}`);
      } else {
        const created = await api.createSkill({ ...form, teacher: activeUser._id });
        navigate(`/skills/${created._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this skill listing? This can't be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await api.deleteSkill(id);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading skill..." />
      </div>
    );
  }

  if (notOwner) {
    return (
      <div className="page">
        <div className="state-block">
          <div className="state-icon">🚫</div>
          <h3>You can only edit your own skills</h3>
          <p>Switch to the student who owns this listing to make changes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">{isEdit ? "Edit Skill" : "Add Skill"}</span>
          <h1>{isEdit ? "Update your listing" : "Share a skill"}</h1>
          <p className="subtitle">
            {isEdit
              ? "Keep your listing accurate so learners know what to expect."
              : "Tell other students what you can teach them."}
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <form className="card card-pad" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="form-control"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Python for Beginners"
            maxLength={80}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will learners get out of this? Any prerequisites?"
            maxLength={1000}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-control"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              className="form-control"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              {meta.levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-teach" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Publish skill"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              style={{ marginLeft: "auto" }}
            >
              {deleting ? "Deleting..." : "Delete skill"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
