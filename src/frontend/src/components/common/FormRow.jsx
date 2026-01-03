export function FormRow({ label, required, children, full }) {
  return (
    <label
      className={full ? "full" : ""}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <span style={{ fontSize: 13, color: "#334155" }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </span>
      {children}
    </label>
  );
}
