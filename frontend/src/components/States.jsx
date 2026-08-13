export function Loader({ label = "Loading..." }) {
  return (
    <div className="inline-loading">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function EmptyState({ icon = "📭", title, message }) {
  return (
    <div className="state-block">
      <div className="state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="banner-error">⚠️ {message}</div>;
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return <div className="banner-success">✅ {message}</div>;
}
