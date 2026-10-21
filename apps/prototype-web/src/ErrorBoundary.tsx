import React, { type ReactNode } from "react";

export class ErrorBoundary extends React.Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="fatal" role="alert">
          <h1 style={{ margin: 0, font: "700 var(--fs-h1)/var(--lh-h1) var(--font)" }}>Une erreur est survenue</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>Le prototype a rencontré un problème. Rechargez la page pour recommencer.</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "var(--text-muted)" }}>{String(this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
