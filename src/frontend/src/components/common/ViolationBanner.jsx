export default function ViolationBanner({ messages = [] }) {
  if (!messages.length) return null;
  return (
    <div
      className="card violation-banner"
      role="alert"
      aria-live="assertive"
    >
      <div className="banner-title">
        <span className="banner-icon" aria-hidden="true">⚠️</span>
        <strong>Please fix the following:</strong>
      </div>
      <ul className="banner-list">
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
