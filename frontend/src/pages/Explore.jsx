import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import SkillCard from "../components/SkillCard.jsx";
import { Loader, EmptyState, ErrorBanner } from "../components/States.jsx";

export default function Explore() {
  const [skills, setSkills] = useState([]);
  const [meta, setMeta] = useState({ categories: [], levels: [] });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSkillMeta().then(setMeta).catch(() => {});
  }, []);

  const loadSkills = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .getSkills({ search, category, level })
      .then(setSkills)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, category, level]);

  useEffect(() => {
    const timeout = setTimeout(loadSkills, 300); // debounce search typing
    return () => clearTimeout(timeout);
  }, [loadSkills]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Explore</span>
          <h1>Find a skill to learn</h1>
          <p className="subtitle">
            Browse what fellow students are teaching, or search for something specific.
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <input
          className="form-control search-input"
          placeholder="Search skills, e.g. 'guitar' or 'python'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {meta.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="form-control" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="All">All levels</option>
          {meta.levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Loader label="Finding skills..." />
      ) : skills.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No skills match your search"
          message="Try a different keyword or clear your filters."
        />
      ) : (
        <div className="skill-grid">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
