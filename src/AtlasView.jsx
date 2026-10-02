// AtlasView.jsx
// ------------------------------------------------------------
// The Atlas tab. Holds hand-drawn, illustrated diagrams of
// topics - one per topic - with a Play button that walks the
// student through the process in step with the topic note's
// own narration, using the voice engine already built into
// the app (see the LISTEN/podcast system in App.js).
//
// Currently a placeholder. The viewer and the first diagram
// (Haematopoiesis - The Complete Tree) land in the next build
// step. Nothing here is AI-generated and nothing fetches at
// runtime - every visual is a fixed SVG, drawn once and
// saved forever, exactly like the rest of the app's content.
// ------------------------------------------------------------
import React from "react";

export default function AtlasView({ app }) {
  return (
    <div className="view">
      <div className="eyebrow">Atlas</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>
        Illustrated diagrams, topic by topic
      </h1>
      <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "60ch" }}>
        Each topic in the Atlas opens as an illustrated walkthrough - the
        process shown the way the note describes it, drawn out step by step
        so you can watch it unfold at your own pace.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "var(--amber-dim)", color: "var(--amber)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5.5A2 2 0 0 1 5 4h6v16H5a2 2 0 0 0-2 2z" />
              <path d="M21 5.5A2 2 0 0 0 19 4h-6v16h6a2 2 0 0 1 2 2z" />
              <path d="M12 4v16" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>
              Coming soon
            </div>
            <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 2 }}>
              The first illustrated diagram - Haematopoiesis - is being prepared.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}