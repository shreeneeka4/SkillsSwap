import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar.jsx";

export default function SkillCard({ skill }) {
  const navigate = useNavigate();

  return (
    <div className="skill-card" onClick={() => navigate(`/skills/${skill._id}`)} role="button" tabIndex={0}>
      <div className="skill-card-top">
        <h3>{skill.title}</h3>
        <span className="pill pill-level">{skill.level}</span>
      </div>

      <span className="pill pill-category">{skill.category}</span>

      <p className="skill-desc">{skill.description}</p>

      {skill.teacher && (
        <div className="teacher-row">
          <Avatar name={skill.teacher.name} color={skill.teacher.avatarColor} size="sm" />
          <span className="name">{skill.teacher.name}</span>
        </div>
      )}
    </div>
  );
}
