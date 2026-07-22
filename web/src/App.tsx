const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "#0f172a",
    color: "#e2e8f0",
    margin: 0,
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#38bdf8",
    fontSize: "0.85rem",
  },
  title: { fontSize: "2rem", margin: 0 },
  subtitle: { color: "#94a3b8", margin: 0 },
};

export default function App() {
  return (
    <main style={styles.page}>
      <span style={styles.badge}>Infrastructure opérationnelle ✓</span>
      <h1 style={styles.title}>🛒 E-Shop Télémétrie</h1>
      <p style={styles.subtitle}>
        Le tunnel d&apos;achat sera développé dans la prochaine phase.
      </p>
    </main>
  );
}
