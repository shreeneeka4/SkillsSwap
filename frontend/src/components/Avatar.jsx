function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ name, color = "#2A9D8F", size = "md" }) {
  return (
    <div className={`avatar ${size === "md" ? "" : size}`} style={{ background: color }}>
      {initials(name)}
    </div>
  );
}
