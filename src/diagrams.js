// diagrams.js
// ------------------------------------------------------------
// ATLAS CONTENT REGISTRY
//
// Every illustrated visual in the Atlas tab - diagrams and
// pathway builders alike - is one entry in DIAGRAMS below.
// Nothing here calls the AI at runtime, nothing fetches, there
// are no new npm packages. Everything is plain SVG drawn by
// React, plus CSS transitions, exactly per the Atlas spec.
//
// TO ADD A NEW DIAGRAM: copy an existing "type: diagram" entry,
// change the id/title/topic/labels/narration/render, done. The
// topic card in TopicView and the Atlas course/visuals lists
// pick it up automatically - nothing else to touch.
//
// Builders (type: "builder") are deliberately not used in Atlas
// right now - the drag/tap-to-arrange pathway format is being
// held back for its own dedicated tab later. Atlas's job is
// illustrated, animated diagrams only, each one following its
// topic note's own narration.
//
// Keys are the diagram's own id (not the same as a topic key -
// a topic can only ever have ONE diagram attached via its
// `topic` field, but a diagram can have child diagrams for
// drill-downs that aren't attached to any topic directly).
// ------------------------------------------------------------
import React from "react";

/* One global keyframe for animated blood cells drifting through vessels.
   Attached per cell via inline style so each can have its own delay. */
if (typeof document !== "undefined" && !document.getElementById("atlas-drift-keyframes")) {
  const style = document.createElement("style");
  style.id = "atlas-drift-keyframes";
  style.textContent = `
    @keyframes atlasDrift {
      0%   { transform: translate(0, 0); opacity: 1; }
      50%  { transform: translate(0, -6px); opacity: 0.9; }
      100% { transform: translate(0, 0); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      [style*="atlasDrift"] { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// Small, deliberately limited palette on top of the app's existing
// amber/good/bad tokens - navy, gold(amber), blue, crimson, purple,
// matching the "navy, gold, white, blue" system already locked in for
// the rest of the app. Defined once here so every diagram stays
// visually consistent without anyone having to remember hex codes.
export const ATLAS_COLORS = {
  trunk: "#F5B93F",       // amber/gold - stem/progenitor trunks, and the
                           // general "selected" accent across every diagram
  trunkDim: "rgba(245,185,63,.14)",
  lymphoid: "#2F6FED",    // blue - lymphoid lineage, and deoxygenated blood
  lymphoidDim: "rgba(47,111,237,.14)",
  erythroid: "#C0392B",   // crimson - red cell lineage, and oxygenated blood
  erythroidDim: "rgba(192,57,43,.14)",
  nucleus: "#8B5CF6",     // purple - nuclei / genetic material
  nucleusDim: "rgba(139,92,246,.14)",
  neutral: "#64748B",     // slate - unlabelled connective lines
};

// Course display names for the Atlas course picker. Add a line here
// whenever a diagram is added for a course not yet listed - this is
// intentionally separate from App.js's own COURSES list so AtlasView
// never has to import anything back out of App.js.
//
// The key is the course id from App.js's COURSES object. The value is
// what the student sees on the Atlas course-picker card and in the
// visuals-list back button. Keep these in sync with App.js's own
// display names - if App.js calls it "Pathology", Atlas should too.
export const ATLAS_COURSE_NAMES = {
  hem: "Hematology I",
  ph2: "Physiology II",
  pat: "General Pathology",
};

/* ----------------------------- helpers ----------------------------- */

export function diagramsForCourse(courseId) {
  return Object.values(DIAGRAMS)
    .filter((d) => d.topic && d.topic.courseId === courseId)
    .sort((a, b) => a.topic.topicIndex - b.topic.topicIndex);
}

export function coursesWithDiagrams() {
  const set = new Set();
  Object.values(DIAGRAMS).forEach((d) => { if (d.topic) set.add(d.topic.courseId); });
  return [...set];
}

export function diagramForTopic(courseId, topicIndex) {
  return Object.values(DIAGRAMS).find(
    (d) => d.topic && d.topic.courseId === courseId && d.topic.topicIndex === topicIndex
  ) || null;
}

/* ------------------------------ content ----------------------------- */

// Maps a node's flat hex colour to its matching <linearGradient> id (defined
// once in atlasDefs() below) so active nodes fill with a soft gradient
// instead of a flat colour - this plus the drop-shadow filter is what gives
// the flat SVG a bit of dimensional, "hand-drawn-ish" depth without any new
// dependency (three.js, a 3D model, an image) - still just SVG + CSS.
const GRADIENT_BY_COLOR = {
  [ATLAS_COLORS.trunk]: "atlas-grad-trunk",
  [ATLAS_COLORS.lymphoid]: "atlas-grad-lymphoid",
  [ATLAS_COLORS.erythroid]: "atlas-grad-erythroid",
  [ATLAS_COLORS.nucleus]: "atlas-grad-nucleus",
};

// One shared <defs> block - gradients for every palette colour plus a soft
// drop-shadow filter - included once at the top of every diagram's <svg>.
export const atlasDefs = () => (
  <defs key="atlas-defs">
        <linearGradient id="atlas-grad-trunk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFC93C" />
      <stop offset="100%" stopColor="#D89B14" />
    </linearGradient>
    <linearGradient id="atlas-grad-lymphoid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2D7BFF" />
      <stop offset="100%" stopColor="#123F9E" />
    </linearGradient>
    <linearGradient id="atlas-grad-erythroid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#E53935" />
      <stop offset="100%" stopColor="#8C1C12" />
    </linearGradient>
    <linearGradient id="atlas-grad-nucleus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#A78BFA" />
      <stop offset="100%" stopColor="#5B21B6" />
    </linearGradient>
    <linearGradient id="atlas-pH-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#C0392B" />
      <stop offset="50%" stopColor="#16A34A" />
      <stop offset="100%" stopColor="#2F6FED" />
    </linearGradient>
    <filter id="atlas-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#000" floodOpacity="0.4" />
    </filter>
    <filter id="atlas-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feFlood floodColor="#F5B93F" floodOpacity="0.95" />
      <feComposite in2="blur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const atlasNode = ({ id, x, y, w, h, label, sub, fill, dim, onLabelClick, activeLabelId, pulsing, onOpenDrill }) => {
  const active = activeLabelId === id;
  const gradId = GRADIENT_BY_COLOR[fill];
  const activeFill = gradId ? `url(#${gradId})` : fill;
  return (
    <g
      key={id}
      onClick={() => onLabelClick(id)}
      style={{ cursor: "pointer" }}
      className={pulsing ? "atlas-pulse" : ""}
    >
      <rect
        x={x} y={y} width={w} height={h} rx={10}
        fill={active ? activeFill : dim}
        stroke={fill}
        strokeWidth={active ? 2.4 : 1.4}
        filter="url(#atlas-shadow)"
      />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 6 : 0)} textAnchor="middle" dominantBaseline="middle"
        fontSize="13" fontWeight="700" fill={active ? "#0A0F1A" : "var(--text)"}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" dominantBaseline="middle"
          fontSize="9.5" fill={active ? "#0A0F1A" : "var(--text-2)"}>
          {sub}
        </text>
      )}
      {onOpenDrill && (
        <text x={x + w - 10} y={y + 13} textAnchor="end" fontSize="11" fill={active ? "#0A0F1A" : fill}>
          ⤢
        </text>
      )}
    </g>
  );
};

const atlasLine = (x1, y1, x2, y2, color = ATLAS_COLORS.neutral) => (
  <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.6" opacity="0.55" />
);

// atlasCell: same clickable/pulsing/active-highlight wrapper as atlasNode,
// but drawn as a circle instead of a rounded box - for diagrams that
// should read as actual cells (haematopoiesis) rather than a flowchart.
const atlasCell = ({ id, cx, cy, r, fill, dim, label, sub, onLabelClick, activeLabelId, pulsing, onOpenDrill }) => {
  const active = activeLabelId === id;
  const gradId = GRADIENT_BY_COLOR[fill];
  const activeFill = gradId ? `url(#${gradId})` : fill;
  return (
    <g key={id} onClick={() => onLabelClick(id)} style={{ cursor: "pointer" }} className={pulsing ? "atlas-pulse" : ""}>
      <circle cx={cx} cy={cy} r={r} fill={active ? activeFill : dim} stroke={fill} strokeWidth={active ? 2.6 : 1.6} filter="url(#atlas-shadow)" />
      <text x={cx} y={cy - (sub ? 5 : -2)} textAnchor="middle" dominantBaseline="middle" fontSize="12.5" fontWeight="700" fill={active ? "#0A0F1A" : "var(--text)"}>{label}</text>
      {sub && <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={active ? "#0A0F1A" : "var(--text-2)"}>{sub}</text>}
      {onOpenDrill && <text x={cx + r - 10} y={cy - r + 14} textAnchor="end" fontSize="11" fill={active ? "#0A0F1A" : fill}>⤢</text>}
    </g>
  );
};

const atlasFlow = (d, color = ATLAS_COLORS.neutral) => (
  <path d={d} stroke={color} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
);

// atlasOrgan: for the liver/spleen in the extramedullary step - a soft
// blob shape with a label, same click/pulse/active behaviour as atlasCell.
const atlasOrgan = ({ id, cx, cy, w, h, label, fill, dim, onLabelClick, activeLabelId, pulsing }) => {
  const active = activeLabelId === id;
  return (
    <g key={id} onClick={() => onLabelClick(id)} style={{ cursor: "pointer" }} className={pulsing ? "atlas-pulse" : ""}>
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill={active ? fill : dim} stroke={fill} strokeWidth={active ? 2.6 : 1.6} filter="url(#atlas-shadow)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={active ? "#0A0F1A" : "var(--text)"}>{label}</text>
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Cardiac cycle - a small valve glyph, reused four times. Not an   */
/* atlasCell (this diagram isn't a tree of cells - it's one heart   */
/* whose parts change state), so it gets its own tiny helper.       */
/* ---------------------------------------------------------------- */
const atlasValve = ({ id, x, y, open, flip, color, onLabelClick, activeLabelId, preview }) => {
  const active = activeLabelId === id;
  const spread = open ? 26 : 4;
  return (
    <g
      key={id}
      transform={`translate(${x},${y}) ${flip ? "scale(-1,1)" : ""}`}
      onClick={preview ? undefined : () => onLabelClick(id)}
      style={{ cursor: preview ? "default" : "pointer" }}
    >
      {/* Leaflets - curved cusps instead of straight lines, which is what
         an actual valve leaflet looks like (it billows, it isn't a flat
         flap), filled with a faint wash so they read as tissue with a
         free edge, not wireframe. */}
      <path d={`M${-spread},-10 Q${-spread * 0.4},${open ? -2 : 6} 0,0`}
        fill={color} fillOpacity="0.18" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d={`M${spread},-10 Q${spread * 0.4},${open ? -2 : 6} 0,0`}
        fill={color} fillOpacity="0.18" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {open && (
        <path d="M-6,4 L0,12 L6,4" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      )}
      {active && <circle cx="0" cy="0" r="18" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* SHARED ANATOMICAL PRIMITIVES                                     */
/* ---------------------------------------------------------------- */
/* Reusable, clean-stylized building blocks for every Atlas diagram */
/* in the cardio / respiratory / circulatory family. Each primitive */
/* draws ONE thing well, is parameterised, and is used by every     */
/* diagram that needs it - so a new topic composes rather than      */
/* redraws anatomy. Extract more primitives here as new visual      */
/* families are added (renal, immune, micro, etc.).                 */
/* ---------------------------------------------------------------- */

const atlasBloodCell = ({ cx, cy, r = 6, oxygenated = true, animate = false, delay = "0s", label }) => (
  <g style={animate ? { animation: `atlasDrift 4s ease-in-out infinite`, animationDelay: delay } : undefined}>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.6}
      fill={oxygenated ? "#E53935" : "#2D7BFF"}
      stroke={oxygenated ? "#8C1C12" : "#123F9E"} strokeWidth="0.8" />
    <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.3}
      fill={oxygenated ? "#F5C7C0" : "#B8D0FF"} opacity="0.85" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-2)">{label}</text>}
  </g>
);

const atlasWhiteCell = ({ cx, cy, r = 7, label }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#F3F1FF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.2" />
    {/* Multi-lobed nucleus instead of a plain filled circle - the
       lobed/segmented shape is what actually distinguishes a white cell
       under the microscope and in every textbook diagram, not a solid dot. */}
    <path
      d={`M${cx - r * 0.5},${cy - r * 0.35}
          Q${cx - r * 0.1},${cy - r * 0.6} ${cx + r * 0.3},${cy - r * 0.4}
          Q${cx + r * 0.55},${cy - r * 0.05} ${cx + r * 0.35},${cy + r * 0.3}
          Q${cx + r * 0.05},${cy + r * 0.55} ${cx - r * 0.3},${cy + r * 0.4}
          Q${cx - r * 0.6},${cy + r * 0.1} ${cx - r * 0.5},${cy - r * 0.35} Z`}
      fill={ATLAS_COLORS.nucleus} opacity="0.78" />
    <circle cx={cx - r * 0.1} cy={cy} r={r * 0.15} fill="#F3F1FF" opacity="0.6" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-2)">{label}</text>}
  </g>
);

const atlasPlatelet = ({ cx, cy, r = 4, label }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.6" />
    {/* A couple of faint granules - platelets are granular in real life,
       not a flat solid oval. */}
    <circle cx={cx - r * 0.25} cy={cy} r={r * 0.15} fill="#8B6410" opacity="0.5" />
    <circle cx={cx + r * 0.2} cy={cy - r * 0.1} r={r * 0.12} fill="#8B6410" opacity="0.5" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-2)">{label}</text>}
  </g>
);

// Lymph node, upgraded from two flat ellipses to show real internal
// structure: an outer cortex studded with lymphoid follicles (where B
// cells cluster), an inner medulla, and the afferent/efferent vessel
// stubs where lymph actually enters and leaves - the three things every
// textbook lymph node diagram shows and a plain bean shape never did.
const atlasLymphNode = ({ cx, cy, scale = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}>
    {/* Afferent vessels - multiple, entering the convex side */}
    <line x1="-26" y1="-14" x2="-17" y2="-7" stroke={ATLAS_COLORS.lymphoid} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <line x1="-26" y1="0" x2="-17" y2="0" stroke={ATLAS_COLORS.lymphoid} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <line x1="-26" y1="14" x2="-17" y2="7" stroke={ATLAS_COLORS.lymphoid} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    {/* Efferent vessel - single, leaving at the hilum (concave side) */}
    <line x1="17" y1="0" x2="27" y2="0" stroke={ATLAS_COLORS.lymphoid} strokeWidth="3" strokeLinecap="round" opacity="0.8" />

    {/* Capsule + cortex (outer region) */}
    <ellipse cx="0" cy="0" rx="16" ry="11" fill={ATLAS_COLORS.lymphoid} opacity="0.55" stroke="#123F9E" strokeWidth="1" />
    {/* Medulla (inner region) */}
    <ellipse cx="2" cy="0" rx="8" ry="5" fill="#0A0F1A" opacity="0.22" />

    {/* Lymphoid follicles - small dark dots ringing the cortex, where
       B cells actually cluster and proliferate. This is the detail that
       makes it read as "a filtering organ with structure" rather than
       "a blue bean". */}
    {[[-9, -7], [-11, 0], [-9, 7], [0, -9], [0, 9], [6, -7], [7, 7]].map(([fx, fy], i) => (
      <circle key={i} cx={fx} cy={fy} r="1.6" fill="#0A1F6B" opacity="0.55" />
    ))}
  </g>
);

const atlasFlowArrow = ({ x1, y1, x2, y2, color = ATLAS_COLORS.neutral, dashed = false }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const headLen = 10;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined} />
      <polygon
        points={`0,0 ${-headLen},${-headLen/2} ${-headLen},${headLen/2}`}
        transform={`translate(${x2},${y2}) rotate(${angle})`}
        fill={color} />
    </g>
  );
};

// Anatomical vessel: outer wall, lumen, inner highlight, plus (for wider
// vessels) a visible endothelial boundary line - the thin inner lining
// every histology diagram shows as a distinct layer from the muscular
// wall around it, not just "the edge where the color stops."
// `oxygenated` picks the color; `dashed` (used for lymph vessels) gives a
// broken-line look; `width` scales wall + lumen together.
const atlasVessel = ({
  d,
  oxygenated = true,
  width = 14,
  dashed = false,
}) => {
  const base = oxygenated ? "#E53935" : "#2D7BFF";
  const dark = oxygenated ? "#8C1C12" : "#123F9E";
  const light = oxygenated ? "#F5C7C0" : "#B8D0FF";
  const lumenW = Math.max(2, width - 4);
  return (
    <g>
      {/* Outer wall - the vessel's outer edge, darker for definition */}
      <path
        d={d}
        stroke={dark}
        strokeWidth={width + 2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 6" : undefined}
      />
      {/* Main lumen - the blood-carrying channel */}
      <path
        d={d}
        stroke={base}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 6" : undefined}
      />
      {/* Endothelial lining - a thin, slightly darker line just inside the
         lumen edge, only drawn on vessels wide enough for it to read as a
         layer rather than noise. This is what separates "a filled tube"
         from "a vessel wall you can see has structure." */}
      {width >= 9 && (
        <path
          d={d}
          stroke={dark}
          strokeWidth={Math.max(1, width * 0.08)}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashed ? "10 6" : undefined}
          opacity="0.35"
          transform={`translate(0, ${width * 0.32})`}
        />
      )}
      {/* Inner highlight - offset upward, gives the tube a 3D round read */}
      <path
        d={d}
        stroke={light}
        strokeWidth={Math.max(1.5, lumenW * 0.28)}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 6" : undefined}
                opacity="0.85"
        transform={`translate(0, ${-width * 0.18})`}
      />
    </g>
  );
};

// Anatomical lungs. Trachea descends from the top, splits into left and
// right primary bronchi, each lung shows its two or three lobes with a
// visible fissure, and the alveoli show as small clusters. The right lung
// has three lobes (superior/middle/inferior) and the left has two
// (superior/inferior), with the cardiac notch on the left where the heart
// sits - which is why the left lung reads slightly smaller here.
const atlasLungs = ({ cx, cy, scale = 1, highlight = false }) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#B63B2E";
  const edgeW = highlight ? 2.6 : 1.3;
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} className={highlight ? "atlas-pulse" : undefined}>
      {/* Soft outer glow pass, behind everything, only when active - same
         double-layer treatment as atlasHeart, so "this is what we're
         talking about" reads the same way across every primitive instead
         of each one inventing its own highlight language. */}
      {highlight && (
        <>
          <path d="M-16,-10 Q-38,-16 -52,0 Q-62,18 -58,38 Q-54,58 -36,66 Q-20,70 -12,54 Q-10,32 -12,10 Q-14,-2 -16,-10 Z"
            fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="7" opacity="0.3" />
          <path d="M16,-10 Q38,-16 52,0 Q62,18 58,40 Q52,60 34,66 Q18,68 12,50 Q10,28 12,8 Q14,-2 16,-10 Z"
            fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="7" opacity="0.3" />
        </>
      )}

      {/* Trachea - cartilaginous rings drawn as small horizontal lines */}
      <path d="M-6,-64 L-6,-30 L6,-30 L6,-64 Z" fill="#E8E2FF" stroke="#8B7CC7" strokeWidth="1" />
      {[-60, -54, -48, -42, -36].map((y, i) => (
        <line key={i} x1="-6" y1={y} x2="6" y2={y} stroke="#8B7CC7" strokeWidth="0.7" opacity="0.7" />
      ))}

      {/* Primary bronchi - bifurcation from the trachea into each lung */}
      <path d="M0,-30 Q-10,-22 -18,-12" fill="none" stroke="#8B7CC7" strokeWidth="3" strokeLinecap="round" />
      <path d="M0,-30 Q10,-22 18,-12" fill="none" stroke="#8B7CC7" strokeWidth="3" strokeLinecap="round" />

      {/* Secondary bronchi branching into each lobe */}
      <path d="M-18,-12 Q-30,-4 -40,8" fill="none" stroke="#8B7CC7" strokeWidth="1.6" opacity="0.8" />
      <path d="M-18,-12 Q-26,4 -34,22" fill="none" stroke="#8B7CC7" strokeWidth="1.6" opacity="0.8" />
      <path d="M-18,-12 Q-28,18 -34,38" fill="none" stroke="#8B7CC7" strokeWidth="1.4" opacity="0.7" />
      <path d="M18,-12 Q30,-4 40,8" fill="none" stroke="#8B7CC7" strokeWidth="1.6" opacity="0.8" />
      <path d="M18,-12 Q28,10 36,28" fill="none" stroke="#8B7CC7" strokeWidth="1.6" opacity="0.8" />
      <path d="M18,-12 Q30,22 40,44" fill="none" stroke="#8B7CC7" strokeWidth="1.4" opacity="0.7" />

      {/* Tertiary bronchioles - the finer terminal branches off each
         secondary bronchus, the level that actually leads into alveoli.
         A real lung keeps dividing well past what a secondary bronchus
         diagram shows; a few terminal hairs here is what makes the
         branching read as a real airway tree instead of stopping short. */}
      <path d="M-40,8 Q-45,14 -48,22 M-40,8 Q-42,2 -46,-2" fill="none" stroke="#8B7CC7" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
      <path d="M-34,22 Q-40,28 -44,36 M-34,22 Q-30,28 -32,36" fill="none" stroke="#8B7CC7" strokeWidth="0.7" opacity="0.55" strokeLinecap="round" />
      <path d="M-34,38 Q-38,46 -40,54 M-34,38 Q-28,44 -28,52" fill="none" stroke="#8B7CC7" strokeWidth="0.7" opacity="0.55" strokeLinecap="round" />
      <path d="M40,8 Q45,14 48,22 M40,8 Q42,2 46,-2" fill="none" stroke="#8B7CC7" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
      <path d="M36,28 Q42,34 46,42 M36,28 Q30,34 30,42" fill="none" stroke="#8B7CC7" strokeWidth="0.7" opacity="0.55" strokeLinecap="round" />
      <path d="M40,44 Q44,52 44,60 M40,44 Q34,50 32,58" fill="none" stroke="#8B7CC7" strokeWidth="0.7" opacity="0.55" strokeLinecap="round" />

      {/* LEFT LUNG - two lobes (superior + inferior) with the cardiac notch
          on the inner (right) side where the heart sits */}
      <path d="M-16,-10
               Q-38,-16 -52,0
               Q-62,18 -58,38
               Q-54,58 -36,66
               Q-20,70 -12,54
               Q-10,32 -12,10
               Q-14,-2 -16,-10 Z"
        fill="#F5A8A0" stroke={edge} strokeWidth={edgeW} />

      {/* Oblique fissure on the left lung */}
      <path d="M-56,14 Q-40,20 -20,30" fill="none" stroke="#B63B2E" strokeWidth="0.9" opacity="0.7" />

      {/* RIGHT LUNG - three lobes (superior + middle + inferior) */}
      <path d="M16,-10
               Q38,-16 52,0
               Q62,18 58,40
               Q52,60 34,66
               Q18,68 12,50
               Q10,28 12,8
               Q14,-2 16,-10 Z"
        fill="#F5A8A0" stroke={edge} strokeWidth={edgeW} />

      {/* Horizontal fissure (between superior and middle lobes) */}
      <path d="M18,-2 Q36,2 52,4" fill="none" stroke="#B63B2E" strokeWidth="0.9" opacity="0.7" />
      {/* Oblique fissure (between middle and inferior lobes) */}
      <path d="M56,26 Q40,34 20,44" fill="none" stroke="#B63B2E" strokeWidth="0.9" opacity="0.7" />

      {/* Alveoli - upgraded from flat dots to small grape-like sacs (a
         cluster of 3-4 tiny circles instead of one), which is actually
         what an alveolar sac looks like, at a few representative
         terminal points, plus the original scattered single dots filling
         in the rest of the lung field so it doesn't look sparse. */}
      {[[-44, 36], [-40, 58], [44, 36], [40, 58]].map(([x, y], i) => (
        <g key={`sac${i}`}>
          <circle cx={x - 2.5} cy={y} r="2" fill="#2D7BFF" opacity="0.6" />
          <circle cx={x + 2} cy={y - 2} r="2" fill="#2D7BFF" opacity="0.6" />
          <circle cx={x + 1.5} cy={y + 2.5} r="2" fill="#2D7BFF" opacity="0.6" />
          <circle cx={x} cy={y} r="1.6" fill="#1B4FC4" opacity="0.7" />
        </g>
      ))}
      {[
        [-30, 50], [-24, 64], [-50, 24],
        [30, 50], [24, 62], [50, 24],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#2D7BFF" opacity="0.6" />
      ))}

      {/* Lobe labels - bumped from 6.5px, which is unreadable at a glance,
         up to 8.5px. */}
      <text x="-38" y="6" textAnchor="middle" fontSize="8.5" fill="#5A1810" fontWeight="700">SUP</text>
      <text x="-34" y="52" textAnchor="middle" fontSize="8.5" fill="#5A1810" fontWeight="700">INF</text>
      <text x="36" y="0" textAnchor="middle" fontSize="8.5" fill="#5A1810" fontWeight="700">SUP</text>
      <text x="38" y="20" textAnchor="middle" fontSize="8.5" fill="#5A1810" fontWeight="700">MID</text>
      <text x="36" y="50" textAnchor="middle" fontSize="8.5" fill="#5A1810" fontWeight="700">INF</text>
    </g>
  );
};

// Anatomical four-chamber heart. Right side (blue) = deoxygenated, left side
// (crimson) = oxygenated, matching the app's color convention. The great
// vessels (aorta, pulmonary trunk, superior and inferior vena cava,
// pulmonary veins) emerge from the top so the diagram shows blood actually
// entering and leaving the heart, not just the chambers in isolation.
const atlasHeart = ({ cx, cy, scale = 1, highlight = false, onDrill }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}
    style={onDrill ? { cursor: "pointer" } : undefined}>

    {/* Pericardial sac outline - the soft exterior envelope */}
    <path
      d="M-64,-8
         Q-72,-42 -46,-58
         Q-16,-72 0,-42
         Q16,-72 46,-58
         Q72,-42 64,-8
         Q60,26 22,58
         Q0,76 -22,58
         Q-60,26 -64,-8 Z"
      fill="#FBE9E7" opacity="0.55"
      stroke="#C0392B" strokeWidth="1.4" />

    {/* Superior vena cava - enters top-right (from body) */}
    <path d="M22,-62 Q20,-80 26,-92 L14,-92 Q10,-78 12,-62 Z"
      fill="url(#atlas-grad-lymphoid)" stroke="#123F9E" strokeWidth="1" />

    {/* Inferior vena cava - enters bottom-right */}
    <path d="M20,66 Q24,80 22,90 L10,90 Q12,78 10,66 Z"
      fill="url(#atlas-grad-lymphoid)" stroke="#123F9E" strokeWidth="1" />

    {/* Aorta - emerges from top-left */}
    <path d="M-12,-62 Q-18,-82 -30,-92 L-42,-86 Q-28,-74 -24,-58 Z"
      fill="url(#atlas-grad-erythroid)" stroke="#8C1C12" strokeWidth="1" />

    {/* Pulmonary trunk - emerges from top-center-right */}
    <path d="M8,-64 Q6,-84 -2,-92 L-12,-88 Q-4,-74 0,-60 Z"
      fill="url(#atlas-grad-lymphoid)" stroke="#123F9E" strokeWidth="1" />

    {/* Pulmonary veins - enter from top-left (from lungs) */}
    <path d="M-46,-40 Q-62,-48 -70,-58 L-66,-68 Q-56,-58 -42,-52 Z"
      fill="url(#atlas-grad-erythroid)" stroke="#8C1C12" strokeWidth="1" />

    {/* RIGHT ATRIUM - upper right chamber (blue) */}
    <path d="M-6,-46 Q-4,-58 10,-56 Q30,-52 40,-40 Q44,-22 34,-12 L0,-10 Q-10,-28 -6,-46 Z"
      fill="url(#atlas-grad-lymphoid)" stroke="#123F9E" strokeWidth="1.2" />

    {/* LEFT ATRIUM - upper left chamber (crimson) */}
    <path d="M-42,-40 Q-52,-52 -34,-56 Q-16,-60 -6,-46 Q-2,-28 -12,-10 L-38,-14 Q-48,-24 -42,-40 Z"
      fill="url(#atlas-grad-erythroid)" stroke="#8C1C12" strokeWidth="1.2" />

    {/* RIGHT VENTRICLE - lower right chamber (blue). Thinner wall. */}
    <path d="M-6,-6 Q-8,30 6,58 Q20,66 34,54 Q48,38 48,10 Q44,-6 32,-10 Z"
      fill="url(#atlas-grad-lymphoid)" stroke="#123F9E" strokeWidth="1.2" />

    {/* LEFT VENTRICLE - lower left chamber (crimson). Thicker wall. */}
    <path d="M-8,-6 Q-14,34 -30,58 Q-44,64 -54,48 Q-64,24 -56,-4 Q-48,-16 -32,-12 Z"
      fill="url(#atlas-grad-erythroid)" stroke="#8C1C12" strokeWidth="1.2" />

        {/* Septum - the muscular wall between left and right */}
    <path d="M-4,-42 Q-2,4 8,48 L4,54 Q-8,10 -10,-40 Z"
      fill="#2B1A14" opacity="0.28" />

    {/* AV valve leaflets - the actual flaps at the atrio-ventricular junction,
       not just an implied line between chamber shapes. Drawn closed/at-rest;
       this primitive doesn't animate open/close (that's what the dedicated
       cardiac-cycle drill-down is for) - these exist so the junction reads
       as a real valve, not just where two colors happen to touch. */}
    <path d="M-2,-12 Q6,-6 14,-10 M-2,-12 Q-8,-4 -18,-9"
      fill="none" stroke="#5A2E24" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M-16,-12 Q-10,-5 -2,-10 M-16,-12 Q-24,-4 -34,-10"
      fill="none" stroke="#5A2E24" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />

    {/* Papillary muscles + chordae tendineae - the cone-shaped muscle
       stubs inside each ventricle wall, with thin tendon lines running up
       to the valve leaflets above them. This is the detail a textbook
       diagram always shows and a simplified one never bothers with. */}
    <path d="M20,30 Q26,24 24,16 Q22,22 16,26 Z" fill="#8C1C12" opacity="0.5" />
    <path d="M24,16 L14,-9 M24,16 L-2,-10" fill="none" stroke="#5A2E24" strokeWidth="0.9" opacity="0.7" />
    <path d="M-28,32 Q-22,24 -24,14 Q-27,21 -34,26 Z" fill="#6B130C" opacity="0.5" />
    <path d="M-24,14 L-18,-9 M-24,14 L-2,-10" fill="none" stroke="#5A2E24" strokeWidth="0.9" opacity="0.7" />

    {/* Trabeculae carneae - the fine muscular ridging on the inside of each
       ventricle wall. A few short strokes read as texture without turning
       into visual noise at this scale. */}
    <path d="M30,20 Q34,28 30,38 M36,6 Q40,16 36,26" fill="none" stroke="#8C1C12" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
    <path d="M-38,22 Q-44,30 -40,40 M-46,8 Q-52,18 -46,28" fill="none" stroke="#6B130C" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />

    {/* Coronary vessels - a couple of small visible branches on the surface */}
    <path d="M-6,-38 Q-20,-24 -34,6 Q-44,26 -50,40"
      fill="none" stroke="#8C1C12" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
    <path d="M2,30 Q14,44 26,52"
      fill="none" stroke="#8C1C12" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />

    {/* Chamber labels - placed inside each chamber, white for contrast.
       Bumped up from 9px/7px - too small to read comfortably while
       actually studying, especially on a phone. */}
        <text x="18" y="-26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">RA</text>
    <text x="-26" y="-26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">LA</text>
    <text x="20" y="26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">RV</text>
    <text x="-32" y="26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">LV</text>
    {/* Vessel labels - small, near the emerging vessels */}
    <text x="30" y="-80" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text-2)">SVC</text>
    <text x="-38" y="-80" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text-2)">Aorta</text>
    <text x="-4" y="-80" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text-2)">PA</text>

    {/* Active ring - previously a single flat outline, which is easy to miss
       against a busy illustration. Now a double ring (outer soft glow-width
       stroke + inner crisp stroke) plus the existing atlas-pulse animation
       class, so "this is what we're talking about right now" is obvious at
       a glance instead of a thin line you have to look for. */}
    {highlight && (
      <g className="atlas-pulse">
        <path
          d="M-64,-8
             Q-72,-42 -46,-58
             Q-16,-72 0,-42
             Q16,-72 46,-58
             Q72,-42 64,-8
             Q60,26 22,58
             Q0,76 -22,58
             Q-60,26 -64,-8 Z"
          fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="7"
          strokeLinejoin="round" opacity="0.35" />
        <path
          d="M-64,-8
             Q-72,-42 -46,-58
             Q-16,-72 0,-42
             Q16,-72 46,-58
             Q72,-42 64,-8
             Q60,26 22,58
             Q0,76 -22,58
             Q-60,26 -64,-8 Z"
          fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="3"
          strokeLinejoin="round" />
      </g>
    )}
    {/* Drill indicator */}
    {onDrill && <text x="58" y="-46" textAnchor="middle" fontSize="13" fill={ATLAS_COLORS.trunk}>⤢</text>}
  </g>
);
const atlasConductionPath = ({ cx, cy, scale = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}>
    <circle cx="-36" cy="-32" r="6" fill={ATLAS_COLORS.trunk} opacity="0.95">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="-4" cy="-8" r="5" fill={ATLAS_COLORS.trunk} opacity="0.95">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
    </circle>
    <line x1="-4" y1="-4" x2="-4" y2="20" stroke={ATLAS_COLORS.trunk} strokeWidth="2.5" strokeDasharray="3 3" />
    <path d="M-4,20 Q-18,32 -30,40" stroke={ATLAS_COLORS.trunk} strokeWidth="2.5" fill="none" />
    <path d="M-4,20 Q14,32 30,40" stroke={ATLAS_COLORS.trunk} strokeWidth="2.5" fill="none" />
    <path d="M-30,40 Q-40,52 -46,52" stroke={ATLAS_COLORS.trunk} strokeWidth="2" fill="none" opacity="0.75" />
    <path d="M30,40 Q40,52 46,52" stroke={ATLAS_COLORS.trunk} strokeWidth="2" fill="none" opacity="0.75" />
    {/* Purkinje fiber terminal twigs - the conduction path previously
       stopped at two simple curves, which reads as "wires" rather than
       the fine fanning network that actually spreads through the
       ventricular walls. A few short terminal branches at each end fixes
       that without turning it into visual noise. */}
    <path d="M-46,52 Q-52,56 -56,58 M-46,52 Q-50,58 -52,64" stroke={ATLAS_COLORS.trunk} strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round" />
    <path d="M46,52 Q52,56 56,58 M46,52 Q50,58 52,64" stroke={ATLAS_COLORS.trunk} strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round" />

    {/* Labels - SA/AV node identity was previously only implied by
       position, with nothing printed on the diagram itself. A student
       glancing at two pulsing dots with no text has to already know
       which is which; that defeats the point. */}
     <text x="-36" y="-44" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--text-2)">SA node</text>
    <text x="-4" y="-18" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--text-2)">AV node</text>
  </g>
);

/* ---------------------------------------------------------------- */
/* Alveolus — a thin-walled air sac wrapped by a pulmonary          */
/* capillary, drawn so the respiratory membrane (the surface where  */
/* gas exchange actually happens) is visually the thinnest part of  */
/* the whole structure. A cluster of three alveoli plus a capillary */
/* threading between them, with red cells on the blood side and a   */
/* faint O2/CO2 cross-membrane arrow hint in the active state.      */
/* Used by any respiratory diagram that needs to show gas exchange  */
/* at the alveolar level.                                            */
/* ---------------------------------------------------------------- */
const atlasAlveolus = ({
  cx, cy, scale = 1,
  oxygenated = false,
  highlight = false,
}) => {
  // A cluster of three overlapping sacs, sized so the "wall" between
  // any two adjacent sacs is visibly thin — that thinness is the point.
  const edge = highlight ? ATLAS_COLORS.trunk : "#B0A8D8";
  const edgeW = highlight ? 2.2 : 1.2;
  const sacFill = "#F2EEFF";
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} className={highlight ? "atlas-pulse" : undefined}>
      {/* Three alveolar sacs, drawn back-to-front so the overlap reads
         as a cluster, not three disconnected circles. */}
      <circle cx="-18" cy="4"  r="22" fill={sacFill} stroke={edge} strokeWidth={edgeW} />
      <circle cx="20"  cy="2"  r="22" fill={sacFill} stroke={edge} strokeWidth={edgeW} />
      <circle cx="1"   cy="-18" r="22" fill={sacFill} stroke={edge} strokeWidth={edgeW} />

      {/* Thin respiratory membrane — a faint double-stroke along the
         wall of the front sac, so the student can see the "barrier"
         the gases have to cross is genuinely thin. */}
      <path
        d="M-6,14 Q0,18 6,14"
        fill="none"
        stroke={edge}
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* Pulmonary capillary threading past the cluster. Oxygenated
         (red) on the way back to the heart, deoxygenated (blue) on
         the way out from the heart — the caller chooses via
         `oxygenated`. */}
      <path
        d="M-56,26 Q-20,30 8,26 Q30,22 56,26"
        fill="none"
        stroke={oxygenated ? "#8C1C12" : "#123F9E"}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M-56,26 Q-20,30 8,26 Q30,22 56,26"
        fill="none"
        stroke={oxygenated ? "#E53935" : "#2D7BFF"}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* A couple of red cells in the capillary, at rest position (the
         parent diagram can add drifting ones if it wants). */}
      <ellipse cx="-32" cy="26" rx="5" ry="3" fill={oxygenated ? "#E53935" : "#2D7BFF"} stroke={oxygenated ? "#8C1C12" : "#123F9E"} strokeWidth="0.6" />
      <ellipse cx="30"  cy="26" rx="5" ry="3" fill={oxygenated ? "#E53935" : "#2D7BFF"} stroke={oxygenated ? "#8C1C12" : "#123F9E"} strokeWidth="0.6" />

      {/* Gas-exchange hint — two small arrows crossing the membrane when
         the sac is highlighted: O2 in, CO2 out. Only shown while
         highlighted so the resting diagram isn't busy. */}
      {highlight && (
        <g>
          <path d="M-4,2 L-4,-8 M-4,-8 l-3,3 M-4,-8 l3,3" stroke="#2F6FED" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6,-2 L6,8 M6,8 l-3,-3 M6,8 l3,-3" stroke="#C0392B" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="-14" y="-10" fontSize="8" fontWeight="700" fill="#2F6FED" textAnchor="middle">O₂</text>
          <text x="16"  y="14"  fontSize="8" fontWeight="700" fill="#C0392B" textAnchor="middle">CO₂</text>
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Antibody — the Y-shaped protein produced by B cells. Two arms   */
/* with identical binding sites at the tips, one stem the immune   */
/* system uses to tag threats for destruction. Drawn with a visible */
/* hinge so the arms can flex apart, and optional antigen binding   */
/* when highlighted — the antigen is the small shape the tips       */
/* recognise. Used by any immune-system diagram that needs to show  */
/* humoral immunity.                                                 */
/* ---------------------------------------------------------------- */
const atlasAntibody = ({
  cx, cy, scale = 1,
  bound = false,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#5B21B6";
  const edgeW = highlight ? 2 : 1.4;
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} className={highlight ? "atlas-pulse" : undefined}>
      {/* Y-shaped antibody body — two arms meeting at a hinge, with a
         single stem coming down from the hinge. */}
      <path
        d="M0,0 L0,22 M0,0 L-22,-22 M0,0 L22,-22"
        stroke={edge}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lighter inner fill on the arms, so the shape reads as a protein
         with a bound structure, not just three lines. */}
      <path
        d="M0,0 L0,22 M0,0 L-22,-22 M0,0 L22,-22"
        stroke="url(#atlas-grad-nucleus)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      {/* Binding sites — the tips of the two arms. Drawn as small notches
         to suggest the "lock" side of the lock-and-key recognition. */}
      <circle cx="-22" cy="-22" r="3" fill={edge} />
      <circle cx="22"  cy="-22" r="3" fill={edge} />

      {/* Antigen — a small triangular shape that fits into the arm tips.
         Only shown when `bound` is true, so the resting antibody is
         drawn on its own. */}
      {bound && (
        <>
          <polygon points="-26,-26 -18,-26 -22,-34" fill="#C0392B" stroke="#8C1C12" strokeWidth="1" />
          <polygon points="18,-26 26,-26 22,-34" fill="#C0392B" stroke="#8C1C12" strokeWidth="1" />
          <text x="-22" y="-42" textAnchor="middle" fontSize="8" fontWeight="700" fill="#C0392B">antigen</text>
        </>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Acute inflammation scene — a small patch of tissue with a       */
/* capillary running through it, drawn so that each stage of the   */
/* inflammatory response can be shown by toggling one of the       */
/* boolean props. The four cardinal signs (redness, heat, swelling, */
/* pain) map to specific visual features: vasodilation widens the  */
/* vessel, increased permeability shows plasma leaking out, cell   */
/* recruitment shows white cells rolling and squeezing through,    */
/* and phagocytosis shows a white cell engulfing a bacterium.      */
/* Used by every pathology diagram in the inflammation family.     */
/* ---------------------------------------------------------------- */
const atlasInflammationScene = ({
  cx, cy, width = 260, height = 200,
  vasodilation = false,
  permeability = false,
  recruitment = false,
  phagocytosis = false,
  resolution = false,
  chronic = false,
  highlight = false,
}) => {
  const x0 = cx - width / 2;
  const y0 = cy - height / 2;
  const vesselY = cy + height * 0.05;
  const vesselW = vasodilation ? 22 : 12;
  const edge = highlight ? ATLAS_COLORS.trunk : "#B63B2E";
  const edgeW = highlight ? 2.2 : 1.4;

  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Tissue background — a soft warm patch, no hard edges, so the
         scene reads as a slice of the body rather than a rectangle. */}
      <ellipse cx={cx} cy={cy} rx={width * 0.55} ry={height * 0.55} fill="#FBE9E7" opacity="0.35" />
      <ellipse cx={cx} cy={cy} rx={width * 0.5}  ry={height * 0.5}  fill="none" stroke={edge} strokeWidth={edgeW} strokeDasharray="6 6" opacity="0.4" />

      {/* Capillary running through the tissue */}
      <path
        d={`M${x0 + 10},${vesselY} Q${cx},${vesselY - 8} ${x0 + width - 10},${vesselY}`}
        fill="none"
        stroke="#8C1C12"
        strokeWidth={vesselW + 3}
        strokeLinecap="round"
      />
      <path
        d={`M${x0 + 10},${vesselY} Q${cx},${vesselY - 8} ${x0 + width - 10},${vesselY}`}
        fill="none"
        stroke="#E53935"
        strokeWidth={vesselW}
        strokeLinecap="round"
      />
      <path
        d={`M${x0 + 10},${vesselY - 2} Q${cx},${vesselY - 10} ${x0 + width - 10},${vesselY - 2}`}
        fill="none"
        stroke="#F5C7C0"
        strokeWidth={Math.max(1.4, vesselW * 0.3)}
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Red cells inside the capillary, so it reads as a blood vessel */}
      {[[x0 + 40, vesselY], [cx - 30, vesselY - 3], [cx + 30, vesselY - 3], [x0 + width - 40, vesselY]].map(([rx, ry], i) => (
        <ellipse key={i} cx={rx} cy={ry} rx="5" ry="3" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
      ))}

      {/* Vasodilation indicator — small outward arrows at the vessel
         edges showing the wall is widening. */}
      {vasodilation && (
        <g opacity="0.85">
          <path d={`M${x0 + 20},${vesselY - 20} L${x0 + 20},${vesselY - 8}`} stroke="#C0392B" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M${x0 + 20},${vesselY - 20} l-3,4 M${x0 + 20},${vesselY - 20} l3,4`} stroke="#C0392B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d={`M${x0 + width - 20},${vesselY + 22} L${x0 + width - 20},${vesselY + 10}`} stroke="#C0392B" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M${x0 + width - 20},${vesselY + 22} l-3,-4 M${x0 + width - 20},${vesselY + 22} l3,-4`} stroke="#C0392B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Permeability — plasma leaking out of the vessel into the
         tissue. Yellow droplets, matching the interstitial fluid
         droplets used elsewhere in the atlas. */}
      {permeability && (
        <g opacity="0.9">
          {[[cx - 30, vesselY + 22], [cx, vesselY + 30], [cx + 30, vesselY + 26], [cx - 12, vesselY + 40], [cx + 18, vesselY + 44]].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="3.5" fill="#FFE38A" stroke="#D89B14" strokeWidth="0.5" />
          ))}
        </g>
      )}

      {/* Recruitment — white cells rolling along the vessel wall, and
         one squeezing through the wall into the tissue. */}
      {recruitment && (
        <g>
          {atlasWhiteCell({ cx: x0 + 60, cy: vesselY - 2, r: 9 })}
          {atlasWhiteCell({ cx: cx + 40, cy: vesselY - 2, r: 9 })}
          {/* The cell mid-squeeze, half in and half out of the vessel */}
          <g opacity="0.95">
            <circle cx={cx + 5} cy={vesselY + 14} r="8" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
            <path
              d={`M${cx},${vesselY + 10} Q${cx + 5},${vesselY + 6} ${cx + 10},${vesselY + 12} Q${cx + 8},${vesselY + 20} ${cx + 2},${vesselY + 22} Q${cx - 3},${vesselY + 18} ${cx},${vesselY + 10} Z`}
              fill="#8B5CF6" opacity="0.78"
            />
          </g>
          <path d={`M${cx + 5},${vesselY + 6} L${cx + 5},${vesselY + 22}`} stroke="#5B21B6" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
        </g>
      )}

      {/* Phagocytosis — a white cell extending pseudopods around a
         bacterium, with a second bacterium already internalised. */}
      {phagocytosis && (
        <g>
          <g>
            {/* Macrophage body */}
            <circle cx={cx - 40} cy={cy - 30} r="18" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.4" />
            {/* Lobed nucleus */}
            <path
              d={`M${cx - 48},${cy - 34} Q${cx - 42},${cy - 38} ${cx - 38},${cy - 32} Q${cx - 34},${cy - 26} ${cx - 40},${cy - 24} Q${cx - 46},${cy - 26} ${cx - 48},${cy - 34} Z`}
              fill="#8B5CF6" opacity="0.78"
            />
            {/* Pseudomonas around a bacterium */}
            <path
              d={`M${cx - 22},${cy - 30} Q${cx - 16},${cy - 38} ${cx - 10},${cy - 30} Q${cx - 16},${cy - 22} ${cx - 22},${cy - 30} Z`}
              fill="none" stroke="#8B5CF6" strokeWidth="1.6"
            />
            {/* The bacterium being engulfed */}
            <ellipse cx={cx - 14} cy={cy - 30} rx="5" ry="3" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
            {/* An internalised one already inside */}
            <ellipse cx={cx - 42} cy={cy - 26} rx="4" ry="2.5" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" opacity="0.7" />
          </g>
          <text x={cx - 40} y={cy - 4} textAnchor="middle" fontSize="8" fill="var(--text-2)">phagocytosis</text>
        </g>
      )}

      {/* Resolution — a green-ish overlay suggesting the tissue is
         returning to normal, with a faint "resolved" caption. */}
      {resolution && (
        <g>
          <rect
            x={x0 + 6} y={y0 + 6} width={width - 12} height={height - 12}
            rx="14" fill="none"
            stroke="#16A34A" strokeWidth="2" strokeDasharray="6 4"
            opacity="0.75"
          />
          <text x={cx} y={y0 + height - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#16A34A">tissue repaired</text>
        </g>
      )}

      {/* Chronic mode — swap the fast neutrophil swarms for a denser,
         mixed infiltrate of macrophages and lymphocytes, and add a
         thickened fibrotic rim around the inflamed tissue. That rim
         is what "chronic" looks like: the body walls off something it
         can't clear, and the wall itself becomes part of the problem. */}
      {chronic && (
        <g>
          {/* Fibrotic rim — a wavy band around the tissue edge */}
          <path
            d={`M${cx - width * 0.42},${cy - height * 0.38}
                Q${cx},${cy - height * 0.55} ${cx + width * 0.42},${cy - height * 0.38}`}
            fill="none" stroke="#8B5CF6" strokeWidth="4" opacity="0.55" strokeLinecap="round"
          />
          <path
            d={`M${cx - width * 0.42},${cy + height * 0.38}
                Q${cx},${cy + height * 0.55} ${cx + width * 0.42},${cy + height * 0.38}`}
            fill="none" stroke="#8B5CF6" strokeWidth="4" opacity="0.55" strokeLinecap="round"
          />
          {/* Dense mixed infiltrate — macrophages and lymphocytes
             scattered through the tissue. Macrophages = purple nucleus
             with a kidney shape; lymphocytes = small round dark dot. */}
          {[
            [x0 + 50, y0 + 50], [x0 + 90, y0 + 80], [x0 + 60, y0 + 130],
            [x0 + 140, y0 + 55], [x0 + 180, y0 + 95], [x0 + 160, y0 + 145],
            [x0 + 220, y0 + 60], [x0 + 250, y0 + 110], [x0 + 230, y0 + 155],
            [x0 + 110, y0 + 165],
          ].map(([mx, my], i) => i % 2 === 0 ? (
            <g key={`m${i}`}>
              <circle cx={mx} cy={my} r="7" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
              <path
                d={`M${mx - 3},${my - 2} Q${mx},${my - 4} ${mx + 3},${my - 2} Q${mx + 4},${my + 2} ${mx + 1},${my + 3} Q${mx - 3},${my + 3} ${mx - 3},${my - 2} Z`}
                fill="#8B5CF6" opacity="0.78"
              />
            </g>
          ) : (
            <circle key={`l${i}`} cx={mx} cy={my} r="5" fill="#5B21B6" opacity="0.85" />
          ))}
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Wound healing scene — a slice of tissue with a wound in the      */
/* middle, drawn so that each phase of healing can be shown by      */
/* toggling one of the boolean props. The four phases are the       */
/* standard healing arc: hemostasis (clot forms), inflammation     */
/* (cleanup by neutrophils/macrophages), proliferation (new tissue  */
/* grows in from the edges), and remodelling (collagen reorganises  */
/* and the scar matures). Used by any pathology diagram that        */
/* needs to show the healing process, and reused by pat:7 (Wound    */
/* Healing) and any later topic that follows on from inflammation.  */
/* ---------------------------------------------------------------- */
const atlasWoundScene = ({
  cx, cy, width = 260, height = 200,
  hemostasis = false,
  inflammation = false,
  proliferation = false,
  remodelling = false,
  highlight = false,
}) => {
  const x0 = cx - width / 2;
  const y0 = cy - height / 2;
  const woundW = 90;
  const woundH = 50;
  const edge = highlight ? ATLAS_COLORS.trunk : "#B63B2E";
  const edgeW = highlight ? 2.2 : 1.4;

  // The wound gap is the central rectangle. Its visual state changes
  // through the four phases:
  //  - hemostasis:    the gap is filled with a dark red clot
  //  - inflammation:  neutrophils (white cells) swarm around it
  //  - proliferation: fresh granulation tissue fills from the edges
  //  - remodelling:   the wound shrinks and a pale scar forms
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Healthy tissue around the wound — a warm pink patch, no hard
         edges, so it reads as living tissue rather than a rectangle. */}
      <ellipse cx={cx} cy={cy} rx={width * 0.55} ry={height * 0.55} fill="#FBE9E7" opacity="0.4" />
      <ellipse cx={cx} cy={cy} rx={width * 0.5} ry={height * 0.5} fill="none" stroke={edge} strokeWidth={edgeW} strokeDasharray="6 6" opacity="0.4" />

      {/* The wound itself — a rectangle gap in the tissue. Its size
         shrinks as the phases progress (remodelling is smaller than
         the initial gap), so the shape alone shows healing. */}
      {(() => {
        const gw = remodelling ? woundW * 0.45 : woundW;
        const gh = remodelling ? woundH * 0.4 : woundH;
        const gx = cx - gw / 2;
        const gy = cy - gh / 2;
        return (
          <>
            {/* Open wound interior — dark red */
}
            <rect
              x={gx} y={gy} width={gw} height={gh} rx="6"
              fill={proliferation ? "#F5C7C0" : remodelling ? "#FBE9E7" : "#8C1C12"}
              stroke={remodelling ? "#B63B2E" : "#5A1810"}
              strokeWidth="1.6"
            />

            {/* Hemostasis — a dark red clot filling the wound, with
               fibrin threads crossing it and platelets at the edges. */}
            {hemostasis && (
              <g>
                <rect
                  x={gx + 4} y={gy + 4} width={gw - 8} height={gh - 8} rx="4"
                  fill="#5A1810" opacity="0.85"
                />
                {[[gx + 12, gy + gh * 0.3], [gx + 20, gy + gh * 0.7], [gx + gw - 14, gy + gh * 0.4], [gx + gw - 22, gy + gh * 0.7]].map(([px, py], i) => (
                  <ellipse key={i} cx={px} cy={py} rx="4" ry="2.5" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.6" />
                ))}
                <path
                  d={`M${gx + 8},${gy + gh * 0.5} L${gx + gw - 8},${gy + gh * 0.4}
                      M${gx + 12},${gy + gh * 0.3} L${gx + gw - 16},${gy + gh * 0.7}
                      M${gx + 16},${gy + gh * 0.75} L${gx + gw - 12},${gy + gh * 0.3}`}
                  stroke={ATLAS_COLORS.trunk} strokeWidth="0.9" opacity="0.7" fill="none"
                />
              </g>
            )}

            {/* Inflammation — neutrophils and macrophages swarming in
               from the tissue around the wound, phagocytosing debris. */}
            {inflammation && (
              <g>
                {[
                  [gx - 12, gy + gh * 0.3],
                  [gx - 14, gy + gh * 0.7],
                  [gx + gw + 12, gy + gh * 0.35],
                  [gx + gw + 14, gy + gh * 0.7],
                  [gx + gw * 0.3, gy - 12],
                  [gx + gw * 0.7, gy - 12],
                ].map(([px, py], i) => (
                  <g key={i}>
                    <circle cx={px} cy={py} r="8" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
                    <path
                      d={`M${px - 4},${py - 3} Q${px - 1},${py - 5} ${px + 2},${py - 3} Q${px + 5},${py - 1} ${px + 3},${py + 2} Q${px},${py + 4} ${px - 3},${py + 2} Q${px - 5},${py - 1} ${px - 4},${py - 3} Z`}
                      fill="#8B5CF6" opacity="0.78"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Proliferation — pink granulation tissue filling in from
               the wound edges, with new capillary loops budding into it.
               Dotted arrows at the edges show the tissue growing inward. */}
            {proliferation && (
              <g>
                {/* Granulation tissue growing from each edge */}
                <path
                  d={`M${gx},${gy + 4} Q${gx + gw * 0.3},${gy + gh * 0.5} ${gx},${gy + gh - 4} Z`}
                  fill="#F5A8A0" opacity="0.75"
                />
                <path
                  d={`M${gx + gw},${gy + 4} Q${gx + gw * 0.7},${gy + gh * 0.5} ${gx + gw},${gy + gh - 4} Z`}
                  fill="#F5A8A0" opacity="0.75"
                />
                {/* New capillary loops budding in — small red arcs */}
                {[
                  [gx + gw * 0.25, gy + gh * 0.5],
                  [gx + gw * 0.5, gy + gh * 0.5],
                  [gx + gw * 0.75, gy + gh * 0.5],
                ].map(([px, py], i) => (
                  <path
                    key={i}
                    d={`M${px - 6},${py + 4} Q${px},${py - 6} ${px + 6},${py + 4}`}
                    fill="none" stroke="#E53935" strokeWidth="1.4" strokeLinecap="round"
                  />
                ))}
              </g>
            )}

            {/* Remodelling — the wound is now a smaller pale scar, with
               collagen threads (fine pale lines) reorganising inside it. */}
            {remodelling && (
              <g>
                <rect
                  x={gx + 2} y={gy + 2} width={gw - 4} height={gh - 4} rx="4"
                  fill="#F5E8E0" stroke="#D8C8BE" strokeWidth="1"
                />
                {/* Collagen threads — thin wavy pale lines running mostly
                   parallel to the wound surface, as a real scar does. */}
                <path
                  d={`M${gx + 4},${gy + gh * 0.35} Q${gx + gw * 0.5},${gy + gh * 0.3} ${gx + gw - 4},${gy + gh * 0.35}
                      M${gx + 4},${gy + gh * 0.55} Q${gx + gw * 0.5},${gy + gh * 0.5} ${gx + gw - 4},${gy + gh * 0.55}
                      M${gx + 4},${gy + gh * 0.75} Q${gx + gw * 0.5},${gy + gh * 0.7} ${gx + gw - 4},${gy + gh * 0.75}`}
                  fill="none" stroke="#B8A89E" strokeWidth="1.1" opacity="0.85" strokeLinecap="round"
                />
              </g>
            )}
          </>
        );
      })()}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Antigen-presenting cell — a dendritic cell or macrophage that    */
/* has engulfed a threat, chopped it up, and is displaying a        */
/* fragment of it on its surface inside an MHC molecule. This is    */
/* the bridge between innate and adaptive immunity — the moment     */
/* the innate response hands a threat over to T cells. Drawn with   */
/* the MHC molecule as a Y-shaped surface receptor holding a small  */
/* red antigen fragment, plus antigen fragments visible on the      */
/* cell membrane itself. Used by any immune / pathology diagram     */
/* that needs to show antigen presentation.                          */
/* ---------------------------------------------------------------- */
const atlasAPC = ({
  cx, cy, r = 26,
  presenting = true,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#8B5CF6";
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Cell body with the same lobed-nucleus treatment as atlasWhiteCell,
         so the APC reads as a member of the same visual family. */}
      <circle cx={cx} cy={cy} r={r} fill="#F3F1FF" stroke={edge} strokeWidth={highlight ? 2.4 : 1.6} />
      <path
        d={`M${cx - r * 0.5},${cy - r * 0.35}
            Q${cx - r * 0.1},${cy - r * 0.6} ${cx + r * 0.3},${cy - r * 0.4}
            Q${cx + r * 0.55},${cy - r * 0.05} ${cx + r * 0.35},${cy + r * 0.3}
            Q${cx + r * 0.05},${cy + r * 0.55} ${cx - r * 0.3},${cy + r * 0.4}
            Q${cx - r * 0.6},${cy + r * 0.1} ${cx - r * 0.5},${cy - r * 0.35} Z`}
        fill="#8B5CF6" opacity="0.78"
      />

      {/* Dendritic processes — short spiky projections on the surface,
         the visual signature of a dendritic cell. */}
      {[[-1, -0.7], [1, -0.7], [-1.1, 0.2], [1.1, 0.2], [-0.7, 1], [0.7, 1]].map(([dx, dy], i) => (
        <line
          key={i}
          x1={cx + dx * r * 0.9}
          y1={cy + dy * r * 0.9}
          x2={cx + dx * r * 1.35}
          y2={cy + dy * r * 1.35}
          stroke={edge}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}

      {/* MHC molecule presenting antigen — a small Y-shaped surface
         receptor on the top-right of the cell, holding a red
         antigen fragment in its binding groove. This is what a T cell
         actually "sees" when it recognises the APC. */}
      {presenting && (
        <g transform={`translate(${cx + r * 0.6}, ${cy - r * 0.55})`}>
          {/* MHC body — Y-shaped, like a small antibody anchored to the cell */}
          <path
            d="M0,0 L0,-10 M0,-10 L-7,-18 M0,-10 L7,-18"
            stroke={edge}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Antigen fragment — a small red triangle held in the binding groove */}
          <polygon
            points="-9,-20 -3,-20 -6,-27"
            fill="#C0392B"
            stroke="#8C1C12"
            strokeWidth="0.8"
          />
          <text x="-16" y="-22" fontSize="6.5" fontWeight="700" fill="#C0392B" textAnchor="end">ag</text>
        </g>
      )}

      {/* A few antigen fragments scattered on the cell surface — the
         leftovers from the digestion, still displayed in other MHC
         molecules. Shown as small red triangles on the membrane. */}
      {[[-0.5, -0.85], [0.1, -1.05], [0.55, -0.8]].map(([dx, dy], i) => (
        <polygon
          key={i}
          points={`${cx + dx * r - 3},${cy + dy * r} ${cx + dx * r + 3},${cy + dy * r} ${cx + dx * r},${cy + dy * r - 6}`}
          fill="#C0392B"
          stroke="#8C1C12"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Thrombus — a clot that has formed inside a vessel while blood    */
/* is still flowing past it. Drawn as a layered mass anchored to    */
/* one wall, with the layers (lines of Zahn) that a real antemortem */
/* thrombus shows on cut section. `occlusive` widens the mass to    */
/* block the whole lumen; `attached` keeps it wall-anchored (as a   */
/* true thrombus always is); `embolised` fades the base to show     */
/* it has broken off and moved on. Used by any pathology diagram    */
/* that needs to show thrombosis or its complications.               */
/* ---------------------------------------------------------------- */
const atlasThrombus = ({
  cx, cy, length = 80, thickness = 24,
  occlusive = false,
  embolised = false,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#8C1C12";
  // Build the thrombus as a lumpy polygon so it reads as an organic
  // clot, not a rectangle. Anchored to the bottom wall (positive y).
  const halfL = length / 2;
  const th = occlusive ? thickness : thickness * 0.65;
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Body of the clot — a layered, lumpy mass with visible lines of
         Zahn (the alternating pale/dark bands a real thrombus shows). */}
      <path
        d={`M${cx - halfL},${cy + th / 2}
            Q${cx - halfL * 0.6},${cy - th * 0.4} ${cx - halfL * 0.2},${cy - th * 0.6}
            Q${cx + halfL * 0.2},${cy - th * 0.7} ${cx + halfL * 0.5},${cy - th * 0.5}
            Q${cx + halfL * 0.85},${cy - th * 0.2} ${cx + halfL},${cy + th / 2}
            Z`}
        fill={embolised ? "url(#atlas-grad-erythroid)" : "#8C1C12"}
        stroke={edge}
        strokeWidth={highlight ? 2.4 : 1.4}
        opacity={embolised ? 0.45 : 1}
      />
      {/* Lines of Zahn — pale wavy bands running through the clot. */}
      {[0.25, 0.5, 0.75].map((frac, i) => (
        <path
          key={i}
          d={`M${cx - halfL + length * frac},${cy + th * 0.3}
              Q${cx - halfL + length * frac + 4},${cy - th * 0.05}
              ${cx - halfL + length * frac},${cy - th * 0.35}`}
          fill="none" stroke="#F5C7C0" strokeWidth="1.4" opacity="0.65" strokeLinecap="round"
        />
      ))}
      {/* Attachment marker — small tether lines into the vessel wall
         below. Faded if the thrombus has embolised. */}
      {!embolised && (
        <g opacity="0.7">
          <line x1={cx - halfL * 0.5} y1={cy + th / 2} x2={cx - halfL * 0.5} y2={cy + th / 2 + 6} stroke="#5A1810" strokeWidth="1.6" strokeLinecap="round" />
          <line x1={cx + halfL * 0.4} y1={cy + th / 2} x2={cx + halfL * 0.4} y2={cy + th / 2 + 6} stroke="#5A1810" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {/* Occlusive marker — red cells on both sides of the clot, showing
         the lumen is blocked. Only drawn when occlusive is true. */}
      {occlusive && (
        <g>
          <ellipse cx={cx - halfL - 10} cy={cy + 2} rx="5" ry="3" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
          <ellipse cx={cx + halfL + 10} cy={cy + 2} rx="5" ry="3" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Embolus — a mass (thrombus fragment, fat droplet, air bubble, or */
/* tumour fragment) that has broken off, is travelling with the     */
/* bloodstream, and will lodge downstream once it reaches a vessel  */
/* too narrow to pass through. Drawn as a small lumpy particle      */
/* inside a flowing vessel, with motion lines behind it.            */
/* `type` picks the composition: "thrombus" (dark red clot frag-    */
/* ment), "fat" (pale yellow droplet), "air" (white circle), or     */
/* "tumour" (irregular purple mass). Used by any diagram that       */
/* needs to show embolism.                                           */
/* ---------------------------------------------------------------- */
const atlasEmbolus = ({
  cx, cy, r = 12,
  type = "thrombus",
  highlight = false,
}) => {
  const palette = {
    thrombus: { fill: "#8C1C12", stroke: "#5A1810" },
    fat:      { fill: "#FFE38A", stroke: "#D89B14" },
    air:      { fill: "#F3F1FF", stroke: "#8B5CF6" },
    tumour:   { fill: "#8B5CF6", stroke: "#5B21B6" },
  }[type] || { fill: "#8C1C12", stroke: "#5A1810" };
  const edge = highlight ? ATLAS_COLORS.trunk : palette.stroke;
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* The embolus body — irregular lumpy shape for thrombus / tumour,
         smooth circle for fat / air. */}
      {type === "thrombus" || type === "tumour" ? (
        <path
          d={`M${cx - r},${cy}
              Q${cx - r * 0.7},${cy - r * 0.85} ${cx - r * 0.2},${cy - r * 0.7}
              Q${cx + r * 0.3},${cy - r} ${cx + r * 0.75},${cy - r * 0.4}
              Q${cx + r},${cy - r * 0.1} ${cx + r * 0.7},${cy + r * 0.5}
              Q${cx + r * 0.2},${cy + r} ${cx - r * 0.4},${cy + r * 0.7}
              Q${cx - r * 0.9},${cy + r * 0.4} ${cx - r},${cy} Z`}
          fill={palette.fill} stroke={edge} strokeWidth={highlight ? 2.2 : 1.4}
        />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill={palette.fill} stroke={edge} strokeWidth={highlight ? 2.2 : 1.4} />
      )}
      {/* Motion lines trailing behind (to the left) — showing the
         embolus is moving with the flow, not stuck in the wall. */}
      <g opacity="0.55">
        <line x1={cx - r - 4} y1={cy - 3} x2={cx - r - 14} y2={cy - 3} stroke={edge} strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx - r - 3} y1={cy + 2} x2={cx - r - 12} y2={cy + 2} stroke={edge} strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx - r - 2} y1={cy + 6} x2={cx - r - 8} y2={cy + 6} stroke={edge} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Cell injury / adaptation state — one cell drawn at different     */
/* pathological states, so the same primitive can show normal,      */
/* adapted, reversibly injured, irreversibly injured, necrotic, and */
/* apoptotic cells across the same diagram. The `state` prop picks  */
/* which visual the cell renders as.                                */
/*                                                                  */
/* States:                                                          */
/*   "normal"       — healthy cell, intact membrane, normal nucleus */
/*   "hypertrophy"  — larger cell, more cytoplasm (e.g. muscle)     */
/*   "atrophy"      — smaller cell, shrunken cytoplasm              */
/*   "hyperplasia"  — cell mid-division, two nuclei                 */
/*   "metaplasia"   — cell shape changed to a different normal type */
/*   "reversible"   — swollen cell, blebs on the membrane           */
/*   "irreversible" — cell with membrane breaks, ER swelling,       */
/*                    calcium influx (drawn as purple specks)       */
/*   "necrosis"     — cell ruptured, contents leaking out,          */
/*                    inflammatory reaction (drawn as a burst)      */
/*   "apoptosis"    — cell shrinking cleanly, nuclear condensation, */
/*                    budding into apoptotic bodies                 */
/* ---------------------------------------------------------------- */
const atlasCellInjury = ({
  cx, cy, r = 34,
  state = "normal",
  label,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#8B5CF6";
  const stroke = highlight ? 2.4 : 1.6;

  // Shared cell body — draws the outer membrane with the state-appropriate
  // fill.
  const bodyFill = {
    normal:       "#F8F4EE",
    hypertrophy:  "#F8F4EE",
    atrophy:      "#F8F4EE",
    hyperplasia:  "#F8F4EE",
    metaplasia:   "#F0F4FF",
    reversible:   "#FBE9E7",
    irreversible: "#F5D0D0",
    necrosis:     "#F5C7C0",
    apoptosis:    "#E8DFFF",
  }[state] || "#F8F4EE";

  // State-specific radius. Hypertrophy is bigger, atrophy is smaller,
  // apoptosis shrinks progressively, necrosis stays the same.
  const radius = {
    hypertrophy: r * 1.15,
    atrophy:     r * 0.7,
    apoptosis:   r * 0.9,
  }[state] || r;

  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* ---- Cell body ---- */}
      <circle cx={cx} cy={cy} r={radius} fill={bodyFill} stroke={edge} strokeWidth={stroke} />

      {/* ---- Normal cell: single round nucleus, mild texture ---- */}
      {state === "normal" && (
        <>
          <circle cx={cx} cy={cy} r={radius * 0.4} fill="url(#atlas-grad-nucleus)" />
          <circle cx={cx - radius * 0.1} cy={cy - radius * 0.1} r={radius * 0.08} fill="#5B21B6" opacity="0.6" />
        </>
      )}

      {/* ---- Hypertrophy: same shape, bigger nucleus, more organelles ---- */}
      {state === "hypertrophy" && (
        <>
          <circle cx={cx} cy={cy} r={radius * 0.42} fill="url(#atlas-grad-nucleus)" />
          {/* Extra organelles — a few small mitochondria around the nucleus */}
          {[[-0.55, -0.4], [0.5, -0.45], [-0.5, 0.5], [0.55, 0.45]].map(([dx, dy], i) => (
            <ellipse key={i} cx={cx + radius * dx} cy={cy + radius * dy} rx={radius * 0.13} ry={radius * 0.08} fill="#E53935" opacity="0.6" />
          ))}
        </>
      )}

      {/* ---- Atrophy: shrunken, still normal-shaped but smaller ---- */}
      {state === "atrophy" && (
        <>
          <circle cx={cx} cy={cy} r={radius * 0.45} fill="url(#atlas-grad-nucleus)" />
          {/* Autophagic vacuoles — small grey circles, the visual
             signature of a cell eating its own contents to survive */}
          {[[-0.55, -0.3], [0.55, 0.35]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.14} fill="#64748B" opacity="0.5" />
          ))}
        </>
      )}

      {/* ---- Hyperplasia: two nuclei, cell caught mid-division ---- */}
      {state === "hyperplasia" && (
        <>
          <circle cx={cx - radius * 0.25} cy={cy} r={radius * 0.28} fill="url(#atlas-grad-nucleus)" />
          <circle cx={cx + radius * 0.25} cy={cy} r={radius * 0.28} fill="url(#atlas-grad-nucleus)" />
          {/* Division furrow — a subtle pinch line down the middle */}
          <path d={`M${cx},${cy - radius * 0.85} Q${cx + radius * 0.15},${cy} ${cx},${cy + radius * 0.85}`} stroke={edge} strokeWidth="1" fill="none" opacity="0.5" />
        </>
      )}

      {/* ---- Metaplasia: shape changed to a different normal type ---- */}
      {state === "metaplasia" && (
        <>
          {/* Cell is now a rounded rectangle instead of a circle —
             columnar / squamous change of type */}
          <rect x={cx - radius * 0.9} y={cy - radius * 0.6} width={radius * 1.8} height={radius * 1.2} rx={radius * 0.2} fill={bodyFill} stroke={edge} strokeWidth={stroke} />
          <circle cx={cx} cy={cy} r={radius * 0.32} fill="url(#atlas-grad-nucleus)" />
          <text x={cx} y={cy + radius * 0.85} textAnchor="middle" fontSize="8" fill="var(--text-2)">new cell type</text>
        </>
      )}

      {/* ---- Reversible injury: cell swelling, membrane blebs ---- */}
      {state === "reversible" && (
        <>
          {/* Swollen body outline */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={edge} strokeWidth={stroke} strokeDasharray="4 2" opacity="0.6" />
          {/* Membrane blebs — small bubbly protrusions */}
          {[[-1, -0.3], [0.9, -0.5], [-0.7, 0.7], [0.75, 0.7], [0.1, -1]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.18} fill={bodyFill} stroke={edge} strokeWidth="1.2" />
          ))}
          <circle cx={cx} cy={cy} r={radius * 0.4} fill="url(#atlas-grad-nucleus)" opacity="0.85" />
          {/* Swollen ER — pale internal circles */}
          {[[-0.4, 0.3], [0.45, 0.15]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.16} fill="#FFFFFF" opacity="0.7" stroke={edge} strokeWidth="0.6" />
          ))}
        </>
      )}

      {/* ---- Irreversible injury: calcium influx, membrane breaks ---- */}
      {state === "irreversible" && (
        <>
          {/* Broken membrane — the outer circle with a visible gap */}
          <path
            d={`M${cx - radius},${cy}
                A${radius},${radius} 0 1 1 ${cx + radius * 0.9},${cy + radius * 0.4}`}
            fill="none" stroke={edge} strokeWidth={stroke * 1.2}
          />
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={edge} strokeWidth={stroke * 0.6} strokeDasharray="3 5" opacity="0.5" />
          {/* Damaged nucleus */}
          <circle cx={cx} cy={cy} r={radius * 0.35} fill="url(#atlas-grad-nucleus)" opacity="0.7" />
          {/* Calcium specks — small purple dots all over the cell */}
          {[[-0.5, -0.3], [0.5, -0.5], [-0.6, 0.4], [0.55, 0.5], [0.1, 0.7], [-0.2, -0.6]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.06} fill="#5B21B6" opacity="0.9" />
          ))}
        </>
      )}

      {/* ---- Necrosis: cell ruptured, contents spilling out ---- */}
      {state === "necrosis" && (
        <>
          {/* Burst membrane — irregular outline with breaks */}
          <path
            d={`M${cx - radius * 0.9},${cy - radius * 0.5}
                Q${cx - radius * 1.1},${cy + radius * 0.2} ${cx - radius * 0.4},${cy + radius * 0.9}
                Q${cx + radius * 0.3},${cy + radius * 1.1} ${cx + radius * 0.95},${cy + radius * 0.4}
                Q${cx + radius * 1.1},${cy - radius * 0.3} ${cx + radius * 0.4},${cy - radius * 0.9}
                Q${cx - radius * 0.3},${cy - radius * 1.05} ${cx - radius * 0.9},${cy - radius * 0.5} Z`}
            fill={bodyFill} stroke="#8C1C12" strokeWidth={stroke * 1.2}
          />
          {/* Disintegrated nucleus — several fragments */}
          {[[-0.3, -0.2], [0.2, -0.3], [0.1, 0.25], [-0.15, 0.35]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.14} fill="url(#atlas-grad-nucleus)" opacity="0.7" />
          ))}
          {/* Spilling contents — pale yellow leak out of the membrane */}
          {[[-1.1, 0.3], [1.05, -0.4], [0.7, 1.05], [-0.8, -0.95]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.12} fill="#FFE38A" stroke="#D89B14" strokeWidth="0.5" />
          ))}
          {/* Inflammatory reaction — small pink dots (neutrophils) arriving */}
          {[[-1.3, -0.6], [1.3, 0.6], [1.1, -0.9]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.09} fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="0.8" />
          ))}
        </>
      )}

      {/* ---- Apoptosis: cell shrinks, nucleus condenses, buds off ---- */}
      {state === "apoptosis" && (
        <>
          {/* Shrinking cell with irregular buds */}
          <path
            d={`M${cx - radius * 0.9},${cy}
                Q${cx - radius},${cy - radius * 0.7} ${cx - radius * 0.3},${cy - radius * 0.9}
                Q${cx + radius * 0.4},${cy - radius * 1} ${cx + radius * 0.85},${cy - radius * 0.4}
                Q${cx + radius},${cy + radius * 0.5} ${cx + radius * 0.3},${cy + radius * 0.9}
                Q${cx - radius * 0.5},${cy + radius * 0.95} ${cx - radius * 0.9},${cy} Z`}
            fill={bodyFill} stroke={edge} strokeWidth={stroke}
          />
          {/* Condensed nucleus — dark and small, the hallmark of apoptosis */}
          <circle cx={cx} cy={cy} r={radius * 0.25} fill="#5B21B6" />
          {/* Apoptotic bodies budding off — small pale circles with fragments */}
          {[[1.2, -0.3], [1.1, 0.5], [-1.15, 0.4]].map(([dx, dy], i) => (
            <g key={i}>
              <circle cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.18} fill={bodyFill} stroke={edge} strokeWidth="1.2" />
              <circle cx={cx + radius * dx} cy={cy + radius * dy} r={radius * 0.07} fill="#5B21B6" opacity="0.7" />
            </g>
          ))}
          {/* No inflammatory reaction — that's the key difference from
             necrosis. No yellow leak, no neutrophils. */}
        </>
      )}

      {label && (
        <text x={cx} y={cy + radius + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">
          {label}
        </text>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Chromosome — a condensed chromosome drawn as an X-shape, with    */
/* two sister chromatids joined at a centromere. `condensation`     */
/* scales how tightly wound it is (0 = diffuse chromatin, 1 =      */
/* fully condensed metaphase chromosome). `spindle` draws spindle  */
/* fibres pulling from the centromere outward, showing the         */
/* chromosome attached to the mitotic spindle. `label` prints      */
/* text beneath. Used by any diagram that needs to show            */
/* chromosomes, mitosis, or cell division.                          */
/* ---------------------------------------------------------------- */
const atlasChromosome = ({
  cx, cy, length = 30,
  condensation = 1,
  spindle = false,
  color = "#8B5CF6",
  highlight = false,
  label,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : color;
  const stroke = highlight ? 3 : 2;
  // Higher condensation = tighter, shorter, thicker arms.
  const armLength = length * (1 - condensation * 0.35);
  const armWidth = 3 + condensation * 3;
  const centromereR = 3 + condensation * 1.5;
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Spindle fibres — thin lines radiating from centromere to poles */}
      {spindle && (
        <g opacity="0.55">
          <line x1={cx} y1={cy} x2={cx - length * 1.5} y2={cy - length * 0.5} stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={cx} y1={cy} x2={cx + length * 1.5} y2={cy - length * 0.5} stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={cx} y1={cy} x2={cx - length * 1.5} y2={cy + length * 0.5} stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={cx} y1={cy} x2={cx + length * 1.5} y2={cy + length * 0.5} stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
        </g>
      )}
      {/* Two sister chromatids — mirrored curved bars meeting at the centromere */}
      <path
        d={`M${cx - centromereR * 0.4},${cy - centromereR}
            Q${cx - armLength * 0.5},${cy - armLength * 0.7} ${cx - armLength * 0.35},${cy - armLength}
            M${cx + centromereR * 0.4},${cy - centromereR}
            Q${cx + armLength * 0.5},${cy - armLength * 0.7} ${cx + armLength * 0.35},${cy - armLength}
            M${cx - centromereR * 0.4},${cy + centromereR}
            Q${cx - armLength * 0.5},${cy + armLength * 0.7} ${cx - armLength * 0.35},${cy + armLength}
            M${cx + centromereR * 0.4},${cy + centromereR}
            Q${cx + armLength * 0.5},${cy + armLength * 0.7} ${cx + armLength * 0.35},${cy + armLength}`}
        stroke={edge}
        strokeWidth={armWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* Centromere — a small dark dot holding the two chromatids together */}
      <circle cx={cx} cy={cy} r={centromereR} fill="#5B21B6" stroke={edge} strokeWidth="1" />
      {label && (
        <text x={cx} y={cy + armLength + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">
          {label}
        </text>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Cell cycle — an animated ring showing the four main phases of    */
/* the cell cycle (G1 → S → G2 → M) with G0 as a side branch.       */
/* The `activePhase` prop highlights the current phase, and          */
/* `showCheckpoints` overlays the three control points. Used by      */
/* any diagram that needs to show the cell cycle, its checkpoints,   */
/* or its dysregulation in cancer.                                    */
/* ---------------------------------------------------------------- */
const atlasCellCycle = ({
  cx, cy, radius = 100,
  activePhase = "G1",
  showCheckpoints = false,
  showG0 = true,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#5B21B6";
  // Four phases, each taking one quarter of the ring.
  // Angles go clockwise starting at top: G1 (top), S (right), G2 (bottom), M (left).
  const phaseColors = {
    G1: "#2F6FED",
    S:  "#8B5CF6",
    G2: "#E53935",
    M:  "#F5B93F",
  };
  const phases = [
    { id: "G1", startAngle: -90,  endAngle: 0   },
    { id: "S",  startAngle: 0,    endAngle: 90  },
    { id: "G2", startAngle: 90,   endAngle: 180 },
    { id: "M",  startAngle: 180,  endAngle: 270 },
  ];
  const polarToCartesian = (cx, cy, r, deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arcPath = (start, end, r) => {
    const s = polarToCartesian(cx, cy, r, start);
    const e = polarToCartesian(cx, cy, r, end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M${s.x},${s.y} A${r},${r} 0 ${largeArc} 1 ${e.x},${e.y}`;
  };
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* The four arc segments of the ring */}
      {phases.map((p) => {
        const isActive = activePhase === p.id;
        const color = phaseColors[p.id];
        return (
          <g key={p.id}>
            <path
              d={arcPath(p.startAngle, p.endAngle, radius)}
              fill="none"
              stroke={isActive ? color : "#E2E8F0"}
              strokeWidth={isActive ? 22 : 18}
              strokeLinecap="butt"
              opacity={isActive ? 1 : 0.6}
            />
            {/* Phase label at the midpoint of the arc */}
            {(() => {
              const mid = (p.startAngle + p.endAngle) / 2;
              const pos = polarToCartesian(cx, cy, radius * 0.7, mid);
              return (
                <text
                  x={pos.x} y={pos.y + 5}
                  textAnchor="middle"
                  fontSize={isActive ? 18 : 15}
                  fontWeight="800"
                  fill={isActive ? color : "var(--text-2)"}
                >
                  {p.id}
                </text>
              );
            })()}
          </g>
        );
      })}

      {/* Checkpoints — small diamond markers at the phase boundaries */}
      {showCheckpoints && (
        <g>
          {/* G1/S checkpoint (start of S) */}
          {(() => {
            const pos = polarToCartesian(cx, cy, radius, 0);
            return (
              <g>
                <rect x={pos.x - 7} y={pos.y - 7} width="14" height="14" transform={`rotate(45 ${pos.x} ${pos.y})`} fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="1.2" />
                <text x={pos.x + 14} y={pos.y + 4} fontSize="9" fontWeight="700" fill={ATLAS_COLORS.trunk}>G1/S</text>
              </g>
            );
          })()}
          {/* G2/M checkpoint (start of M) */}
          {(() => {
            const pos = polarToCartesian(cx, cy, radius, 180);
            return (
              <g>
                <rect x={pos.x - 7} y={pos.y - 7} width="14" height="14" transform={`rotate(45 ${pos.x} ${pos.y})`} fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="1.2" />
                <text x={pos.x - 14} y={pos.y + 4} fontSize="9" fontWeight="700" textAnchor="end" fill={ATLAS_COLORS.trunk}>G2/M</text>
              </g>
            );
          })()}
          {/* Spindle assembly checkpoint (mid-M) */}
          {(() => {
            const pos = polarToCartesian(cx, cy, radius, 225);
            return (
              <g>
                <rect x={pos.x - 5} y={pos.y - 5} width="10" height="10" transform={`rotate(45 ${pos.x} ${pos.y})`} fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="1" />
              </g>
            );
          })()}
        </g>
      )}

      {/* G0 side branch — a small offshoot from the G1 phase showing
         the quiescent state that a cell can enter instead of dividing. */}
      {showG0 && (
        <g>
          <path
            d={`M${cx - radius * 0.85},${cy - radius * 0.55} Q${cx - radius * 1.6},${cy - radius * 1.2} ${cx - radius * 1.85},${cy - radius * 0.6}`}
            fill="none"
            stroke="#64748B"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.7"
          />
          <text
            x={cx - radius * 1.65} y={cy - radius * 1.35}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill="#64748B"
          >
            G0
          </text>
          <text
            x={cx - radius * 1.65} y={cy - radius * 1.2}
            textAnchor="middle"
            fontSize="8"
            fill="var(--text-2)"
          >
            quiescent
          </text>
        </g>
      )}

      {/* Centre label — a small compass rose at the middle to keep the
         ring from feeling empty. */}
      <circle cx={cx} cy={cy} r={radius * 0.35} fill="none" stroke={edge} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">cell</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-3)">cycle</text>
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Glomerulus — a tangled knot of capillaries enclosed in a         */
/* Bowman's capsule, drawn as a coiled red capillary tuft with      */
/* an outer cup-shaped capsule around it. This is where blood       */
/* filtration begins: pressure pushes water and small solutes       */
/* out of the capillary into the capsule, while cells and large     */
/* proteins stay behind.                                            */
/* `highlight` rings the whole structure. `showFiltration`          */
/* overlays arrows pointing outward to show the direction of        */
/* fluid movement. Used by any renal diagram that needs to show     */
/* the filtration barrier.                                           */
/* ---------------------------------------------------------------- */
const atlasGlomerulus = ({
  cx, cy, r = 42,
  showFiltration = false,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#C0392B";
  const capsuleEdge = highlight ? ATLAS_COLORS.trunk : "#8B5CF6";
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Bowman's capsule — a cup-shaped outline around the tuft,
         drawn as an open C so the afferent/efferent arterioles can
         enter from the left. */}
      <path
        d={`M${cx - r * 0.7},${cy - r * 0.9}
            Q${cx + r * 0.1},${cy - r * 1.1} ${cx + r * 0.8},${cy - r * 0.6}
            Q${cx + r * 1.15},${cy} ${cx + r * 0.8},${cy + r * 0.6}
            Q${cx + r * 0.1},${cy + r * 1.1} ${cx - r * 0.7},${cy + r * 0.9}`}
        fill="#F8F0F5"
        stroke={capsuleEdge}
        strokeWidth={highlight ? 2.6 : 1.8}
        fill-opacity="0.4"
      />

      {/* Afferent arteriole — enters from the left, wider (higher pressure) */}
      <path
        d={`M${cx - r * 1.4},${cy - r * 0.35} L${cx - r * 0.55},${cy - r * 0.35}`}
        stroke="#C0392B"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Efferent arteriole — exits below the afferent, narrower
         (higher resistance keeps the pressure inside the tuft up). */}
      <path
        d={`M${cx - r * 0.55},${cy + r * 0.35} L${cx - r * 1.4},${cy + r * 0.35}`}
        stroke="#8C1C12"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Capillary tuft — several coiled loops drawn as overlapping
         red curves to suggest the tangled ball of capillaries. */}
      <g>
        <path
          d={`M${cx - r * 0.55},${cy - r * 0.35}
              Q${cx - r * 0.1},${cy - r * 0.85} ${cx + r * 0.3},${cy - r * 0.4}
              Q${cx + r * 0.6},${cy - r * 0.05} ${cx + r * 0.35},${cy + r * 0.3}
              Q${cx},${cy + r * 0.7} ${cx - r * 0.2},${cy + r * 0.3}
              Q${cx - r * 0.5},${cy + r * 0.05} ${cx - r * 0.55},${cy - r * 0.35}`}
          fill="#E53935"
          stroke={edge}
          strokeWidth={highlight ? 2.4 : 1.4}
          opacity="0.75"
        />
        <path
          d={`M${cx - r * 0.5},${cy - r * 0.2}
              Q${cx - r * 0.15},${cy - r * 0.5} ${cx + r * 0.15},${cy - r * 0.2}
              Q${cx + r * 0.4},${cy + r * 0.1} ${cx + r * 0.2},${cy + r * 0.4}
              Q${cx - r * 0.1},${cy + r * 0.6} ${cx - r * 0.3},${cy + r * 0.3}`}
          fill="none"
          stroke="#8C1C12"
          strokeWidth="1.4"
          opacity="0.6"
        />
        <path
          d={`M${cx - r * 0.35},${cy - r * 0.05}
              Q${cx - r * 0.1},${cy - r * 0.35} ${cx + r * 0.15},${cy - r * 0.1}
              Q${cx + r * 0.35},${cy + r * 0.15} ${cx + r * 0.15},${cy + r * 0.35}`}
          fill="none"
          stroke="#F5C7C0"
          strokeWidth="1.2"
          opacity="0.8"
        />
      </g>

      {/* Filtration arrows — thin arrows pointing from the capillary
         out through the capsule wall, showing the direction of fluid
         movement when filtration is happening. */}
      {showFiltration && (
        <g>
          {[[-0.35, -0.6], [0.3, -0.75], [0.75, -0.15], [0.7, 0.45], [0.2, 0.75], [-0.4, 0.6]].map(([dx, dy], i) => {
            const px = cx + r * dx;
            const py = cy + r * dy;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return (
              <g key={i} transform={`translate(${px},${py}) rotate(${angle})`}>
                <line x1="0" y1="0" x2="14" y2="0" stroke={ATLAS_COLORS.trunk} strokeWidth="1.8" strokeLinecap="round" />
                <polygon points="14,0 8,-4 8,4" fill={ATLAS_COLORS.trunk} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Nephron — the functional unit of the kidney, drawn as a single   */
/* continuous tubule that starts at a glomerulus (top-left) and     */
/* winds its way through four segments: proximal convoluted         */
/* tubule, loop of Henle (with descending and ascending limbs),     */
/* distal convoluted tubule, and collecting duct.                   */
/* `activeSegment` highlights one segment at a time.                */
/* `highlightSegment` is a convenience prop for marking a segment   */
/* with a pulsing ring.                                             */
/* Used by any renal diagram that needs to show the nephron as a    */
/* whole or as individual tubule segments.                           */
/* ---------------------------------------------------------------- */
const atlasNephron = ({
  cx, cy, scale = 1,
  activeSegment = null,  // "glomerulus" | "pct" | "descending" | "ascending" | "dct" | "collecting"
  highlight = false,
}) => {
  const segColor = (id) => activeSegment === id ? ATLAS_COLORS.trunk : "#8B5CF6";
  const segWidth = (id) => activeSegment === id ? 6 : 4;
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} className={highlight ? "atlas-pulse" : undefined}>
      {/* Glomerulus at the top-left — drawn as a small red circle
         here rather than the full primitive, because at nephron
         scale the glomerulus is just a dot. */}
      <g transform="translate(-130,-90)">
        <circle cx="0" cy="0" r="20" fill="#F8F0F5" stroke={segColor("glomerulus")} strokeWidth="1.6" />
        <circle cx="0" cy="0" r="12" fill="#E53935" opacity="0.75" />
        <circle cx="0" cy="0" r="5" fill="#8C1C12" />
        {activeSegment === "glomerulus" && (
          <circle cx="0" cy="0" r="26" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
        )}
      </g>

      {/* Proximal convoluted tubule (PCT) — a wavy coil just below
         the glomerulus, drawn as a squiggly line. */}
      <path
        d="M-110,-70 Q-90,-60 -80,-45 Q-70,-30 -85,-15 Q-100,0 -85,15 Q-70,30 -90,45"
        fill="none"
        stroke={segColor("pct")}
        strokeWidth={segWidth("pct")}
        strokeLinecap="round"
      />
      {activeSegment === "pct" && (
        <circle cx="-88" cy="-15" r="30" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
      )}

      {/* Descending limb of the loop of Henle — goes straight down. */}
      <path
        d="M-90,45 L-90,140"
        fill="none"
        stroke={segColor("descending")}
        strokeWidth={segWidth("descending")}
        strokeLinecap="round"
      />
      {activeSegment === "descending" && (
        <circle cx="-90" cy="95" r="24" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
      )}

      {/* Hairpin turn at the bottom of the loop. */}
      <path
        d="M-90,140 Q-70,165 -50,140"
        fill="none"
        stroke={segColor("descending")}
        strokeWidth={segWidth("descending")}
        strokeLinecap="round"
      />

      {/* Ascending limb of the loop of Henle — goes back up. */}
      <path
        d="M-50,140 L-50,45"
        fill="none"
        stroke={segColor("ascending")}
        strokeWidth={segWidth("ascending")}
        strokeLinecap="round"
      />
      {activeSegment === "ascending" && (
        <circle cx="-50" cy="95" r="24" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
      )}

      {/* Distal convoluted tubule (DCT) — another coil between the
         ascending limb and the collecting duct. */}
      <path
        d="M-50,45 Q-30,30 -45,10 Q-60,-10 -40,-30"
        fill="none"
        stroke={segColor("dct")}
        strokeWidth={segWidth("dct")}
        strokeLinecap="round"
      />
      {activeSegment === "dct" && (
        <circle cx="-45" cy="5" r="26" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
      )}

      {/* Collecting duct — a straight vertical line running from the
         DCT down past the loop. Drawn slightly to the right so it
         doesn't overlap the ascending limb. */}
      <path
        d="M-40,-30 L-40,150"
        fill="none"
        stroke={segColor("collecting")}
        strokeWidth={segWidth("collecting") + 2}
        strokeLinecap="round"
      />
      {activeSegment === "collecting" && (
        <circle cx="-40" cy="60" r="26" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
      )}

      {/* Segment labels — small, placed to the sides of each segment. */}
      <text x="-155" y="-95" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="end">Glomerulus</text>
      <text x="-105" y="-70" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="end">PCT</text>
      <text x="-105" y="100" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="end">Descending</text>
      <text x="-40" y="180" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="middle">Loop of Henle</text>
      <text x="-30" y="100" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="start">Ascending</text>
      <text x="-25" y="5" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="start">DCT</text>
      <text x="-25" y="-40" fontSize="10" fontWeight="700" fill="var(--text-2)" textAnchor="start">Collecting duct</text>
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Buffer system — a small illustration of the bicarbonate buffer   */
/* equation: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻, drawn as a three-     */
/* stage reaction with arrows between them. The `activeStage` prop  */
/* highlights one stage of the reaction (0 = start, 1 = carbonic    */
/* acid formation, 2 = dissociation). `pH` shifts the balance by    */
/* tinting the arrows — lower pH pushes the reaction to the right   */
/* (more H⁺), higher pH pushes it to the left. Used by any          */
/* respiratory or renal diagram that needs to show pH chemistry.    */
/* ---------------------------------------------------------------- */
const atlasBuffer = ({
  cx, cy, width = 500, height = 120,
  activeStage = null,
  pH = 7.4,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#5B21B6";
  const stageActive = (i) => activeStage === i;
  // Low pH (< 7.4) shifts the reaction to the right (more H⁺).
  // High pH (> 7.4) shifts it to the left (less H⁺).
  const rightShift = Math.max(0, Math.min(1, (7.4 - pH) / 0.4 + 0.5));
  const leftShift = 1 - rightShift;
  return (
    <g className={highlight ? "atlas-pulse" : undefined}>
      {/* Stage 1: CO₂ + H₂O */}
      <g transform={`translate(${cx - width * 0.4},${cy})`}>
        <rect
          x="-55" y="-28" width="110" height="56" rx="10"
          fill={stageActive(0) ? "rgba(245,185,63,.18)" : "var(--bg-3)"}
          stroke={stageActive(0) ? ATLAS_COLORS.trunk : edge}
          strokeWidth={stageActive(0) ? 2.4 : 1.6}
        />
        <text x="0" y="-4" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">CO₂ + H₂O</text>
        <text x="0" y="14" textAnchor="middle" fontSize="9" fill="var(--text-2)">carbon dioxide + water</text>
      </g>

      {/* Forward arrow 1 */}
      <g transform={`translate(${cx - width * 0.16},${cy})`}>
        <line x1="-26" y1="0" x2="26" y2="0" stroke={edge} strokeWidth={2 + rightShift * 1.6} strokeLinecap="round" opacity={0.5 + rightShift * 0.5} />
        <polygon points="26,0 18,-5 18,5" fill={edge} opacity={0.5 + rightShift * 0.5} />
        <text x="0" y="-12" textAnchor="middle" fontSize="9" fill="var(--text-2)">carbonic anhydrase</text>
      </g>

      {/* Stage 2: H₂CO₃ */}
      <g transform={`translate(${cx},${cy})`}>
        <rect
          x="-45" y="-28" width="90" height="56" rx="10"
          fill={stageActive(1) ? "rgba(245,185,63,.18)" : "var(--bg-3)"}
          stroke={stageActive(1) ? ATLAS_COLORS.trunk : edge}
          strokeWidth={stageActive(1) ? 2.4 : 1.6}
        />
        <text x="0" y="-4" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">H₂CO₃</text>
        <text x="0" y="14" textAnchor="middle" fontSize="9" fill="var(--text-2)">carbonic acid</text>
      </g>

      {/* Forward arrow 2 */}
      <g transform={`translate(${cx + width * 0.16},${cy})`}>
        <line x1="-26" y1="0" x2="26" y2="0" stroke={edge} strokeWidth={2 + rightShift * 1.6} strokeLinecap="round" opacity={0.5 + rightShift * 0.5} />
        <polygon points="26,0 18,-5 18,5" fill={edge} opacity={0.5 + rightShift * 0.5} />
        <text x="0" y="-12" textAnchor="middle" fontSize="9" fill="var(--text-2)">dissociation</text>
      </g>

      {/* Stage 3: H⁺ + HCO₃⁻ */}
      <g transform={`translate(${cx + width * 0.4},${cy})`}>
        <rect
          x="-55" y="-28" width="110" height="56" rx="10"
          fill={stageActive(2) ? "rgba(245,185,63,.18)" : "var(--bg-3)"}
          stroke={stageActive(2) ? ATLAS_COLORS.trunk : edge}
          strokeWidth={stageActive(2) ? 2.4 : 1.6}
        />
        <text x="0" y="-4" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">H⁺ + HCO₃⁻</text>
        <text x="0" y="14" textAnchor="middle" fontSize="9" fill="var(--text-2)">hydrogen + bicarbonate</text>
      </g>

      {/* pH indicator — a small strip below the reaction showing
         where the current pH sits on the acid-base spectrum. */}
      <g transform={`translate(${cx - 100},${cy + 70})`}>
        <rect x="0" y="0" width="200" height="14" rx="7" fill="url(#atlas-pH-gradient)" stroke={edge} strokeWidth="1" />
        <text x="0" y="28" fontSize="8" fill="var(--text-2)">acidic</text>
        <text x="200" y="28" textAnchor="end" fontSize="8" fill="var(--text-2)">alkaline</text>
        <text x="100" y="28" textAnchor="middle" fontSize="8" fill="var(--text-2)">7.4</text>
        {/* Marker showing current pH */}
        {(() => {
          const pos = ((pH - 7.0) / 0.8) * 200;
          return (
            <g>
              <line x1={pos} y1="-4" x2={pos} y2="18" stroke={ATLAS_COLORS.trunk} strokeWidth="2.4" strokeLinecap="round" />
              <text x={pos} y="-8" textAnchor="middle" fontSize="10" fontWeight="800" fill={ATLAS_COLORS.trunk}>pH {pH.toFixed(2)}</text>
            </g>
          );
        })()}
      </g>

    </g>
  );
};

/* ---------------------------------------------------------------- */
/* GI Tract — a stylised side view of the whole digestive tube     */
/* from mouth to rectum, with the accessory organs (liver,          */
/* pancreas, gallbladder) shown branching off. Segments are         */
/* clickable: mouth, oesophagus, stomach, small intestine, large    */
/* intestine, rectum. `activeSegment` highlights one at a time.    */
/* Used by any diagram that needs to show the digestive system      */
/* as a whole or as individual segments.                             */
/* ---------------------------------------------------------------- */
const atlasGITract = ({
  cx, cy, scale = 1,
  activeSegment = null,
  highlight = false,
}) => {
  const segStroke = (id) => activeSegment === id ? ATLAS_COLORS.trunk : "#C0392B";
  const segFill = (id) => activeSegment === id ? "rgba(245,185,63,.25)" : "#F5D0CC";
  const segWidth = (id) => activeSegment === id ? 4 : 2.4;
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} className={highlight ? "atlas-pulse" : undefined}>
      {/* Mouth / oral cavity — small oval at the top */}
      <g>
        <ellipse
          cx="-40" cy="-180" rx="26" ry="14"
          fill={segFill("mouth")} stroke={segStroke("mouth")} strokeWidth={segWidth("mouth")}
        />
        <text x="-40" y="-176" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--text-2)">mouth</text>
      </g>

      {/* Oesophagus — straight tube from mouth down to stomach */}
      <path
        d="M-40,-166 L-40,-100"
        fill="none" stroke={segStroke("oesophagus")} strokeWidth={segWidth("oesophagus") + 6} strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M-40,-166 L-40,-100"
        fill="none" stroke={segFill("oesophagus")} strokeWidth={segWidth("oesophagus")} strokeLinecap="round"
      />

      {/* Stomach — a J-shaped pouch on the left */}
      <path
        d="M-40,-100
           Q-90,-95 -95,-50
           Q-100,0 -60,20
           Q-30,30 -20,10
           Q-10,-10 -30,-40
           Q-35,-70 -40,-100 Z"
        fill={segFill("stomach")} stroke={segStroke("stomach")} strokeWidth={segWidth("stomach")}
      />
      <text x="-60" y="-35" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">stomach</text>

      {/* Small intestine — a coiled tube in the middle, drawn as a
         series of loops to suggest the ~6 metres of coiled tube. */}
      <path
        d="M-30,15
           Q10,10 20,35
           Q30,60 -10,65
           Q-50,70 -55,95
           Q-60,120 -20,125
           Q20,130 25,155
           Q30,180 -10,185
           Q-40,190 -40,210"
        fill="none" stroke={segStroke("small-intestine")} strokeWidth={segWidth("small-intestine") + 3}
        strokeLinecap="round"
        strokeDasharray={activeSegment === "small-intestine" ? undefined : "6 3"}
      />
      <text x="55" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">small</text>
      <text x="55" y="103" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">intestine</text>

      {/* Large intestine — an arch going up right, across the top,
         and down left, then down to the rectum. */}
      <path
        d="M-40,210
           Q-40,160 -70,140
           Q-90,120 -90,80
           Q-90,20 -60,-10
           Q-30,-40 20,-40
           Q70,-40 100,-10
           Q130,20 130,80
           Q130,140 100,165
           Q70,190 70,210"
        fill="none" stroke={segStroke("large-intestine")} strokeWidth={segWidth("large-intestine") + 6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="130" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">large</text>
      <text x="130" y="103" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">intestine</text>

      {/* Rectum / anus — short segment at the bottom */}
      <path
        d="M70,210 L70,230"
        fill="none" stroke={segStroke("rectum")} strokeWidth={segWidth("rectum") + 6} strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M70,210 L70,230"
        fill="none" stroke={segFill("rectum")} strokeWidth={segWidth("rectum")} strokeLinecap="round"
      />
      <text x="95" y="235" fontSize="9" fontWeight="700" fill="var(--text-2)">rectum</text>

      {/* Liver — soft blob on the upper right, with a bile duct line
         going down to the small intestine */}
      <g>
        <path
          d="M60,-60 Q90,-75 120,-55 Q140,-35 125,-10 Q105,5 80,-5 Q60,-15 60,-60 Z"
          fill="#F5D0CC"
          stroke="#8C1C12"
          strokeWidth="1.6"
        />
        <text x="95" y="-30" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">liver</text>
        {/* Bile duct */}
        <path d="M90,0 Q80,30 60,50 Q40,65 20,60" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 3" />
      </g>

      {/* Gallbladder — small green pouch attached to the liver */}
      <ellipse cx="105" cy="5" rx="14" ry="8" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.4" />
      <text x="105" y="20" textAnchor="middle" fontSize="8" fontWeight="700" fill="#16A34A">gall-</text>
      <text x="105" y="30" textAnchor="middle" fontSize="8" fontWeight="700" fill="#16A34A">bladder</text>

      {/* Pancreas — elongated organ behind the stomach, with a duct
         running to the small intestine */}
      <path
        d="M-60,20 Q-20,30 20,40 Q50,48 70,42"
        fill="none" stroke="#F5B93F" strokeWidth="10" strokeLinecap="round"
      />
      <path
        d="M-60,20 Q-20,30 20,40 Q50,48 70,42"
        fill="none" stroke="#8B6410" strokeWidth="2" strokeLinecap="round" opacity="0.5"
      />
      <text x="0" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">pancreas</text>
      {/* Pancreatic duct */}
      <path d="M60,42 Q50,55 30,65" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Erythroid maturation stage — one red cell precursor, drawn so    */
/* the actual visible changes across maturation (nucleus shrinking  */
/* and condensing, cytoplasm shifting blue to pink, nucleus finally */
/* extruded, residual RNA in the reticulocyte, central pallor in    */
/* the mature cell) are what a student sees, not a labelled box.    */
/* `stage` is 1..6, matching the six rows in the erythroid diagram. */
/* ---------------------------------------------------------------- */
const atlasErythroidStage = ({
  id, cx, cy, r = 34, stage, label, sub,
  onLabelClick, activeLabelId, pulsing, preview,
}) => {
  const active = activeLabelId === id;
  const ring = active ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3 } : { stroke: "transparent", strokeWidth: 0 };

  // Nucleus radius shrinks stage by stage, then goes to zero at stage 5
  // (extruded) and 6 (mature red cell has no nucleus at all).
  const nucleusR  = [0.62, 0.55, 0.46, 0.34, 0, 0][stage - 1] * r;
  const nucleusOp = [1,    1,    1,    0.9,  0, 0][stage - 1];

  // Cytoplasm shifts from ribosome-rich blue (stages 1-2) through a mixed
  // polychromatophilic shade (stage 3) to haemoglobin-rich pink/red
  // (stages 4-6) — the exact colour progression a real stained film shows.
  const cytoFill   = ["#9AB4E8", "#B8C4DC", "#D8B4B8", "#F0A8A0", "#F0B0A8", "#E53935"][stage - 1];
  const cytoStroke = ["#123F9E", "#123F9E", "#8C1C12", "#8C1C12", "#8C1C12", "#8C1C12"][stage - 1];

  return (
    <g
      onClick={preview ? undefined : () => onLabelClick(id)}
      style={{ cursor: preview ? "default" : "pointer" }}
      className={pulsing ? "atlas-pulse" : ""}
    >
      {stage < 6 ? (
        <circle cx={cx} cy={cy} r={r} fill={cytoFill} stroke={cytoStroke} strokeWidth="1.6" filter="url(#atlas-shadow)" {...ring} />
      ) : (
        // Mature red cell is biconcave, not round — same ellipse ratio as
        // the existing atlasBloodCell primitive, so the two read as the
        // same kind of object.
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.62} fill={cytoFill} stroke={cytoStroke} strokeWidth="1.6" filter="url(#atlas-shadow)" {...ring} />
      )}

      {nucleusR > 0 && (
        <>
          <circle cx={cx} cy={cy} r={nucleusR} fill="url(#atlas-grad-nucleus)" opacity={nucleusOp} />
          {/* Chromatin clumping gets visibly denser from stage 2 onward —
              this is what "condensing nucleus" actually looks like. */}
          <circle cx={cx - nucleusR * 0.30} cy={cy - nucleusR * 0.20} r={nucleusR * 0.28} fill="#5B21B6" opacity={stage >= 3 ? 0.6 : 0.35} />
          <circle cx={cx + nucleusR * 0.25} cy={cy + nucleusR * 0.15} r={nucleusR * 0.22} fill="#5B21B6" opacity={stage >= 3 ? 0.55 : 0.3} />
        </>
      )}

      {stage === 5 && (
        // Reticulocyte — residual ribosomal RNA strands, the single
        // feature that distinguishes it from a mature red cell on a
        // supravital stain.
        <>
          <path d={`M${cx - r * 0.40},${cy - r * 0.10} Q${cx},${cy - r * 0.35} ${cx + r * 0.40},${cy - r * 0.10}`} fill="none" stroke="#5B21B6" strokeWidth="1.4" opacity="0.65" strokeLinecap="round" />
          <path d={`M${cx - r * 0.35},${cy + r * 0.20} Q${cx},${cy - r * 0.05} ${cx + r * 0.35},${cy + r * 0.20}`} fill="none" stroke="#5B21B6" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
        </>
      )}

      {stage === 6 && (
        // Central pallor — the unmistakable hallmark of a mature red cell
        // on a peripheral film, caused by its biconcave shape.
        <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.3} fill="#F5C7C0" opacity="0.75" />
      )}

      {label && <text x={cx} y={cy + r + 18} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text)">{label}</text>}
      {sub && <text x={cx} y={cy + r + 31} textAnchor="middle" fontSize="9" fill="var(--text-2)">{sub}</text>}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Haematopoietic stem cell — cytoplasm rim with a large, textured  */
/* nucleus filling most of the cell (as a real HSC does), a visible */
/* nucleolus, and irregular chromatin clumps instead of a flat      */
/* purple bubble. Used for the HSC itself and any other self-       */
/* renewing stem-like cell in the haematopoiesis family.            */
/* ---------------------------------------------------------------- */
const atlasStemCell = ({
  id, cx, cy, r = 46, label, sub,
  onLabelClick, activeLabelId, pulsing, onOpenDrill, preview,
}) => {
  const active = activeLabelId === id;
  const ring = active ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3 } : { stroke: "transparent", strokeWidth: 0 };
  return (
    <g
      onClick={preview ? undefined : () => onLabelClick(id)}
      style={{ cursor: preview ? "default" : "pointer" }}
      className={pulsing ? "atlas-pulse" : ""}
    >
      {/* Cytoplasm — thin, lighter rim around the nucleus, same as a
          real HSC's narrow cytoplasmic border on a stained film. */}
      <circle cx={cx} cy={cy} r={r} fill="#E9DFFF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.6" filter="url(#atlas-shadow)" {...ring} />
      {/* Nucleus — large, fills most of the cell. */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill="url(#atlas-grad-nucleus)" />
      {/* Chromatin texture — irregular darker clumps, not a uniform fill. */}
      <circle cx={cx - r * 0.28} cy={cy - r * 0.22} r={r * 0.22} fill="#5B21B6" opacity="0.55" />
      <circle cx={cx + r * 0.20} cy={cy + r * 0.10} r={r * 0.18} fill="#5B21B6" opacity="0.5" />
      <circle cx={cx - r * 0.05} cy={cy + r * 0.32} r={r * 0.15} fill="#5B21B6" opacity="0.45" />
      {/* Nucleolus — one small bright spot, always present in a real HSC. */}
      <circle cx={cx + r * 0.10} cy={cy - r * 0.30} r={r * 0.10} fill="#E9DFFF" opacity="0.9" />
      {onOpenDrill && <text x={cx + r - 6} y={cy - r + 14} textAnchor="end" fontSize="13" fill={ATLAS_COLORS.trunk}>⤢</text>}
      {label && <text x={cx} y={cy + r + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{label}</text>}
      {sub && <text x={cx} y={cy + r + 30} textAnchor="middle" fontSize="10" fill="var(--text-2)">{sub}</text>}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Lineage-restricted progenitor — same visual family as             */
/* atlasStemCell, but smaller, no nucleolus, and colour-coded by     */
/* lineage (amber = trunk/myeloid, blue = lymphoid, crimson =        */
/* erythroid). Used for CMP, CLP, GMP, MEP — replacing what were     */
/* previously rounded rectangle boxes in the myeloid drill-down.     */
/* ---------------------------------------------------------------- */
const atlasProgenitor = ({
  id, cx, cy, r = 40, lineage = "trunk", label, sub,
  onLabelClick, activeLabelId, pulsing, onOpenDrill, preview,
}) => {
  const color = lineage === "lymphoid"  ? ATLAS_COLORS.lymphoid
              : lineage === "erythroid" ? ATLAS_COLORS.erythroid
              :                           ATLAS_COLORS.trunk;
  const gradId = GRADIENT_BY_COLOR[color];
  const active = activeLabelId === id;
  const ring = active ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3 } : { stroke: "transparent", strokeWidth: 0 };
  return (
    <g
      onClick={preview ? undefined : () => onLabelClick(id)}
      style={{ cursor: preview ? "default" : "pointer" }}
      className={pulsing ? "atlas-pulse" : ""}
    >
      {/* Cytoplasm — thin lighter rim, matching atlasStemCell. */}
      <circle cx={cx} cy={cy} r={r} fill="#F8F4EE" stroke={color} strokeWidth="1.6" filter="url(#atlas-shadow)" {...ring} />
      {/* Nucleus — smaller relative to the cell than in a stem cell,
          because a committed progenitor's nucleus shrinks as it starts
          to specialise. */}
      <circle cx={cx} cy={cy} r={r * 0.62} fill={`url(#${gradId})`} opacity="0.85" />
      {/* Light chromatin texture — less prominent than the HSC's. */}
      <circle cx={cx - r * 0.18} cy={cy - r * 0.15} r={r * 0.14} fill="#000" opacity="0.18" />
      <circle cx={cx + r * 0.14} cy={cy + r * 0.12} r={r * 0.12} fill="#000" opacity="0.15" />
      {onOpenDrill && <text x={cx + r - 6} y={cy - r + 14} textAnchor="end" fontSize="13" fill={ATLAS_COLORS.trunk}>⤢</text>}
      {label && <text x={cx} y={cy + r + 16} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">{label}</text>}
      {sub && <text x={cx} y={cy + r + 29} textAnchor="middle" fontSize="9" fill="var(--text-2)">{sub}</text>}
    </g>
  );
};

/* ---------------------------------------------------------------- */
/* Clotting cascade — the shared final pathway of blood            */
/* coagulation, drawn as a simplified three-column flowchart:      */
/* intrinsic and extrinsic routes converging on the common         */
/* pathway, which ends in a fibrin mesh.                           */
/*                                                                  */
/* The primitive exists to show WHERE each of the three            */
/* anticoagulant strategies acts:                                  */
/*                                                                  */
/*   blockAt="calcium"      — the calcium-dependent assembly       */
/*                            steps. Used by EDTA, citrate and     */
/*                            oxalate.                              */
/*                                                                  */
/*   blockAt="antithrombin" — the steps antithrombin neutralises.  */
/*                            Used by heparin.                     */
/*                                                                  */
/*   blockAt="vitaminK"     — the factors the liver can't make     */
/*                            when warfarin blocks vitamin K       */
/*                            recycling.                            */
/*                                                                  */
/* Pass blockAt=null (the default) for the unblocked cascade.      */
/* Used by any diagram that needs to show where an anticoagulant   */
/* interferes with clotting.                                        */
/* ---------------------------------------------------------------- */
const atlasClottingCascade = ({
  cx, cy, scale = 1,
  blockAt = null,
  showLabels = true,
  highlight = false,
}) => {
  const edge = highlight ? ATLAS_COLORS.trunk : "#64748B";
  const boxW = 58;
  const boxH = 24;
  const rowGap = 34;
  const leftX = cx - 170;
  const rightX = cx + 170;
  const centerX = cx;
  const topY = cy - 80;
  const rowXa       = topY + 3 * rowGap;
  const rowII       = rowXa + rowGap;
  const rowThrombin = rowII + rowGap;
  const rowFibrino  = rowThrombin + rowGap;
  const rowFibrin   = rowFibrino + rowGap;

  // One small labelled box per factor, with optional state markers.
  const factorNode = (x, y, label, opts = {}) => {
    const {
      w = boxW, h = boxH,
      fill = "#F8F4EE",
      stroke = "#64748B",
      textColor = "var(--text)",
      crossed = false,
      blocked = false,
      faded = false,
    } = opts;
    return (
      <g opacity={faded ? 0.35 : 1}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6}
          fill={fill} stroke={stroke} strokeWidth="1.4" />
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="9.5" fontWeight="700" fill={textColor}>{label}</text>
        {crossed && (
          <g>
            <line x1={x - 9} y1={y - 9} x2={x + 9} y2={y + 9}
              stroke="#C0392B" strokeWidth="2.6" strokeLinecap="round" />
            <line x1={x + 9} y1={y - 9} x2={x - 9} y2={y + 9}
              stroke="#C0392B" strokeWidth="2.6" strokeLinecap="round" />
          </g>
        )}
        {blocked && (
          <rect x={x - w / 2 - 4} y={y - h / 2 - 4} width={w + 8} height={h + 8} rx={8}
            fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="4 3" />
        )}
      </g>
    );
  };

  // Short vertical connector with a small arrowhead.
  const arrowLink = (x1, y1, x2, y2) => {
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <polygon points="0,0 -6,-3 -6,3"
          transform={`translate(${x2},${y2}) rotate(${angle})`} fill="#94A3B8" />
      </g>
    );
  };

  return (
    <g className={highlight ? "atlas-pulse" : undefined}>

      {/* Intrinsic pathway — left column */}
      {factorNode(leftX, topY, "XII")}
      {arrowLink(leftX, topY + 12, leftX, topY + rowGap - 12)}
      {factorNode(leftX, topY + rowGap, "XI")}
      {arrowLink(leftX, topY + rowGap + 12, leftX, topY + 2 * rowGap - 12)}
      {factorNode(leftX, topY + 2 * rowGap, "IX")}
      {arrowLink(leftX, topY + 2 * rowGap + 12, centerX - 34, rowXa - 12)}

      {/* Extrinsic pathway — right column */}
      {factorNode(rightX, topY, "Tissue factor", { w: 90 })}
      {arrowLink(rightX, topY + 12, rightX, topY + rowGap - 12)}
      {factorNode(rightX, topY + rowGap, "VII")}
      {arrowLink(rightX, topY + rowGap + 12, rightX, topY + 2 * rowGap - 12)}
      {factorNode(rightX, topY + 2 * rowGap, "TF-VIIa")}
      {arrowLink(rightX, topY + 2 * rowGap + 12, centerX + 34, rowXa - 12)}

      {/* Common pathway — centre column */}
      {factorNode(centerX, rowXa, "X → Xa", { w: 68 })}
      {arrowLink(centerX, rowXa + 12, centerX, rowII - 12)}
      {factorNode(centerX, rowII, "Prothrombin (II)", { w: 100 })}
      {arrowLink(centerX, rowII + 12, centerX, rowThrombin - 12)}
      {factorNode(centerX, rowThrombin, "Thrombin", { w: 90 })}
      {arrowLink(centerX, rowThrombin + 12, centerX, rowFibrino - 12)}
      {factorNode(centerX, rowFibrino, "Fibrinogen (I)", { w: 100 })}
      {arrowLink(centerX, rowFibrino + 12, centerX, rowFibrin - 12)}
      {factorNode(centerX, rowFibrin, "FIBRIN", {
        w: 70,
        fill: "#F5B0B0",
        stroke: "#8C1C12",
        textColor: "#8C1C12",
      })}

      {/* Calcium-dependent step markers — IX, TF-VIIa, X→Xa, prothrombin */}
      {blockAt === "calcium" && (
        <g pointerEvents="none">
          {factorNode(leftX, topY + 2 * rowGap, "IX", { crossed: true })}
          {factorNode(rightX, topY + 2 * rowGap, "TF-VIIa", { crossed: true })}
          {factorNode(centerX, rowXa, "X → Xa", { crossed: true, w: 68, h: 26 })}
          {factorNode(centerX, rowII, "Prothrombin (II)", { crossed: true, w: 100, h: 26 })}
          <text x={rightX + 56} y={rowXa} textAnchor="start"
            fontSize="10" fontWeight="700" fill="#C0392B">Ca²⁺ removed</text>
          <text x={rightX + 56} y={rowXa + 14} textAnchor="start"
            fontSize="8.5" fill="var(--text-2)">EDTA · citrate · oxalate</text>
        </g>
      )}

      {/* Antithrombin acceleration markers — Xa and thrombin */}
      {blockAt === "antithrombin" && (
        <g pointerEvents="none">
          {factorNode(centerX, rowXa, "X → Xa", { blocked: true, w: 68, h: 26 })}
          {factorNode(centerX, rowThrombin, "Thrombin", { blocked: true, w: 90, h: 26 })}
          <text x={rightX + 56} y={rowXa} textAnchor="start"
            fontSize="10" fontWeight="700" fill={ATLAS_COLORS.trunk}>Antithrombin boosted</text>
          <text x={rightX + 56} y={rowXa + 14} textAnchor="start"
            fontSize="8.5" fill="var(--text-2)">heparin</text>
        </g>
      )}

      {/* Vitamin K factor synthesis markers — II, VII, IX, X faded */}
      {blockAt === "vitaminK" && (
        <g pointerEvents="none">
          {factorNode(rightX, topY + rowGap, "VII", { faded: true })}
          {factorNode(leftX, topY + 2 * rowGap, "IX", { faded: true })}
          {factorNode(centerX, rowXa, "X → Xa", { faded: true, w: 68, h: 26 })}
          {factorNode(centerX, rowII, "Prothrombin (II)", { faded: true, w: 100, h: 26 })}
          <text x={rightX + 56} y={rowXa} textAnchor="start"
            fontSize="10" fontWeight="700" fill="#2F6FED">Factors II · VII · IX · X</text>
          <text x={rightX + 56} y={rowXa + 14} textAnchor="start"
            fontSize="8.5" fill="var(--text-2)">not made by the liver — warfarin</text>
        </g>
      )}

      {/* Column band labels */}
      {showLabels && (
        <g pointerEvents="none">
          <text x={leftX} y={topY - 28} textAnchor="middle"
            fontSize="10" fontWeight="800" fill={edge}>INTRINSIC</text>
          <text x={rightX} y={topY - 28} textAnchor="middle"
            fontSize="10" fontWeight="800" fill={edge}>EXTRINSIC</text>
          <text x={centerX} y={topY - 28} textAnchor="middle"
            fontSize="10" fontWeight="800" fill={edge}>COMMON PATHWAY</text>
          <line x1={leftX + 44} y1={topY - 12} x2={leftX + 44} y2={rowXa - 22}
            stroke={edge} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4" />
          <line x1={rightX - 44} y1={topY - 12} x2={rightX - 44} y2={rowXa - 22}
            stroke={edge} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4" />
        </g>
      )}
    </g>
  );
};

export const DIAGRAMS = {

  /* =========================================================
     HAEMATOPOIESIS — top level
     Topic: Hematology I (hem), Topic 02 (index 1)
     ========================================================= */
    "hem:haematopoiesis": {
    id: "hem:haematopoiesis",
    type: "diagram",
    title: "Haematopoiesis — The Complete Tree",
    topic: { courseId: "hem", topicIndex: 1 },
    parent: null,
    summary: "Haematopoiesis is the process your body uses to make every blood cell it needs, every day, for your whole life. It starts from a single kind of stem cell in your bone marrow that can both copy itself and turn into any of the specialised cells in your blood — red cells that carry oxygen, platelets that stop bleeding, and the many kinds of white cell that fight infection. The process is switched on and driven by growth factors, and it shifts location before birth — starting in the yolk sac, then the liver and spleen, before settling permanently in the marrow. When any part of it breaks, the result is a blood disease.",
    labels: [
      { id: "hsc", name: "Haematopoietic Stem Cell", desc: "The single cell type every blood cell in your body descends from. It can self-renew (make a copy of itself) and differentiate (commit to a lineage) at the same time." },
      { id: "cmp", name: "Common Myeloid Progenitor", desc: "Commits to the myeloid line — red cells, platelets, granulocytes and monocytes. Tap the open-arrow to see this branch in full detail.", drillTo: "hem:haematopoiesis-myeloid" },
      { id: "clp", name: "Common Lymphoid Progenitor", desc: "Commits to the lymphoid line — B cells, T cells and natural killer cells." },
      { id: "myeloid-leaf", name: "Myeloid-derived cells", desc: "Red cells, platelets, granulocytes and monocytes — all downstream of the common myeloid progenitor." },
      { id: "b", name: "B Lymphocytes", desc: "Mature in the bone marrow, produce antibodies once activated." },
      { id: "t", name: "T Lymphocytes", desc: "Mature in the thymus, coordinate and carry out cell-mediated immunity." },
      { id: "nk", name: "Natural Killer Cells", desc: "Innate lymphoid cells that kill virus-infected and tumour cells without needing prior sensitisation." },
      { id: "liver", name: "Liver (extramedullary site)", desc: "A fetal site of blood production. If the marrow is failing, scarred, or overwhelmed, the liver can restart making blood cells — this is why liver enlargement can be a sign of marrow disease." },
      { id: "spleen", name: "Spleen (extramedullary site)", desc: "Also a fetal site of blood production, and the other organ that can restart haematopoiesis if the marrow can't keep up — causing a palpable, enlarged spleen." },
    ],
    // Each line maps directly to one of the 10 real Socratic lesson
    // steps for this topic, in the same order - step 0 here is step 0
    // there, step 9 here is step 9 there. Rewritten plain-language per
    // the earlier jargon pass, not a separate invented summary.
    narration: [
      "Every day, your bone marrow replaces billions of worn-out blood cells. All of them start from exactly one kind of cell.",
      "Every blood cell only lives for weeks or months, so something has to keep making new ones - a single type of cell that never runs out: the stem cell.",
      "In an adult, this all happens inside the bone marrow. But that wasn't always true - before birth, blood was first made in the yolk sac, then the liver and spleen, before finally settling in the marrow for good.",
      "This one stem cell can become any blood cell - but it has to decide which. That decision happens at a branch point: it commits to becoming either a myeloid progenitor or a lymphoid progenitor.",
      "How many cells get made depends on growth factors - signals like EPO for red cells or G-CSF for white cells - telling each branch how hard to work.",
      "When a growth factor locks onto a progenitor cell, it switches on a relay of proteins inside the cell that carries that message to the nucleus, telling it to divide and mature.",
      "The myeloid line produces red cells, platelets, and the white cells of your immune system's first response. The lymphoid line produces B cells, T cells, and NK cells - the cells of more targeted defence.",
      "When any part of this breaks, you get a blood disease - too few cells, too many cells, the wrong kind of cell, missing raw materials, or normal cells destroyed too fast.",
      "If the marrow can't keep up - because it's failing, scarred, or overwhelmed - the body falls back on the sites it used before birth: the liver and spleen can restart making blood cells.",
      "Putting it all together: one stem cell, two branches, three mature cell families, all driven by growth factors and kept in balance - until something breaks that balance.",
    ],
    stepFocus: [
      ["hsc"], ["hsc"], ["hsc", "liver", "spleen"], ["hsc", "cmp", "clp"], ["cmp", "clp"], ["cmp", "clp"],
      ["myeloid-leaf", "b", "t", "nk"], ["cmp", "clp"], ["liver", "spleen"], ["hsc", "cmp", "clp", "myeloid-leaf", "b", "t", "nk"],
    ],
        // Visual staging per step, same role as the Cardiac Cycle's
    // phaseState - what's visible/emphasised changes as the narration
    // moves through the real 10 Socratic steps, not just a highlight ring
    // on an otherwise static picture.
    stageState: [
      { hsc: 1,    branches: 0,   leaves: 0,    sites: 0 },
      { hsc: 1,    branches: 0,   leaves: 0,    sites: 0 },
      { hsc: 1,    branches: 0,   leaves: 0,    sites: 0.25 },
      { hsc: 1,    branches: 1,   leaves: 0,    sites: 0 },
      { hsc: 0.6,  branches: 1,   leaves: 0,    sites: 0 },
      { hsc: 0.6,  branches: 1,   leaves: 0.15, sites: 0 },
      { hsc: 0.4,  branches: 0.6, leaves: 1,    sites: 0 },
      { hsc: 0.4,  branches: 0.6, leaves: 0.6,  sites: 0 },
      { hsc: 0.3,  branches: 0.4, leaves: 0.4,  sites: 1 },
      { hsc: 1,    branches: 1,   leaves: 1,    sites: 1 },
    ],
    viewBox: "0 0 900 520",
    render: ({ onLabelClick, activeLabelId, activeStep, onOpenDrill, preview }) => {
      const diagram = DIAGRAMS["hem:haematopoiesis"];
      const focus = diagram.stepFocus[activeStep] || [];
      const st = diagram.stageState[activeStep] || diagram.stageState[0];
      const pulsing = (id) => !preview && focus.includes(id);

      return (
        <svg viewBox="0 0 900 520" width="100%" height="100%">
          {atlasDefs()}

          {/* Marrow cavity backdrop - trabecular bone texture, so the stem
             cell reads as sitting INSIDE an organ, not floating on blank
             space. Soft, low-opacity, never competes with the cells. */}
          <ellipse cx="450" cy="230" rx="420" ry="260" fill="#2B1A14" opacity="0.08" />
          {[[120,90],[760,110],[90,380],[780,370],[450,40],[200,460],[700,460]].map(([x,y],i) => (
            <path key={i} d={`M${x},${y} q20,-10 35,10 q-5,20 -30,15 q-15,-10 -5,-25 z`} fill="#8C1C12" opacity="0.06" />
          ))}

          {/* Flow lines fade in with the branch stage, not always present
             at full strength - matching the "trunk splits" narration beat.
             Drawn from the bottom of the HSC to the top of each
             progenitor, and from each progenitor down to its leaves. */}
          <g opacity={st.branches}>
            {atlasFlow("M450,120 Q350,140 260,150")}
            {atlasFlow("M450,120 Q550,140 640,150")}
            {atlasFlow("M260,232 Q220,270 195,300")}
            {atlasFlow("M640,232 Q565,270 495,300")}
            {atlasFlow("M640,232 Q625,270 605,300")}
            {atlasFlow("M640,232 Q685,270 710,300")}
          </g>

          {/* Stem cell - proper haematopoietic stem cell with cytoplasm
             rim, textured chromatin, and a visible nucleolus. Opacity is
             driven by stageState so it fades as the narration moves past
             the "one stem cell" opening into the branch-and-specialise
             middle section, then comes back for the synthesis step. */}
          <g opacity={st.hsc}>
            {atlasStemCell({
              id: "hsc", cx: 450, cy: 70, r: 46,
              label: "Stem Cell (HSC)",
              onLabelClick, activeLabelId,
              pulsing: pulsing("hsc"),
              preview,
            })}
          </g>

          {/* Myeloid progenitor - amber, lineage-restricted, drill-down
             indicator because it opens the myeloid child diagram. */}
          <g opacity={st.branches}>
            {atlasProgenitor({
              id: "cmp", cx: 260, cy: 190, r: 40, lineage: "trunk",
              label: "Myeloid progenitor", sub: "CMP",
              onLabelClick, activeLabelId,
              pulsing: pulsing("cmp"),
              onOpenDrill: !!onOpenDrill, preview,
            })}
          </g>

          {/* Lymphoid progenitor - blue, no drill-down (no child diagram
             for the lymphoid branch yet). */}
          <g opacity={st.branches}>
            {atlasProgenitor({
              id: "clp", cx: 640, cy: 190, r: 40, lineage: "lymphoid",
              label: "Lymphoid progenitor", sub: "CLP",
              onLabelClick, activeLabelId,
              pulsing: pulsing("clp"),
              preview,
            })}
          </g>

          {/* Mature cells - real primitives, not abstract shapes: an actual
             biconcave red cell, a lobed-nucleus white cell, a granular
             platelet, same art used throughout the Cardiovascular family.
             The myeloid-leaf cluster groups the four myeloid-derived cell
             types together on the left, matching where the CMP sits above
             it, so the eye traces CMP down to its own children. */}
          <g opacity={st.leaves} className={pulsing("myeloid-leaf") ? "atlas-pulse" : ""} onClick={preview ? undefined : () => onLabelClick("myeloid-leaf")} style={{ cursor: preview ? "default" : "pointer" }}>
            {atlasBloodCell({ cx: 150, cy: 320, r: 20, oxygenated: true })}
            {atlasPlatelet({ cx: 205, cy: 345, r: 9 })}
            {atlasWhiteCell({ cx: 175, cy: 365, r: 14 })}
            <text x="178" y="400" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Red cells · platelets</text>
            <text x="178" y="412" textAnchor="middle" fontSize="9" fill="var(--text-2)">granulocytes · monocytes</text>
          </g>

          {/* B, T, NK - all three descend from the lymphoid progenitor
             above them, so their x positions cluster under 640 rather
             than spreading the full width. */}
          <g opacity={st.leaves} className={pulsing("b") ? "atlas-pulse" : ""} onClick={preview ? undefined : () => onLabelClick("b")} style={{ cursor: preview ? "default" : "pointer" }}>
            {atlasWhiteCell({ cx: 495, cy: 330, r: 22 })}
            <text x="495" y="366" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">B cells</text>
          </g>
          <g opacity={st.leaves} className={pulsing("t") ? "atlas-pulse" : ""} onClick={preview ? undefined : () => onLabelClick("t")} style={{ cursor: preview ? "default" : "pointer" }}>
            {atlasWhiteCell({ cx: 605, cy: 330, r: 22 })}
            <text x="605" y="366" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">T cells</text>
          </g>
          <g opacity={st.leaves} className={pulsing("nk") ? "atlas-pulse" : ""} onClick={preview ? undefined : () => onLabelClick("nk")} style={{ cursor: preview ? "default" : "pointer" }}>
            {atlasWhiteCell({ cx: 715, cy: 330, r: 22 })}
            <text x="715" y="366" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">NK cells</text>
          </g>

          {/* Extramedullary sites - fade in only when the narration reaches
             step 8, exactly when the body falls back on them. The dashed
             connector ties them visually back to the marrow where the
             stem cell lives, rather than floating as two isolated organs. */}
          <g opacity={st.sites}>
            <line x1="450" y1="420" x2="450" y2="450" stroke={ATLAS_COLORS.neutral} strokeWidth="1.6" strokeDasharray="3 4" opacity="0.4" />
            {atlasOrgan({ id: "liver",  cx: 360, cy: 475, w: 130, h: 60, label: "Liver",  fill: ATLAS_COLORS.erythroid, dim: ATLAS_COLORS.erythroidDim, onLabelClick, activeLabelId, pulsing: pulsing("liver") })}
            {atlasOrgan({ id: "spleen", cx: 540, cy: 475, w: 110, h: 60, label: "Spleen", fill: ATLAS_COLORS.lymphoid,  dim: ATLAS_COLORS.lymphoidDim,  onLabelClick, activeLabelId, pulsing: pulsing("spleen") })}
          </g>
        </svg>
      );
    },
  },
  /* =========================================================
     HAEMATOPOIESIS — myeloid drill-down
     ========================================================= */
  "hem:haematopoiesis-myeloid": {
    id: "hem:haematopoiesis-myeloid",
    type: "diagram",
    title: "Myeloid Lineage",
    topic: null,
    parent: "hem:haematopoiesis",
    summary: "The myeloid lineage is one of the two main branches that come off the haematopoietic stem cell. It is the branch that produces everything except the lymphocytes — red cells that carry oxygen, platelets that stop bleeding, and the fast-acting white cells of innate immunity: neutrophils, eosinophils, basophils and monocytes. Each of those final cell types is committed to at a specific progenitor stage, and each one is driven by its own growth factor. The myeloid branch is where most of the clinically important blood-cell maturation detail lives, because most acquired blood diseases — anaemias, leukaemias, clotting disorders — show up here first.",
    labels: [
      { id: "cmp", name: "Common Myeloid Progenitor", desc: "The trunk of this branch — gives rise to the granulocyte-monocyte line and the megakaryocyte-erythroid line." },
      { id: "gmp", name: "Granulocyte-Monocyte Progenitor", desc: "Commits to neutrophils, eosinophils, basophils and monocytes — the phagocytic and inflammatory cells of innate immunity." },
      { id: "mep", name: "Megakaryocyte-Erythroid Progenitor", desc: "Commits to platelets and red cells. Tap the open-arrow to see red cell maturation in full detail.", drillTo: "hem:haematopoiesis-erythroid" },
      { id: "gran", name: "Granulocytes", desc: "Neutrophils, eosinophils and basophils — short-lived, first-responder white cells." },
      { id: "mono", name: "Monocytes", desc: "Circulate, then migrate into tissue and become macrophages or dendritic cells." },
      { id: "mega", name: "Megakaryocytes → Platelets", desc: "A single megakaryocyte fragments its cytoplasm into thousands of platelets, essential for clotting." },
    ],
    narration: [
      "This is the myeloid branch, opened up from the common myeloid progenitor.",
      "The CMP splits into two further progenitors — the granulocyte-monocyte progenitor, and the megakaryocyte-erythroid progenitor.",
      "The granulocyte-monocyte progenitor is the trunk for neutrophils, eosinophils, basophils and monocytes.",
      "These are the fast-responding cells of innate immunity — first on the scene at infection or injury.",
      "The megakaryocyte-erythroid progenitor splits again into the platelet line and the red cell line.",
      "A single megakaryocyte fragments its own cytoplasm into thousands of platelets, released straight into the blood.",
      "The red cell line is where most of the clinically important maturation detail lives.",
      "G-CSF drives the granulocyte line; thrombopoietin drives the megakaryocyte line; EPO drives the red cell line.",
      "Each growth factor acts at a specific commitment point, and a deficiency in any of them produces a recognisable blood picture.",
      "Tap the megakaryocyte-erythroid progenitor now to open the red cell maturation sequence.",
    ],
    stepFocus: [
      ["cmp"], ["cmp", "gmp", "mep"], ["gmp"], ["gran", "mono"], ["mep"], ["mega"], ["mep"], ["gmp", "mep"], ["gmp", "mep"], ["mep"],
    ],
    viewBox: "0 0 900 380",
    render: ({ onLabelClick, activeLabelId, activeStep, preview }) => {
      const focus = DIAGRAMS["hem:haematopoiesis-myeloid"].stepFocus[activeStep] || [];
      const pulsing = (id) => !preview && focus.includes(id);

      // Cell positions — chosen so the flow reads top-to-bottom without
      // the connecting lines overlapping any of the labels. The r values
      // shrink slightly as you descend the tree, mirroring how committed
      // progenitors are visibly smaller than their parent cell.
      const cmpC  = { cx: 450, cy: 70  };
      const gmpC  = { cx: 260, cy: 190 };
      const mepC  = { cx: 640, cy: 190 };
      const granC = { cx: 130, cy: 320 };
      const monoC = { cx: 290, cy: 320 };
      const megaC = { cx: 640, cy: 320 };

      return (
        <svg viewBox="0 0 900 380" width="100%" height="100%">
          {/* Connector lines — same four branches as before, now drawn
              from the bottom of each parent cell to the top of each
              child cell so the flow direction is unambiguous. */}
          {atlasLine(cmpC.cx,  cmpC.cy  + 40, gmpC.cx,  gmpC.cy  - 40)}
          {atlasLine(cmpC.cx,  cmpC.cy  + 40, mepC.cx,  mepC.cy  - 40)}
          {atlasLine(gmpC.cx,  gmpC.cy  + 40, granC.cx, granC.cy - 40)}
          {atlasLine(gmpC.cx,  gmpC.cy  + 40, monoC.cx, monoC.cy - 40)}
          {atlasLine(mepC.cx,  mepC.cy  + 40, megaC.cx, megaC.cy - 40)}

          {/* CMP — the trunk progenitor, amber. */}
          {atlasProgenitor({
            id: "cmp", cx: cmpC.cx, cy: cmpC.cy, r: 40, lineage: "trunk",
            label: "CMP", sub: "common myeloid progenitor",
            onLabelClick, activeLabelId, pulsing: pulsing("cmp"), preview,
          })}

          {/* GMP — granulocyte-monocyte branch, still amber (myeloid trunk). */}
          {atlasProgenitor({
            id: "gmp", cx: gmpC.cx, cy: gmpC.cy, r: 38, lineage: "trunk",
            label: "GMP", sub: "granulocyte-monocyte",
            onLabelClick, activeLabelId, pulsing: pulsing("gmp"), preview,
          })}

          {/* MEP — megakaryocyte-erythroid branch, crimson. Has the
              drill-down indicator because it opens the erythroid child. */}
          {atlasProgenitor({
            id: "mep", cx: mepC.cx, cy: mepC.cy, r: 38, lineage: "erythroid",
            label: "MEP", sub: "megakaryocyte-erythroid",
            onLabelClick, activeLabelId, pulsing: pulsing("mep"),
            onOpenDrill: true, preview,
          })}

          {/* Granulocytes — real lobed-nucleus white cells, not a box.
              Three of them clustered, matching how they'd appear on a film. */}
          <g onClick={preview ? undefined : () => onLabelClick("gran")} style={{ cursor: preview ? "default" : "pointer" }} className={pulsing("gran") ? "atlas-pulse" : ""}>
            {atlasWhiteCell({ cx: granC.cx - 20, cy: granC.cy - 4,  r: 15 })}
            {atlasWhiteCell({ cx: granC.cx + 16, cy: granC.cy - 10, r: 14 })}
            {atlasWhiteCell({ cx: granC.cx - 2,  cy: granC.cy + 14, r: 14 })}
            <text x={granC.cx} y={granC.cy + 42} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Granulocytes</text>
            <text x={granC.cx} y={granC.cy + 55} textAnchor="middle" fontSize="9" fill="var(--text-2)">neutrophils, eosinophils, basophils</text>
          </g>

          {/* Monocytes — larger single mononuclear cell, no lobed nucleus
              (that's what distinguishes it from a granulocyte). */}
          <g onClick={preview ? undefined : () => onLabelClick("mono")} style={{ cursor: preview ? "default" : "pointer" }} className={pulsing("mono") ? "atlas-pulse" : ""}>
            <circle cx={monoC.cx} cy={monoC.cy} r="22" fill="#F8F4EE" stroke={ATLAS_COLORS.trunk} strokeWidth="1.6" filter="url(#atlas-shadow)" />
            {/* Kidney-shaped nucleus — the monocyte's defining morphology. */}
            <path
              d={`M${monoC.cx - 10},${monoC.cy - 8}
                  Q${monoC.cx + 4},${monoC.cy - 14} ${monoC.cx + 12},${monoC.cy - 2}
                  Q${monoC.cx + 6},${monoC.cy + 12} ${monoC.cx - 6},${monoC.cy + 10}
                  Q${monoC.cx - 14},${monoC.cy + 2} ${monoC.cx - 10},${monoC.cy - 8} Z`}
              fill={ATLAS_COLORS.nucleus} opacity="0.78"
            />
            <text x={monoC.cx} y={monoC.cy + 42} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Monocytes</text>
            <text x={monoC.cx} y={monoC.cy + 55} textAnchor="middle" fontSize="9" fill="var(--text-2)">become macrophages in tissue</text>
          </g>

          {/* Megakaryocytes → Platelets — a large multinucleate cell with
              platelets visibly budding off its edge, so the fragmentation
              is shown happening, not just described in the sub-label. */}
          <g onClick={preview ? undefined : () => onLabelClick("mega")} style={{ cursor: preview ? "default" : "pointer" }} className={pulsing("mega") ? "atlas-pulse" : ""}>
            {/* Megakaryocyte body — large, crimson, with several nuclei. */}
            <circle cx={megaC.cx} cy={megaC.cy} r="30" fill="url(#atlas-grad-erythroid)" stroke="#8C1C12" strokeWidth="1.6" filter="url(#atlas-shadow)" />
            {[[-8, -6], [6, -8], [0, 6], [10, 4], [-10, 8]].map(([dx, dy], i) => (
              <circle key={i} cx={megaC.cx + dx} cy={megaC.cy + dy} r="4.5" fill="#5B21B6" opacity="0.75" />
            ))}
            {/* Platelets budding off the edge — three on the right side,
                each with a short trailing line suggesting separation. */}
            {[[36, -10], [42, 4], [36, 18]].map(([dx, dy], i) => (
              <g key={i}>
                <line x1={megaC.cx + 28} y1={megaC.cy + dy * 0.5} x2={megaC.cx + dx - 2} y2={megaC.cy + dy} stroke={ATLAS_COLORS.trunk} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
                <ellipse cx={megaC.cx + dx} cy={megaC.cy + dy} rx="5" ry="3.5" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.6" />
              </g>
            ))}
            <text x={megaC.cx} y={megaC.cy + 50} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Megakaryocytes</text>
            <text x={megaC.cx} y={megaC.cy + 63} textAnchor="middle" fontSize="9" fill="var(--text-2)">fragment into platelets</text>
          </g>
        </svg>
      );
    },
  },

  /* =========================================================
     HAEMATOPOIESIS — erythroid drill-down (deepest level)
     ========================================================= */
  "hem:haematopoiesis-erythroid": {
    id: "hem:haematopoiesis-erythroid",
    type: "diagram",
    title: "Erythroid Maturation",
    topic: null,
    parent: "hem:haematopoiesis-myeloid",
    summary: "Erythroid maturation is the six-stage sequence a red cell precursor goes through before it becomes a mature red cell ready to carry oxygen. It starts with the proerythroblast — a large cell with a big nucleus and ribosome-rich blue cytoplasm — and ends with the biconcave, anucleate red cell that circulates for about 120 days. Along the way the cell packs itself full of haemoglobin, its nucleus shrinks and eventually gets extruded, and the cytoplasm shifts from blue to pink as the ribosomes are replaced by haemoglobin. The whole sequence takes about a week, and it is driven by erythropoietin (EPO), the hormone the kidney releases in response to low oxygen.",
    labels: [
      { id: "s1", name: "Proerythroblast", desc: "The first morphologically recognisable red cell precursor. Large nucleus, deeply basophilic cytoplasm." },
      { id: "s2", name: "Basophilic Normoblast", desc: "Cytoplasm still strongly basophilic (ribosome-rich); nucleus begins condensing." },
      { id: "s3", name: "Polychromatophilic Normoblast", desc: "Cytoplasm takes on a mixed blue-pink colour as haemoglobin accumulates alongside remaining ribosomes." },
      { id: "s4", name: "Orthochromatic Normoblast", desc: "Nucleus fully condensed and pyknotic; cytoplasm now mostly pink/eosinophilic from haemoglobin." },
      { id: "s5", name: "Reticulocyte", desc: "Nucleus has been extruded. Residual RNA still visible with supravital stains. Circulates 1-2 days before full maturation." },
      { id: "s6", name: "Mature Red Cell", desc: "Biconcave, anucleate, ~120 day lifespan, fully loaded with haemoglobin for oxygen transport." },
      { id: "epo", name: "Erythropoietin (EPO)", desc: "Produced by the kidney in response to hypoxia. Drives proliferation and survival of the later erythroid precursors." },
    ],
    narration: [
      "This is the full erythroid maturation sequence — six stages, left to right.",
      "It begins with the proerythroblast — large nucleus, deep blue cytoplasm, packed with ribosomes for protein synthesis.",
      "The basophilic normoblast follows — still strongly blue, the nucleus beginning to condense.",
      "The polychromatophilic normoblast shows a mixed colour — haemoglobin is accumulating alongside the remaining ribosomes.",
      "The orthochromatic normoblast is mostly pink now — the nucleus is fully condensed and about to be extruded.",
      "The cell then ejects its nucleus entirely, becoming a reticulocyte — anucleate, with residual RNA still visible on special stains.",
      "Erythropoietin, made by the kidney in response to low oxygen, acts on these later stages to drive their survival and proliferation.",
      "After one to two days circulating, the reticulocyte loses its remaining RNA and becomes a fully mature red cell.",
      "The mature red cell is biconcave, anucleate, and will circulate for around 120 days.",
      "This whole sequence — proerythroblast to mature red cell — takes about a week in a healthy bone marrow.",
    ],
    stepFocus: [
      [], ["s1"], ["s2"], ["s3"], ["s4"], ["s5"], ["epo", "s4", "s5"], ["s5"], ["s6"], ["s1", "s2", "s3", "s4", "s5", "s6"],
    ],
    viewBox: "0 0 900 260",
    render: ({ onLabelClick, activeLabelId, activeStep, preview }) => {
      const focus = DIAGRAMS["hem:haematopoiesis-erythroid"].stepFocus[activeStep] || [];
      const pulsing = (id) => !preview && focus.includes(id);
      const stages = [
        { id: "s1", label: "Proerythroblast",      sub: "large nucleus, blue cytoplasm" },
        { id: "s2", label: "Basophilic",           sub: "nucleus condensing" },
        { id: "s3", label: "Polychromatophilic",   sub: "haemoglobin appearing" },
        { id: "s4", label: "Orthochromatic",       sub: "nucleus pyknotic" },
        { id: "s5", label: "Reticulocyte",         sub: "nucleus extruded, RNA left" },
        { id: "s6", label: "Mature RBC",           sub: "biconcave, no nucleus" },
      ];
      // Each cell is r=34 with 100px horizontal spacing, so the visible
      // gap between adjacent cells is ~32px — enough that the growing
      // cytoplasm colours read as separate cells, not a smear.
      const r = 34, gap = 100, startX = 95, cy = 145;
      return (
        <svg viewBox="0 0 900 260" width="100%" height="100%">
          {/* Flow arrows between consecutive stages, drawn as short
              dashed strokes with an arrowhead — showing this is a
              sequence, not six unrelated cells. */}
          {stages.slice(0, -1).map((_, i) => {
            const x1 = startX + i * gap + r + 6;
            const x2 = startX + (i + 1) * gap - r - 6;
            return atlasFlowArrow({ x1, y1: cy, x2, y2: cy, color: ATLAS_COLORS.trunk });
          })}

          {/* EPO acts on the later stages, so it sits above stages 4-6
              with a bracket-style leader rather than a single dot. */}
          <g>
            <path
              d={`M${startX + 3 * gap},50 Q${startX + 4.5 * gap},50 ${startX + 5 * gap},${cy - r - 20}`}
              fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5"
              strokeDasharray="4 4" opacity="0.7"
            />
            <circle cx={startX + 5 * gap} cy={cy - r - 20} r="3.5" fill={ATLAS_COLORS.trunk} />
            <circle cx={startX + 3 * gap} cy="50" r="3.5" fill={ATLAS_COLORS.trunk} />
            <circle cx={startX + 4 * gap} cy="50" r="3.5" fill={ATLAS_COLORS.trunk} />
            <text x={startX + 3 * gap} y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill={ATLAS_COLORS.trunk}>EPO</text>
            <text x={startX + 3 * gap} y="20" textAnchor="middle" fontSize="9" fill="var(--text-2)">drives the later stages</text>
          </g>

          {stages.map((s, i) => atlasErythroidStage({
            id: s.id,
            cx: startX + i * gap,
            cy,
            r,
            stage: i + 1,
            label: s.label,
            sub: s.sub,
            onLabelClick, activeLabelId,
            pulsing: pulsing(s.id),
            preview,
          }))}
        </svg>
      );
    },
  },

    /* =========================================================
     CARDIOVASCULAR SYSTEM — the topic's full 10-step overview.
     Topic: Physiology II (ph2), Topic 02 (index 1).

     This is the topic's PRIMARY diagram. It walks through all
     10 steps of the topic note in order. The Cardiac Cycle
     entry below is now a drill-down child of this one - tapping
     the heart here opens the detailed beat animation.
     ========================================================= */
  "ph2:cardiovascular-system": {
    id: "ph2:cardiovascular-system",
    type: "diagram",
    title: "The Cardiovascular System — Every Step, Illustrated",
    topic: { courseId: "ph2", topicIndex: 1 },
    parent: null,
    summary: "Your body has to move oxygen, food and hormones to every cell, and carry waste away from them. It does this with three things working together: a pump (the heart), a set of pipes (the blood vessels), and a fluid that carries the cargo (the blood). Blood also has to stop itself from leaking when a vessel is cut, and a separate network of vessels - the lymphatics - collects the fluid that leaks out and returns it to the blood.",
    labels: [
      { id: "system", name: "The Whole System", desc: "Heart, vessels and blood - working together as one transport network." },
      { id: "blood", name: "Blood", desc: "Red cells carry oxygen, white cells defend the body, platelets stop bleeding. Plasma is the liquid they float in." },
      { id: "hemostasis", name: "Hemostasis", desc: "When a vessel is cut, the vessel tightens, platelets plug the hole, and fibrin locks the plug in place." },
      { id: "heart", name: "The Heart", desc: "Four chambers, four valves. Right side sends blood to the lungs; left side sends blood to the body. Tap to open the detailed cardiac cycle.", drillTo: "ph2:cardiac-cycle" },
      { id: "conduction", name: "Electrical System", desc: "The SA node starts each beat, the AV node delays the signal, then it spreads down the bundle branches and Purkinje fibres to make the ventricles contract together." },
      { id: "cycle", name: "The Cardiac Cycle", desc: "One heartbeat: the heart fills (diastole), then squeezes (systole), pushing blood out to the lungs and the body." },
      { id: "flow", name: "Blood Flow", desc: "Blood flows because of a pressure difference. Wider vessels allow more flow - a small change in width makes a big difference." },
      { id: "bp", name: "Blood Pressure Control", desc: "The brain, kidneys and adrenal glands work together to keep blood pressure in a narrow, safe range." },
      { id: "lymph", name: "Lymphatic System", desc: "Collects the fluid that leaks out of capillaries and returns it to the blood. Also filters it in lymph nodes and helps fight infection." },
      { id: "whole", name: "The Whole Picture", desc: "Everything you just saw, working as one system." },
    ],
    narration: [
      "Every cell in your body needs a constant supply of oxygen and food, and every cell produces waste. The cardiovascular system is the transport network that delivers the fuel and clears the waste. It's made of three parts working together: the heart, the blood vessels and the blood.",
      "The blood is the fluid that carries everything. About forty-five per cent of it is cells - red cells that carry oxygen, white cells that fight infection, and platelets that stop bleeding. The other fifty-five per cent is plasma - water, proteins, electrolytes, nutrients and waste products.",
      "When a vessel is cut, the body has to stop the leak fast. First the vessel tightens to slow the flow. Then platelets rush to the injury and stick together to form a plug. Finally, a protein called fibrin is woven through the plug like a mesh, locking it in place until the vessel heals.",
      "The heart is the pump. It sits between the lungs and has four chambers and four valves. The right side receives used blood from the body and pushes it to the lungs to get fresh oxygen. The left side receives that freshly-oxygenated blood and pumps it out to the whole body.",
      "The heart has its own electrical system that tells it when to beat. The SA node is the natural pacemaker - it fires first. The signal then travels to the AV node, which holds it back for a split second so the top chambers can finish emptying. Then the signal races down through the bundle branches and the Purkinje fibres, making the bottom chambers squeeze together at the same time.",
      "One heartbeat is one cardiac cycle. The heart first relaxes and fills with blood - that's diastole. Then it contracts and pushes the blood out - that's systole. The amount pushed out per beat is the stroke volume, and the amount per minute is the cardiac output. At rest, that's around five litres every minute.",
      "Blood flows through your vessels because of a pressure difference - high pressure at one end, lower at the other. Flow is also affected by how wide the vessel is. If a vessel narrows just a little, flow drops a lot, because resistance goes up by the fourth power of the radius. That's why even a small narrowing in an artery can cause real problems.",
      "Your blood pressure has to stay in a narrow range - too low and tissues don't get enough blood, too high and vessels get damaged over time. The brain reacts within seconds through the nerves, telling the heart to speed up or slow down and the vessels to tighten or widen. The kidneys and adrenal glands react more slowly through hormones like renin-angiotensin and aldosterone, adjusting blood volume and vessel tone over hours to days.",
      "Not all the fluid that leaves your capillaries gets reabsorbed. About two to four litres a day leaks into the tissues and has to be collected and returned. That's the job of the lymphatic system - a network of vessels and nodes that returns the fluid to the blood and filters it along the way, catching bacteria and other threats.",
      "Putting it all together: the heart pumps, the vessels direct the flow, the blood carries the cargo, the pressure is kept steady, and the lymphatics return the fluid. Each part depends on the others, and when any one fails, the whole system struggles.",
    ],
    stepFocus: [
      ["system"],
      ["blood"],
      ["hemostasis"],
      ["heart"],
      ["conduction"],
      ["cycle"],
      ["flow"],
      ["bp"],
      ["lymph"],
      ["whole"],
    ],
    viewBox: "0 0 900 620",
        render: ({ onLabelClick, activeLabelId, activeStep = 0, onOpenDrill, preview }) => {
      const diagram = DIAGRAMS["ph2:cardiovascular-system"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      // Nothing dims - every structure stays fully visible at all times.
      // Only the structure currently being discussed gets an amber glow.
      const isHot = (id) => inFocus(id) && activeStep !== 9;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          

          {/* Lungs */}
          <g style={{ cursor: cur }} onClick={click("system")} filter={hotFilter("system")}>
            {atlasLungs({ cx: 450, cy: 90, scale: 1, highlight: false })}
          </g>

                    {/* Pulmonary vessels - pulmonary artery (blue, heart→lungs) and
              pulmonary veins (red, lungs→heart). Drawn with the atlasVessel
              primitive so the tube has a visible wall and a lumen that the
              blood cells travel through. */}
          <g filter={hotFilter("system")}>
            {atlasVessel({ d: "M395,220 Q380,160 420,120", oxygenated: false, width: 14 })}
            {atlasVessel({ d: "M505,220 Q520,160 480,120", oxygenated: true, width: 14 })}
            {atlasBloodCell({ cx: 408, cy: 170, r: 4, oxygenated: false, animate: true, delay: "0s" })}
            {atlasBloodCell({ cx: 492, cy: 170, r: 4, oxygenated: true,  animate: true, delay: "1s" })}
          </g>

                    {/* Systemic vessels - aorta (red, heart→body) on the right and
              vena cava (blue, body→heart) on the left. Same vessel primitive
              as the pulmonary vessels, so all four tubes share one visual
              language. */}
          <g filter={hotFilter("system")}>
            {atlasVessel({ d: "M560,300 Q640,400 620,520", oxygenated: true, width: 14 })}
            {atlasVessel({ d: "M340,300 Q260,400 280,520", oxygenated: false, width: 14 })}
            {atlasBloodCell({ cx: 610, cy: 440, r: 4, oxygenated: true,  animate: true, delay: "0.5s" })}
            {atlasBloodCell({ cx: 292, cy: 440, r: 4, oxygenated: false, animate: true, delay: "1.5s" })}
          </g>

          {/* Body region */}
          <g style={{ cursor: cur }} onClick={click("bp")} filter={hotFilter("bp")}>
            <rect x="250" y="530" width="400" height="60" rx="14" fill="#F5B93F" opacity="0.35" stroke="#D89B14" strokeWidth="1.5" />
            <text x="450" y="566" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">Whole body · tissues</text>
          </g>

          {/* Heart */}
          <g style={{ cursor: cur }} onClick={click("heart")}
             filter={(isHot("heart") || isHot("cycle") || isHot("conduction")) ? "url(#atlas-glow)" : undefined}>
            {atlasHeart({
              cx: 450, cy: 320, scale: 1,
              highlight: false,
              onDrill: onOpenDrill,
            })}
            <circle cx="450" cy="320" r="115" fill="none" {...ring("heart")} pointerEvents="none" />
          </g>

          {/* Conduction overlay */}
          {inFocus("conduction") && (
            <g opacity="0.95" pointerEvents="none" filter="url(#atlas-glow)">
              {atlasConductionPath({ cx: 450, cy: 320, scale: 1 })}
            </g>
          )}

          {/* Blood overlay */}
          {inFocus("blood") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              {atlasBloodCell({ cx: 400, cy: 280, r: 6, oxygenated: true,  label: "RBC" })}
              {atlasWhiteCell({ cx: 500, cy: 280, r: 6, label: "WBC" })}
              {atlasPlatelet({ cx: 450, cy: 380, r: 4, label: "Plt" })}
            </g>
          )}

                    {/* Hemostasis inset - a callout box connected by a leader line to
              the systemic vessel, showing what's happening at a wound site
              on the same vessel blood is flowing through. */}
          {inFocus("hemostasis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              {/* Leader line from the inset up to the systemic vessel */}
              <path
                d="M150,270 Q180,240 250,220 Q290,215 300,240"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="300" cy="240" r="4" fill={ATLAS_COLORS.trunk} />
              {/* Callout box with rounded corners */}
              <rect x="70" y="270" width="160" height="130" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="150" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>VESSEL INJURY</text>
                            <text x="150" y="305" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">platelet plug + fibrin mesh</text>
              {/* Damaged vessel segment */}
              <line x1="90" y1="340" x2="210" y2="340" stroke="#8C1C12" strokeWidth="16" strokeLinecap="round" />
              <line x1="90" y1="340" x2="210" y2="340" stroke="url(#atlas-grad-erythroid)" strokeWidth="13" strokeLinecap="round" />
              {/* The wound - a small gap with platelets converging */}
              <line x1="150" y1="332" x2="150" y2="348" stroke="var(--bg-2)" strokeWidth="6" />
              {atlasPlatelet({ cx: 138, cy: 344, r: 5 })}
              {atlasPlatelet({ cx: 150, cy: 346, r: 5 })}
              {atlasPlatelet({ cx: 162, cy: 344, r: 5 })}
              {/* Fibrin mesh - thin criss-crossing threads over the plug */}
              <path d="M140,340 L160,352 M140,352 L160,340" stroke={ATLAS_COLORS.trunk} strokeWidth="1" opacity="0.8" />
              {/* Platelet plug arrow */}
              {atlasFlowArrow({ x1: 150, y1: 358, x2: 150, y2: 380, color: ATLAS_COLORS.trunk })}
              <text x="150" y="393" textAnchor="middle" fontSize="9" fill="var(--text-2)">plug seals the wound</text>
            </g>
          )}

                    {/* Flow inset - connected by a leader line to the aorta, showing
              the pressure gradient that drives flow through the same vessel
              the student is already looking at. */}
          {inFocus("flow") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              {/* Leader line from the inset leftward to the systemic vessel */}
              <path
                d="M670,330 Q640,340 620,380 Q615,400 620,440"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="620" cy="440" r="4" fill={ATLAS_COLORS.trunk} />
              {/* Callout box */}
              <rect x="670" y="270" width="180" height="130" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="760" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>FLOW · PRESSURE</text>
                            <text x="760" y="305" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">flow = ΔP ÷ resistance</text>
              {/* Vessel segment showing the pressure gradient */}
              <path d="M690,340 L830,340" stroke="#8C1C12" strokeWidth="16" strokeLinecap="round" />
              <path d="M690,340 L830,340" stroke="url(#atlas-grad-erythroid)" strokeWidth="13" strokeLinecap="round" />
              {atlasFlowArrow({ x1: 700, y1: 358, x2: 820, y2: 358, color: "#E53935" })}
              <text x="690" y="380" textAnchor="middle" fontSize="9" fill="var(--text-2)">high P</text>
              <text x="830" y="380" textAnchor="middle" fontSize="9" fill="var(--text-2)">lower P</text>
            </g>
          )}

                    {/* BP overlay - three small callouts showing what regulates blood
              pressure, positioned around the body outline: brain above,
              kidneys on the side, adrenal nearby. Leader lines connect each
              to the body region the student is looking at. */}
          {inFocus("bp") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              {/* Brain callout - top */}
              <path d="M450,435 L450,480" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
              <circle cx="450" cy="435" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="380" y="480" width="140" height="32" rx="10" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" />
              <text x="450" y="500" textAnchor="middle" fontSize="10" fill={ATLAS_COLORS.trunk} fontWeight="700">Brain · nerves</text>

              {/* Kidney callout - left side */}
              <path d="M250,560 Q220,540 210,500 Q205,480 210,460" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
              <circle cx="250" cy="560" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="150" y="420" width="120" height="40" rx="10" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" />
              <text x="210" y="438" textAnchor="middle" fontSize="10" fill={ATLAS_COLORS.trunk} fontWeight="700">Kidneys</text>
                            <text x="210" y="450" textAnchor="middle" fontSize="8" fill="var(--text-2)">renin · aldosterone</text>
              {/* Adrenal callout - right side */}
              <path d="M650,560 Q680,540 690,500 Q695,480 690,460" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
              <circle cx="650" cy="560" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="640" y="420" width="120" height="40" rx="10" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" />
              <text x="700" y="438" textAnchor="middle" fontSize="10" fill={ATLAS_COLORS.trunk} fontWeight="700">Adrenal</text>
                            <text x="700" y="450" textAnchor="middle" fontSize="8" fill="var(--text-2)">adrenaline</text>
            </g>
          )}

                    {/* Lymphatic overlay - lymph vessels are thinner than blood
              vessels and drawn dashed, matching real anatomical illustrations
              where lymphatics are distinguished from veins visually. */}
          {inFocus("lymph") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              {atlasVessel({ d: "M320,300 Q220,330 200,420 Q210,510 250,540", oxygenated: false, width: 8, dashed: true })}
              {atlasLymphNode({ cx: 240, cy: 380 })}
              {atlasLymphNode({ cx: 215, cy: 460 })}
              <text x="150" y="500" fontSize="10.5" fill="#2D7BFF" fontWeight="700">lymph → blood</text>
            </g>
          )}

          {/* Static region labels */}
                    <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Lungs</text>
          <text x="450" y="614" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Body</text>
          <text x="120" y="220" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Blood</text>
          <text x="800" y="220" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Hemostasis</text>
          <text x="805" y="470" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Flow · BP</text>
          <text x="120" y="570" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Lymphatics</text>
        </svg>
      );
    },
  },

  /* =========================================================
     CARDIAC CYCLE — drill-down child of the Cardiovascular
     System diagram above. Opens when the student taps the
     heart on the parent diagram.
     ========================================================= */
  "ph2:cardiac-cycle": {
    id: "ph2:cardiac-cycle",
    type: "diagram",
    title: "The Cardiac Cycle — One Heartbeat, Seven Phases",
    topic: null,
    parent: "ph2:cardiovascular-system",
    loop: true,
    summary: "Every heartbeat follows the same simple pattern: the top chambers fill and squeeze first, then the bottom chambers squeeze harder to push blood out to the lungs and the rest of the body, then the whole heart relaxes and refills before doing it again. The two sounds you hear through a stethoscope, 'lub' and 'dub', are just the heart's valves slamming shut at the two key moments in that cycle.",
    labels: [
      { id: "ra", name: "Right Atrium", desc: "Receives deoxygenated blood from the vena cavae and tops off the right ventricle during atrial systole." },
      { id: "la", name: "Left Atrium", desc: "Receives oxygenated blood from the pulmonary veins and tops off the left ventricle during atrial systole." },
      { id: "rv", name: "Right Ventricle", desc: "Pumps deoxygenated blood into the pulmonary artery toward the lungs — thinner wall, lower-pressure circuit." },
      { id: "lv", name: "Left Ventricle", desc: "Pumps oxygenated blood into the aorta toward the body — thickest chamber wall, generates systemic pressure." },
      { id: "av", name: "A-V Valves (Tricuspid + Mitral)", desc: "Separate atria from ventricles. Open during filling, snap shut at the start of ventricular contraction — that closure is heart sound S1." },
      { id: "sl", name: "Semilunar Valves (Pulmonic + Aortic)", desc: "Separate ventricles from their great arteries. Open during ejection, snap shut as ventricles relax — that closure is heart sound S2." },
      { id: "svc", name: "Vena Cavae", desc: "Superior and inferior vena cava deliver deoxygenated blood from the body into the right atrium." },
      { id: "pa", name: "Pulmonary Artery", desc: "Carries deoxygenated blood from the right ventricle to the lungs — the only artery carrying deoxygenated blood." },
      { id: "pveins", name: "Pulmonary Veins", desc: "Carry freshly oxygenated blood from the lungs into the left atrium — the only veins carrying oxygenated blood." },
      { id: "aorta", name: "Aorta", desc: "Carries oxygenated blood from the left ventricle to the systemic circulation." },
    ],
    narration: [
      "Phase one. The atria contract - squeezing the top two chambers of the heart - pushing the last bit of blood down through the open valves to completely fill the ventricles below.",
      "Phase two. Now the ventricles contract. Pressure inside them shoots up so fast that it slams the valves above them shut - that sudden shut is the first heart sound you hear, 'lub'. For this brief moment every valve in the heart is closed at once, so no blood is moving in or out - the chambers are sealed, like a fist clenching before it swings.",
      "Phase three. Pressure inside the ventricles has now built up past the pressure in the big arteries leaving the heart, so the outlet valves are forced open and blood surges out fast. This is where most of each heartbeat's blood actually leaves the heart.",
      "Phase four. Blood is still leaving, but the ventricles are starting to relax, so it flows out more gently now instead of surging.",
      "Phase five. Ventricular pressure has now dropped below the pressure in those big arteries, so the outlet valves snap shut to stop blood flowing backward - that's the second heart sound, 'dub'. Every valve is closed again, nothing is moving, and pressure inside the heart is falling fast.",
      "Phase six. Once pressure inside the ventricles drops low enough, the valves above them swing open and blood rushes in on its own, no squeezing needed yet. Most of the heart's filling actually happens right here, before the atria even contract again.",
      "Phase seven. Filling slows to a trickle as the pressure inside the heart and the pressure feeding it even out. This is the heart's brief rest before the next beat starts the whole cycle over.",
    ],
        phaseState: [
      { av: "open",   sl: "closed", ra: 1,    la: 1,    rv: 0.55, lv: 0.55 },
      { av: "closed", sl: "closed", ra: 0.3,  la: 0.3,  rv: 0.85, lv: 0.85 },
      { av: "closed", sl: "open",   ra: 0.3,  la: 0.3,  rv: 0.55, lv: 0.55 },
      { av: "closed", sl: "open",   ra: 0.3,  la: 0.3,  rv: 0.4,  lv: 0.4  },
      { av: "closed", sl: "closed", ra: 0.4,  la: 0.4,  rv: 0.4,  lv: 0.4  },
      { av: "open",   sl: "closed", ra: 0.6,  la: 0.6,  rv: 0.75, lv: 0.75 },
      { av: "open",   sl: "closed", ra: 0.75, la: 0.75, rv: 0.85, lv: 0.85 },
    ],
    // render() here actually drives its highlighting off phaseState, not
    // stepFocus - but DiagramViewer's dev-check (and the generic pulsing
    // path every other diagram uses) expects every diagram to have one,
    // same length as narration. Missing this entirely was the crash.
    stepFocus: [
      ["ra", "la", "av"],
      ["av"],
      ["sl", "lv", "rv"],
      ["sl"],
      ["sl"],
      ["av"],
      ["ra", "la"],
    ],
    viewBox: "0 0 900 560",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:cardiac-cycle"];
      const s = diagram.phaseState[activeStep] || diagram.phaseState[0];
      const active = (id) => activeLabelId === id;
      const ring = (id) => (active(id)
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3 }
        : { stroke: "transparent", strokeWidth: 0 });
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";

      return (
        <svg viewBox="0 0 900 560" width="100%" height="100%">
          
          <path d="M560,60 Q600,40 630,100 L630,170 Q600,160 560,160 Z"
            fill="url(#atlas-grad-lymphoid)" opacity="0.6" {...ring("svc")} style={{ cursor: cur }} onClick={click("svc")} />
          <path d="M560,170 Q520,100 460,70 L460,140 Q520,160 560,230 Z"
            fill="url(#atlas-grad-lymphoid)" opacity={s.sl === "open" ? 0.9 : 0.5} {...ring("pa")} style={{ cursor: cur }} onClick={click("pa")} />
          <path d="M340,60 Q300,40 270,100 L270,170 Q300,160 340,160 Z"
            fill="url(#atlas-grad-erythroid)" opacity="0.6" {...ring("pveins")} style={{ cursor: cur }} onClick={click("pveins")} />
          <path d="M340,170 Q380,90 440,60 L440,130 Q390,160 340,230 Z"
            fill="url(#atlas-grad-erythroid)" opacity={s.sl === "open" ? 0.9 : 0.5} {...ring("aorta")} style={{ cursor: cur }} onClick={click("aorta")} />
          <ellipse cx="590" cy="190" rx="95" ry="70" fill="url(#atlas-grad-lymphoid)" opacity={s.ra}
            filter="url(#atlas-shadow)" {...ring("ra")} style={{ cursor: cur }} onClick={click("ra")} />
          <ellipse cx="310" cy="190" rx="95" ry="70" fill="url(#atlas-grad-erythroid)" opacity={s.la}
            filter="url(#atlas-shadow)" {...ring("la")} style={{ cursor: cur }} onClick={click("la")} />
          {atlasValve({ id: "av", x: 590, y: 275, open: s.av === "open", color: ATLAS_COLORS.lymphoid, onLabelClick, activeLabelId, preview })}
          {atlasValve({ id: "av", x: 310, y: 275, open: s.av === "open", flip: true, color: ATLAS_COLORS.erythroid, onLabelClick, activeLabelId, preview })}
          <path d="M470,290 Q470,420 560,480 Q650,460 680,370 Q690,300 630,280 Q550,260 470,290 Z"
            fill="url(#atlas-grad-lymphoid)" opacity={s.rv} filter="url(#atlas-shadow)" {...ring("rv")} style={{ cursor: cur }} onClick={click("rv")} />
          <path d="M430,290 Q430,440 330,510 Q230,470 210,370 Q200,290 270,275 Q360,255 430,290 Z"
            fill="url(#atlas-grad-erythroid)" opacity={s.lv} filter="url(#atlas-shadow)" {...ring("lv")} style={{ cursor: cur }} onClick={click("lv")} />
          <line x1="450" y1="280" x2="450" y2="500" stroke={ATLAS_COLORS.neutral} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          {atlasValve({ id: "sl", x: 560, y: 210, open: s.sl === "open", color: ATLAS_COLORS.lymphoid, onLabelClick, activeLabelId, preview })}
          {atlasValve({ id: "sl", x: 360, y: 210, open: s.sl === "open", flip: true, color: ATLAS_COLORS.erythroid, onLabelClick, activeLabelId, preview })}
          {activeStep === 1 && <text x="450" y="300" textAnchor="middle" fontSize="22" fontWeight="700" fill={ATLAS_COLORS.trunk}>S1</text>}
          {activeStep === 4 && <text x="450" y="300" textAnchor="middle" fontSize="22" fontWeight="700" fill={ATLAS_COLORS.trunk}>S2</text>}
          <text x="590" y="194" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">RA</text>
          <text x="310" y="194" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">LA</text>
          <text x="560" y="400" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">RV</text>
          <text x="320" y="400" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">LV</text>
        </svg>
      );
    },
  },

  /* =========================================================
     LYMPHATIC SYSTEM
     Topic: Physiology II (ph2), Topic 03 (index 2)
     Composes almost entirely from existing primitives - atlasVessel
     (dashed, oxygenated:false, for the lymphatic tubes), atlasLymphNode,
     atlasFlowArrow, atlasWhiteCell, atlasValve - no new primitive needed.
     ========================================================= */
  "ph2:lymphatic-system": {
    id: "ph2:lymphatic-system",
    type: "diagram",
    title: "The Lymphatic System — Drainage and Defence",
    topic: { courseId: "ph2", topicIndex: 2 },
    parent: null,
    summary: "Your lymphatic system has two jobs working at once: it drains the fluid your blood capillaries leave behind in your tissues and returns it to your blood, and along the way it filters that fluid through lymph nodes where immune cells check it for threats. One network, drainage and defence together.",
    labels: [
      { id: "whole", name: "The Whole System", desc: "Draining fluid your tissues don't keep, and watching that fluid for threats along the way - two jobs, one network." },
      { id: "capillary", name: "Blood Capillary", desc: "Lets fluid and small proteins leak into your tissues as blood passes through - a normal, constant process." },
      { id: "interstitial", name: "Interstitial Fluid", desc: "The fluid left behind in your tissues after blood capillaries reabsorb most, but not all, of what leaked out." },
      { id: "lymphcap", name: "Lymphatic Capillary", desc: "A blind-ended tube with overlapping, shingle-like walls that let fluid and large proteins in easily, but not back out." },
      { id: "vessel", name: "Lymph Vessel & Valves", desc: "Carries lymph in one direction only, using valves like your veins. Moved along by your skeletal muscles squeezing as you move - there's no pump here." },
      { id: "node", name: "Lymph Node", desc: "A bean-shaped filtering station packed with immune cells. Lymph passes through and gets checked for bacteria, debris and abnormal cells." },
      { id: "lymphocyte", name: "B & T Lymphocytes", desc: "Immune cells living inside the node that inspect what's flowing through and start your immune response if they find a threat." },
      { id: "duct", name: "Thoracic & Right Lymphatic Ducts", desc: "The two large collecting ducts that empty filtered lymph back into your bloodstream, at large veins near your collarbone." },
    ],
        narration: [
      "Your lymphatic system has two jobs: drain extra fluid out of your tissues and return it to your blood, and do a lot of your immune system's actual work. It's a second, one-way drainage network running alongside your blood vessels.",
      "Your blood capillaries are leaky on purpose. As blood passes through, some fluid and small proteins get pushed out into the space between your cells. This happens everywhere in your body, all the time.",
      "That leaked fluid is called interstitial fluid. Most gets reabsorbed straight back into your blood capillaries. But two to four litres a day gets left behind in your tissues and has to go somewhere.",
      "Lymphatic capillaries handle that. They're tiny, blind-ended tubes next to your blood capillaries. Their walls overlap like loose shingles, letting fluid and even large proteins in easily, but not back out.",
      "Once fluid enters a lymphatic vessel, it's called lymph. These vessels have one-way valves like your veins. There's no pump here - your skeletal muscles squeeze the vessels as you move, pushing lymph along.",
      "Lymph passes through lymph nodes along the way, small bean-shaped filtering stations packed with immune cells. As lymph flows through, the node filters out bacteria, debris and abnormal cells before it continues on.",
      "Those immune cells aren't just filtering. B and T lymphocytes inside the node check what's flowing through for threats. If they recognise something dangerous, your immune response starts right here.",
      "Filtered lymph eventually drains into one of two large ducts, the thoracic duct or the right lymphatic duct, which empty into large veins near your collarbone. The fluid has officially returned to your blood.",
      "When that drainage fails, fluid stays in your tissues and builds up as swelling. This is called oedema. It happens when lymph vessels are blocked, when nodes are removed or scarred, or when the vessels can't pump properly.",
      "Putting it all together: fluid leaks out of your blood capillaries, the lymphatic capillaries pick it up, valved vessels and muscle movement push it along, lymph nodes filter it, and two ducts return it to your blood. When any part of that chain fails, fluid backs up in the tissue instead.",
    ],
    stepFocus: [
      ["whole"],
      ["capillary"],
      ["interstitial"],
      ["lymphcap"],
      ["vessel"],
      ["node"],
      ["lymphocyte"],
      ["duct"],
      ["whole"],
      ["whole"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:lymphatic-system"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const lastStep = diagram.narration.length - 1;
      // Nothing dims - every structure stays visible at every step. Only the
      // structure currently being discussed gets the amber glow, and the
      // final "whole system" step shows everything with no single glow.
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          

          {/* Blood capillary - the leak source */}
          <g style={{ cursor: cur }} onClick={click("capillary")} filter={hotFilter("capillary")}>
            {atlasVessel({ d: "M360,90 Q450,78 540,90", oxygenated: true, width: 10 })}
            {atlasBloodCell({ cx: 450, cy: 85, r: 4, oxygenated: true, animate: true, delay: "0s" })}
          </g>

          {/* Interstitial fluid - a handful of pale straw-colored droplets
              in the tissue space between the blood capillary and the
              lymphatic capillary that's about to pick them up */}
          <g style={{ cursor: cur }} onClick={click("interstitial")} filter={hotFilter("interstitial")}>
            {[[400, 128], [430, 142], [460, 130], [490, 144], [415, 158], [475, 160]].map(([dx, dy], i) => (
              <circle key={i} cx={dx} cy={dy} r="3.2" fill="#FFE38A" opacity="0.85" />
            ))}
            <text x="450" y="185" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">interstitial fluid</text>
          </g>

          {/* Lymphatic capillary - blind-ended, picks the fluid up */}
          <g style={{ cursor: cur }} onClick={click("lymphcap")} filter={hotFilter("lymphcap")}>
            {atlasVessel({ d: "M450,150 Q438,195 450,230", oxygenated: false, dashed: true, width: 8 })}
          </g>

          {/* Main lymph vessel, with a valve, continuing down to the node */}
          <g style={{ cursor: cur }} onClick={click("vessel")} filter={hotFilter("vessel")}>
            {atlasVessel({ d: "M450,230 Q428,270 450,300", oxygenated: false, dashed: true, width: 9 })}
            {atlasValve({ id: "vessel", x: 450, y: 265, open: true, color: ATLAS_COLORS.lymphoid, onLabelClick, activeLabelId, preview })}
          </g>

          {/* Lymph node, with lymphocytes living inside it */}
          <g style={{ cursor: cur }} onClick={click("node")} filter={hotFilter("node")}>
            {atlasLymphNode({ cx: 450, cy: 360, scale: 2.4 })}
          </g>
          <g style={{ cursor: cur }} onClick={click("lymphocyte")} filter={hotFilter("lymphocyte")}>
            {atlasWhiteCell({ cx: 434, cy: 352, r: 6 })}
            {atlasWhiteCell({ cx: 450, cy: 370, r: 6 })}
            {atlasWhiteCell({ cx: 466, cy: 354, r: 6 })}
          </g>

          {/* Vessel continuing out of the node down to the collecting ducts */}
          <g style={{ cursor: cur }} onClick={click("duct")} filter={hotFilter("duct")}>
            {atlasVessel({ d: "M450,420 Q470,490 452,540", oxygenated: false, dashed: true, width: 9 })}
            {atlasFlowArrow({ x1: 452, y1: 540, x2: 452, y2: 558, color: ATLAS_COLORS.lymphoid })}
          </g>

          {/* Venous system - where the ducts empty back into the blood */}
          <g style={{ cursor: cur }} onClick={click("duct")} filter={hotFilter("duct")}>
            <rect x="330" y="558" width="240" height="46" rx="14" fill={ATLAS_COLORS.lymphoid} opacity="0.3" stroke="#123F9E" strokeWidth="1.5" />
            <text x="450" y="586" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">Venous system</text>
          </g>

          {/* Lymphocyte inset - what the immune cells are actually doing
              inside the node, connected by a leader line to the node */}
          {inFocus("lymphocyte") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path d="M490,355 Q560,340 620,330" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
              <circle cx="490" cy="355" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="620" y="265" width="180" height="130" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="710" y="288" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>INSPECTING LYMPH</text>
              {atlasWhiteCell({ cx: 670, cy: 330, r: 14 })}
              {atlasWhiteCell({ cx: 745, cy: 330, r: 14 })}
              <text x="670" y="362" textAnchor="middle" fontSize="9" fill="var(--text-2)">B cell</text>
              <text x="745" y="362" textAnchor="middle" fontSize="9" fill="var(--text-2)">T cell</text>
              <text x="710" y="378" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">checking for threats</text>
            </g>
          )}

          {/* Duct inset - the two named collecting ducts, connected by a
              leader line down to where they empty into the venous system */}
          {inFocus("duct") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path d="M410,575 Q320,565 260,540" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
              <circle cx="410" cy="575" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="80" y="475" width="180" height="90" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="170" y="497" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>TWO COLLECTING DUCTS</text>
              <text x="170" y="517" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">Thoracic duct</text>
              <text x="170" y="533" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">Right lymphatic duct</text>
              <text x="170" y="552" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">both empty near the collarbone</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Tissue</text>
          <text x="450" y="614" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Near the collarbone</text>
        </svg>
      );
    },
  },

  /* =========================================================
     RESPIRATORY PHYSIOLOGY
     Topic: Physiology II (ph2), Topic 01 (index 0).
     The cardio-respiratory family's second diagram. Reuses
     atlasLungs (the most detailed primitive in the file),
     atlasVessel, atlasBloodCell, atlasFlowArrow, and adds one
     new primitive (atlasAlveolus) for the gas-exchange inset.
     ========================================================= */
  "ph2:respiratory-physiology": {
    id: "ph2:respiratory-physiology",
    type: "diagram",
    title: "Respiratory Physiology — Air, Lungs, and Gas Exchange",
    topic: { courseId: "ph2", topicIndex: 0 },
    parent: null,
    summary: "Your body needs oxygen for every cell to make energy, and it has to get rid of the carbon dioxide that's produced as waste. The respiratory system does both: air moves in and out through a branching tree of airways, the oxygen crosses a very thin membrane into the blood at the alveoli, and the blood carries it to the tissues. Getting carbon dioxide out happens the same way, in reverse.",
    labels: [
      { id: "whole",       name: "The Whole System",       desc: "Airway, lungs, gas exchange, and the two-way movement of oxygen and carbon dioxide — one integrated system." },
      { id: "airway",      name: "The Airway",             desc: "Trachea, bronchi, and the branching bronchioles. Warms, moistens, and filters air on the way in." },
      { id: "lungs",       name: "The Lungs",              desc: "Two elastic organs around the heart. Right lung has three lobes, left has two with a notch where the heart sits." },
      { id: "alveolus",    name: "The Alveolus",           desc: "A thin-walled air sac at the end of the airway. Surrounded by pulmonary capillaries. This is where gas exchange happens." },
      { id: "membrane",    name: "Respiratory Membrane",   desc: "The thin barrier between air in the alveolus and blood in the capillary. Oxygen and carbon dioxide diffuse across it." },
      { id: "o2",          name: "Oxygen Transport",       desc: "Oxygen crosses into the blood, binds haemoglobin in red cells, and is carried to every tissue in the body." },
      { id: "co2",         name: "Carbon Dioxide Transport", desc: "CO₂ produced by tissues travels back in the blood — mostly as bicarbonate — and is breathed out at the lungs." },
      { id: "control",     name: "Breathing Control",      desc: "The brainstem sets the rhythm. Chemoreceptors in the brain and major arteries sense CO₂ and O₂ levels and adjust rate and depth." },
      { id: "volumes",     name: "Lung Volumes",           desc: "Tidal volume, vital capacity, residual volume — the measurable amounts that describe how much air the lungs move and hold." },
      { id: "pleura",      name: "Pleural Cavity",         desc: "The thin fluid-filled space between the lung and the chest wall. Its surface tension is what makes the lung follow the chest wall's movements." },
    ],
    narration: [
      "Every cell in your body needs oxygen to make energy, and produces carbon dioxide as waste. The respiratory system's job is to bring oxygen in and push carbon dioxide out. It does that with four parts working together: an airway, two lungs, a surface where gas exchange happens, and a control system that sets the rhythm.",
      "Air comes in through your nose or mouth and travels down the trachea, which splits into two bronchi, one for each lung. Inside each lung, those bronchi keep splitting into smaller and smaller tubes called bronchioles. By the time air reaches the end of this branching tree, it's warm, moist, and filtered.",
      "Your two lungs sit on either side of your heart. The right lung has three lobes, the left has two — the left is slightly smaller because the heart takes up space on that side. The lungs themselves are elastic: they stretch when air comes in and recoil when it goes out.",
      "At the very end of each bronchiole are clusters of tiny air sacs called alveoli. There are hundreds of millions of them, and together they give your lungs an enormous surface area — about the size of a tennis court — packed into your chest. This is where the actual gas exchange happens.",
      "Each alveolus is wrapped in a mesh of tiny blood vessels called pulmonary capillaries. Between the air inside the alveolus and the blood inside the capillary is a barrier just one cell thick — the respiratory membrane. It's so thin that gases can pass straight across it by diffusion.",
      "Oxygen moves from the air in the alveolus, across the respiratory membrane, into the blood. There it binds to haemoglobin inside red blood cells. Those red cells then carry the oxygen through the heart and out to every tissue in the body, where it's released.",
      "Carbon dioxide moves the opposite way. Tissues produce it as waste, it travels back in the blood — mostly as bicarbonate dissolved in plasma — and at the lungs it crosses the respiratory membrane into the alveoli and is breathed out.",
      "Your breathing is controlled by the brainstem, which fires in a steady rhythm. Chemoreceptors in the brain and in major arteries constantly check the levels of carbon dioxide and oxygen in your blood. When CO₂ rises or O₂ drops, they signal the brainstem to breathe faster and deeper.",
      "The amounts of air your lungs move and hold are measurable. Tidal volume is what you breathe in and out at rest — about half a litre. Vital capacity is the most you can breathe out after a full breath in. Residual volume is the air that stays in the lungs even after you breathe out as hard as you can.",
      "Putting it all together: air flows in through the airway, reaches the alveoli, oxygen crosses the respiratory membrane into the blood, carbon dioxide crosses back out, and the brainstem adjusts the whole thing based on what the blood actually needs. Breathing, gas exchange, and control — one system, working together.",
    ],
    stepFocus: [
      ["whole"],
      ["airway"],
      ["lungs"],
      ["alveolus"],
      ["membrane"],
      ["o2"],
      ["co2"],
      ["control"],
      ["volumes"],
      ["pleura"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:respiratory-physiology"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* Lungs — the centrepiece. atlasLungs draws trachea, both
             bronchi, both lungs with their lobes and fissures, and the
             alveolar clusters at the terminal bronchioles. */}
          <g style={{ cursor: cur }} onClick={click("lungs")} filter={hotFilter("lungs")}>
            {atlasLungs({ cx: 450, cy: 210, scale: 1.6, highlight: isHot("lungs") })}
            <rect x="220" y="40" width="460" height="360" fill="none" {...ring("lungs")} pointerEvents="none" />
          </g>

          {/* Airway label anchor — the trachea is drawn by atlasLungs;
             this group just adds the clickable region for the airway
             narration step. */}
          <g style={{ cursor: cur }} onClick={click("airway")} filter={hotFilter("airway")}>
            <ellipse cx="450" cy="90" rx="40" ry="50" fill="none" {...ring("airway")} pointerEvents="none" />
          </g>

          {/* Alveolus inset — replaces the terminal bronchiole view with
             a magnified cluster, connected by a leader line to where the
             alveolar clusters sit inside the lung drawing. */}
          <g style={{ cursor: cur }} onClick={click("alveolus")} filter={hotFilter("alveolus")}>
            {atlasAlveolus({ cx: 720, cy: 460, scale: 1.4, oxygenated: true, highlight: isHot("alveolus") })}
            <circle cx="720" cy="460" r="80" fill="none" {...ring("alveolus")} pointerEvents="none" />
          </g>
          <path
            d="M600,360 Q640,410 700,440"
            fill="none"
            stroke={ATLAS_COLORS.neutral}
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Respiratory membrane inset — a zoomed cross-section, shown
             only when its step is active or highlighted. Uses the same
             alveolus primitive with highlight enabled so the O2/CO2
             arrows appear, and a bracket showing the thin barrier. */}
          {isHot("membrane") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M820,420 Q770,440 760,460"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="820" cy="420" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="700" y="530" width="180" height="60" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="790" y="552" textAnchor="middle" fontSize="10" fontWeight="700" fill={ATLAS_COLORS.trunk}>RESPIRATORY MEMBRANE</text>
              <text x="790" y="570" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">one cell thick — gases diffuse across</text>
            </g>
          )}

          {/* Oxygen transport inset — a red cell with haemoglobin carrying
             O2, shown only when its step is active. */}
          {isHot("o2") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="70" y="290" width="170" height="100" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="155" y="312" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">OXYGEN TRANSPORT</text>
              {atlasBloodCell({ cx: 130, cy: 345, r: 16, oxygenated: true })}
              <text x="175" y="340" fontSize="10" fontWeight="700" fill="#C0392B">O₂</text>
              <text x="175" y="354" fontSize="8" fill="var(--text-2)">bound to Hb</text>
              <text x="155" y="378" textAnchor="middle" fontSize="8" fill="var(--text-2)">carried to every tissue</text>
            </g>
          )}

          {/* CO2 transport inset — mirrors the O2 inset, showing CO2
             leaving via the same route in reverse. */}
          {isHot("co2") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="70" y="410" width="170" height="100" rx="14" fill="var(--bg-2)" stroke="#2F6FED" strokeWidth="2" />
              <text x="155" y="432" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#2F6FED">CO₂ TRANSPORT</text>
              {atlasBloodCell({ cx: 130, cy: 465, r: 16, oxygenated: false })}
              <text x="175" y="460" fontSize="10" fontWeight="700" fill="#2F6FED">CO₂</text>
              <text x="175" y="474" fontSize="8" fill="var(--text-2)">as bicarbonate</text>
              <text x="155" y="498" textAnchor="middle" fontSize="8" fill="var(--text-2)">exhaled at the lungs</text>
            </g>
          )}

          {/* Control inset — brainstem + chemoreceptors, shown only when
             its step is active. */}
          {isHot("control") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="700" y="40" width="180" height="110" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="790" y="62" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>BREATHING CONTROL</text>
              {/* Brainstem icon */}
              <ellipse cx="770" cy="90" rx="16" ry="10" fill="#8B5CF6" opacity="0.7" />
              <text x="770" y="93" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">brain</text>
              {/* Chemoreceptor arrow */}
              <path d="M790,100 Q820,120 810,135" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.6" />
              <circle cx="810" cy="138" r="4" fill={ATLAS_COLORS.trunk} />
              <text x="790" y="135" textAnchor="middle" fontSize="8" fill="var(--text-2)">senses CO₂ / O₂</text>
            </g>
          )}

          {/* Lung volumes inset — a simple volume diagram, shown only on
             its step. Draws the four key volumes as horizontal bars. */}
          {isHot("volumes") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="280" y="500" width="280" height="100" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="420" y="520" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>LUNG VOLUMES</text>
              {[
                { label: "TV",  val: 0.10, color: "#2F6FED" },
                { label: "IRV", val: 0.20, color: "#2D7BFF" },
                { label: "ERV", val: 0.15, color: "#C0392B" },
                { label: "RV",  val: 0.25, color: "#8C1C12" },
              ].map((v, i) => (
                <g key={i}>
                  <text x="295" y={545 + i * 12} fontSize="8" fill="var(--text-2)">{v.label}</text>
                  <rect x="320" y={539 + i * 12} width={v.val * 220} height="7" rx="3" fill={v.color} opacity="0.85" />
                </g>
              ))}
            </g>
          )}

          {/* Pleural cavity inset — showing the thin fluid-filled space
             between lung and chest wall, only when its step is active. */}
          {isHot("pleura") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="650" y="530" width="230" height="60" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="765" y="552" textAnchor="middle" fontSize="10" fontWeight="700" fill={ATLAS_COLORS.trunk}>PLEURAL CAVITY</text>
              <text x="765" y="570" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">fluid film — lung follows chest wall</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="30"  textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Airway</text>
          <text x="450" y="600" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Alveoli · Gas exchange</text>
          <text x="120" y="260" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">O₂ / CO₂</text>
          <text x="800" y="260" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Control · Volumes</text>
        </svg>
      );
    },
  },

  /* =========================================================
     IMMUNE SYSTEM
     Topic: Physiology II (ph2), Topic 04 (index 3).
     Completes the cardio / lymphatic / immune family. Reuses
     atlasLymphNode, atlasWhiteCell, atlasBloodCell, atlasVessel.
     Adds one new primitive: atlasAntibody.
     ========================================================= */
  "ph2:immune-system": {
    id: "ph2:immune-system",
    type: "diagram",
    title: "The Immune System — Innate and Adaptive Defence",
    topic: { courseId: "ph2", topicIndex: 3 },
    parent: null,
    summary: "Your body has two layers of defence against anything that could harm it. The innate immune system is fast, general, and always ready — it responds the same way to any threat. The adaptive immune system is slower to start but precise and long-lasting — it learns the exact identity of a specific threat, remembers it, and responds faster and stronger if it ever sees it again.",
    labels: [
      { id: "whole",      name: "The Whole System",          desc: "Two layers of defence working together: fast and general (innate), then slow and precise (adaptive)." },
      { id: "barrier",    name: "Physical Barriers",         desc: "Skin, mucous membranes, and the linings of your airways and gut. The first line — stop threats from getting in at all." },
      { id: "innate",     name: "Innate Immune Cells",       desc: "Neutrophils, macrophages, and dendritic cells. Fast responders that attack anything foreign without needing to recognise it specifically." },
      { id: "inflammation", name: "Inflammation",            desc: "Redness, heat, swelling, pain. The innate response brings immune cells and fluid to the site of an injury or infection." },
      { id: "apc",        name: "Antigen-Presenting Cell",   desc: "A dendritic cell or macrophage that has engulfed a threat, chopped it up, and is showing a piece of it to the adaptive immune system." },
      { id: "bcell",      name: "B Cells → Antibodies",      desc: "B cells recognise a specific antigen and produce antibodies — Y-shaped proteins that tag the threat for destruction." },
      { id: "antibody",   name: "Antibodies",                desc: "Y-shaped proteins with two identical binding sites. Each antibody is specific to one antigen. They neutralise, tag, and clump threats together." },
      { id: "tcell",      name: "T Cells",                   desc: "Helper T cells coordinate the response; cytotoxic T cells kill infected cells directly. Both need to see antigen first." },
      { id: "memory",     name: "Memory Cells",              desc: "Long-lived B and T cells left behind after an infection. If the same threat returns, they respond within hours instead of days." },
      { id: "lymphnode",  name: "Lymph Node",                desc: "Where the adaptive response is organised. B cells, T cells, and antigen-presenting cells all meet here to start the response." },
    ],
    narration: [
      "Your body is under constant attack — bacteria, viruses, parasites, and your own cells going wrong. The immune system is what stops all of that. It works in two layers: one that's fast and general, and one that's slower but far more precise.",
      "The first layer isn't really cells at all — it's barriers. Your skin, the mucous membranes lining your airways and gut, the acid in your stomach, the tiny hairs in your lungs. These keep most threats out entirely. It's only when something gets past them that the immune cells get involved.",
      "The innate immune system is the fast responder. Neutrophils and macrophages patrol your tissues and attack anything they recognise as foreign. They don't need to know exactly what a threat is — they respond the same way to any of them. That's what makes them fast, and that's also what makes them general.",
      "When innate cells detect a threat, they trigger inflammation. Blood vessels widen and become leaky, more immune cells rush in, and the area becomes red, warm, swollen, and painful. It's uncomfortable, but it's the response working — it's how the body brings the fight to the site of infection.",
      "The innate response can't do it all alone — some threats are too good at hiding. So a special group of innate cells called antigen-presenting cells do something clever: they engulf the threat, chop it into pieces, and carry a piece to the nearest lymph node to show it to the adaptive immune system.",
      "In the lymph node, B cells wait. Each B cell has receptors that fit one specific antigen — like a lock waiting for one key. When a B cell meets the antigen that fits, it activates, multiplies, and starts producing antibodies.",
      "Antibodies are Y-shaped proteins that match the antigen they were made for. The two arms of the Y grab onto the threat, and the stem tells other immune cells to destroy it. Antibodies neutralise viruses, clump bacteria together, and tag threats for the rest of the immune system.",
      "T cells are the other half of the adaptive response. Helper T cells see antigen on the presenting cell and release signals that coordinate the whole response — they tell B cells to make more antibodies, and tell cytotoxic T cells to start killing. Cytotoxic T cells destroy cells that are already infected — the ones the antibodies can't reach.",
      "After the infection is cleared, most of the activated B and T cells die off. But a few stay behind as memory cells. They're the whole reason vaccines work: if the same threat ever comes back, memory cells recognise it immediately and mount a full response in hours instead of days.",
      "Putting it all together: barriers stop most threats, innate cells respond fast to whatever gets through, antigen-presenting cells carry evidence to the lymph node, B cells make antibodies against it, T cells coordinate and kill infected cells, and memory cells stay on guard. Fast, general defence and slow, precise defence — working together as one system.",
    ],
    stepFocus: [
      ["whole"],
      ["barrier"],
      ["innate"],
      ["inflammation"],
      ["apc"],
      ["bcell"],
      ["antibody"],
      ["tcell"],
      ["memory"],
      ["lymphnode"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:immune-system"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* Body outline at the base — the whole scene is happening
             inside a person. A soft neutral silhouette behind
             everything else, never competes with the cells. */}
          <ellipse cx="450" cy="330" rx="400" ry="270" fill="#2B1A14" opacity="0.04" />

          {/* ---- Barrier layer at the top ---- */}
          <g style={{ cursor: cur }} onClick={click("barrier")} filter={hotFilter("barrier")}>
            {/* Skin surface — a segmented wavy line suggesting the
               layered barrier of skin and mucous membranes. */}
            <path
              d="M100,60 Q200,50 300,60 Q400,70 500,60 Q600,50 700,60 Q800,70 820,60"
              fill="none"
              stroke="#B63B2E"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M100,72 Q200,62 300,72 Q400,82 500,72 Q600,62 700,72 Q800,82 820,72"
              fill="none"
              stroke="#D89B14"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <text x="450" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)">Physical barriers</text>
          </g>

          {/* ---- Innate cells patrolling below the barrier ---- */}
          <g style={{ cursor: cur }} onClick={click("innate")} filter={hotFilter("innate")}>
            {atlasWhiteCell({ cx: 180, cy: 150, r: 18 })}
            {atlasWhiteCell({ cx: 260, cy: 190, r: 18 })}
            {atlasWhiteCell({ cx: 340, cy: 160, r: 18 })}
            <text x="260" y="235" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Innate cells patrolling</text>
            <text x="260" y="248" textAnchor="middle" fontSize="9" fill="var(--text-2)">neutrophils · macrophages</text>
          </g>

          {/* ---- Threat — a red spiky particle that shows the danger ---- */}
          <g>
            <path
              d="M600,150 l8,-12 l6,12 l12,2 l-8,10 l2,12 l-12,-4 l-10,8 l0,-12 l-10,-8 l12,-6 z"
              fill="#C0392B"
              stroke="#8C1C12"
              strokeWidth="1.4"
              opacity="0.9"
            />
            <text x="610" y="185" textAnchor="middle" fontSize="9" fill="var(--text-2)">threat</text>
          </g>

          {/* ---- Inflammation inset — shown when step 4 is active ---- */}
          {isHot("inflammation") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="270" width="180" height="110" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="150" y="292" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">INFLAMMATION</text>
              <text x="150" y="310" textAnchor="middle" fontSize="9" fill="var(--text-2)">red · warm · swollen · painful</text>
              {/* Blood vessel widening, more cells rushing in */}
              <path d="M80,335 Q150,325 220,335" fill="none" stroke="#E53935" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
              {atlasWhiteCell({ cx: 120, cy: 355, r: 10 })}
              {atlasWhiteCell({ cx: 150, cy: 360, r: 10 })}
              {atlasWhiteCell({ cx: 180, cy: 355, r: 10 })}
            </g>
          )}

          {/* ---- Antigen-presenting cell — carries antigen to the node ---- */}
          <g style={{ cursor: cur }} onClick={click("apc")} filter={hotFilter("apc")}>
            {atlasWhiteCell({ cx: 620, cy: 280, r: 22 })}
            {/* Antigen pieces on the surface — small red triangles on the
               cell membrane, the visual signature of an APC. */}
            <polygon points="610,262 620,262 615,254" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.8" />
            <polygon points="630,264 640,264 635,256" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.8" />
            <text x="620" y="320" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">Antigen-presenting cell</text>
            <text x="620" y="333" textAnchor="middle" fontSize="9" fill="var(--text-2)">shows antigen to T cells</text>
          </g>

          {/* ---- Lymph node — where the adaptive response is organised ---- */}
          <g style={{ cursor: cur }} onClick={click("lymphnode")} filter={hotFilter("lymphnode")}>
            {atlasLymphNode({ cx: 450, cy: 450, scale: 2.4 })}
            <text x="450" y="510" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Lymph node</text>
            <text x="450" y="523" textAnchor="middle" fontSize="9" fill="var(--text-2)">where B and T cells meet antigen</text>
          </g>

          {/* ---- B cells on the left of the node ---- */}
          <g style={{ cursor: cur }} onClick={click("bcell")} filter={hotFilter("bcell")}>
            {atlasWhiteCell({ cx: 260, cy: 450, r: 20 })}
            {atlasWhiteCell({ cx: 300, cy: 480, r: 20 })}
            <text x="280" y="520" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">B cells</text>
            <text x="280" y="533" textAnchor="middle" fontSize="9" fill="var(--text-2)">make antibodies</text>
          </g>

          {/* ---- T cells on the right of the node ---- */}
          <g style={{ cursor: cur }} onClick={click("tcell")} filter={hotFilter("tcell")}>
            {atlasWhiteCell({ cx: 600, cy: 450, r: 20 })}
            {atlasWhiteCell({ cx: 640, cy: 480, r: 20 })}
            <text x="620" y="520" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">T cells</text>
            <text x="620" y="533" textAnchor="middle" fontSize="9" fill="var(--text-2)">coordinate · kill infected</text>
          </g>

          {/* ---- Antibody inset — shown when step 7 is active ---- */}
          {isHot("antibody") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="420" width="160" height="140" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="140" y="442" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">ANTIBODY</text>
              {atlasAntibody({ cx: 140, cy: 500, scale: 1.4, bound: true, highlight: true })}
            </g>
          )}

          {/* ---- Memory cells — bottom corner, standing guard ---- */}
          <g style={{ cursor: cur }} onClick={click("memory")} filter={hotFilter("memory")}>
            <rect x="700" y="520" width="150" height="70" rx="12" fill="var(--bg-3)" stroke={ATLAS_COLORS.trunk} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.85" />
            <text x="775" y="545" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>MEMORY CELLS</text>
            <text x="775" y="562" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">stay long after infection</text>
            <text x="775" y="578" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">respond in hours next time</text>
          </g>

          {/* Static region labels */}
          <text x="450" y="600" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Fast, general defence + slow, precise defence</text>
        </svg>
      );
    },
  },

  /* =========================================================
     ACUTE INFLAMMATION
     Topic: General Pathology (pat), Topic 05 (index 4).
     Opens the pathology family. Introduces the reusable
     atlasInflammationScene primitive that the rest of the
     family (pat:2, pat:3, pat:7, pat:8, pat:9) will reuse.
     ========================================================= */
  "pat:acute-inflammation": {
    id: "pat:acute-inflammation",
    type: "diagram",
    title: "Acute Inflammation — The Body's Rapid Response",
    topic: { courseId: "pat", topicIndex: 4 },
    parent: null,
    summary: "When tissue is injured or infected, the body responds within seconds. Blood vessels widen and become leaky, immune cells rush to the site, and the area becomes red, hot, swollen, and painful. This is acute inflammation — a fast, general response that brings the immune system to where it's needed, then resolves once the threat is dealt with.",
    labels: [
      { id: "whole",         name: "The Whole Response",       desc: "Vasodilation, increased permeability, cell recruitment, phagocytosis, and resolution — five stages of one continuous process." },
      { id: "trigger",       name: "The Trigger",              desc: "Tissue injury, infection, or an immune reaction. Whatever the cause, the response that follows is the same." },
      { id: "vasodilation",  name: "Vasodilation",             desc: "Blood vessels widen to increase blood flow to the area. This is what causes the redness and heat." },
      { id: "permeability",  name: "Increased Permeability",   desc: "Vessel walls become leaky, letting plasma and proteins escape into the tissue. This is what causes the swelling." },
      { id: "recruitment",   name: "Cell Recruitment",         desc: "White cells roll along the vessel wall, then squeeze through the gaps into the tissue to reach the site of injury." },
      { id: "phagocytosis",  name: "Phagocytosis",             desc: "Neutrophils and macrophages engulf bacteria and debris. This is the clean-up phase of the response." },
      { id: "mediators",     name: "Chemical Mediators",       desc: "Histamine, prostaglandins, cytokines, and complement proteins drive the whole response — telling vessels to widen, walls to leak, and cells to come." },
      { id: "signs",         name: "The Cardinal Signs",       desc: "Redness, heat, swelling, pain, and loss of function. Each one is a direct consequence of the changes happening in the tissue." },
      { id: "resolution",    name: "Resolution",               desc: "Once the threat is cleared, the response winds down, the tissue repairs, and normal function returns. If it doesn't, inflammation becomes chronic." },
      { id: "types",         name: "Acute vs Chronic",         desc: "Acute inflammation is fast and short-lived, dominated by neutrophils. Chronic inflammation lasts weeks to months, dominated by macrophages and lymphocytes." },
    ],
    narration: [
      "When tissue is injured or infected, the body doesn't wait. Within seconds, it launches a fast, general response designed to bring immune cells and immune proteins to the exact site of damage. That response is acute inflammation.",
      "The trigger can be almost anything — a cut, a burn, a bacterial infection, an allergic reaction, or even tissue damage from lack of blood flow. Whatever the cause, the inflammatory response that follows is the same.",
      "The first change is in the blood vessels. They widen, increasing blood flow to the area. This is vasodilation. It's what makes inflamed tissue look red and feel warm — more hot blood is passing through than usual.",
      "Next, the vessel walls become leaky. They open up gaps between their cells, letting plasma and proteins escape into the surrounding tissue. This is what causes the swelling. The fluid that leaks out also carries antibodies and clotting factors to the site.",
      "Now white cells can get in. Neutrophils — the fastest immune cells — roll along the inside of the vessel wall, stick, and then squeeze themselves through the gaps between the endothelial cells into the tissue. They're following chemical signals towards the injury.",
      "Once in the tissue, neutrophils and macrophages do their main job: phagocytosis. They engulf bacteria, dead cells, and debris, and destroy them inside the cell. This is the clean-up phase — where the actual threat gets dealt with.",
      "The whole process is driven by chemical mediators. Histamine, prostaglandins, cytokines, and complement proteins tell vessels to widen, walls to leak, and cells to come. Drugs like ibuprofen work by blocking one of these — prostaglandins — which is why they reduce both pain and inflammation.",
      "Because all this is happening, the inflamed area shows the four cardinal signs: redness from vasodilation, heat from increased blood flow, swelling from the leaky vessels, and pain from the pressure of the swelling plus direct chemical sensitisation of nerve endings. Loss of function often follows.",
      "Once the threat is cleared, the response has to stop. Neutrophils die off, macrophages clean up the debris, and the tissue begins to repair. Normal function returns. This is resolution — the healing phase after the acute response.",
            "If the trigger persists — a chronic infection, an autoimmune reaction, or a foreign body the immune system can't destroy — the response never resolves. Acute becomes chronic: macrophages and lymphocytes replace neutrophils, and the tissue itself starts to be damaged. That's why chronic inflammation underlies many long-term diseases.",
    ],
    stepFocus: [
      ["whole"],
      ["trigger"],
      ["vasodilation"],
      ["permeability"],
      ["recruitment"],
      ["phagocytosis"],
      ["mediators"],
      ["signs"],
      ["resolution"],
      ["types"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:acute-inflammation"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The scene in the centre of the diagram evolves as the student
      // steps through the narration — each stage of the response
      // toggles one of the scene's boolean props on. This mirrors how
      // the Cardiovascular and Lymphatic diagrams build up their
      // overlays step by step.
      const scene = {
        vasodilation: activeStep >= 2,
        permeability: activeStep >= 3,
        recruitment:  activeStep >= 4,
        phagocytosis: activeStep >= 5,
        resolution:   activeStep >= 8 && activeStep < lastStep,
      };

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The evolving tissue scene — the centrepiece. Everything
             else (labels, insets, callouts) hangs off this. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasInflammationScene({
              cx: 450, cy: 320, width: 520, height: 300,
              ...scene,
              highlight: false,
            })}
          </g>

          {/* Trigger — a spiky threat particle entering the tissue from
             the top-left, only drawn prominently on its own step. */}
          <g style={{ cursor: cur }} onClick={click("trigger")} filter={hotFilter("trigger")}>
            <path
              d="M240,150 l8,-12 l6,12 l12,2 l-8,10 l2,12 l-12,-4 l-10,8 l0,-12 l-10,-8 l12,-6 z"
              fill="#C0392B"
              stroke="#8C1C12"
              strokeWidth="1.4"
              opacity={isHot("trigger") ? 1 : 0.55}
            />
            <text x="260" y="185" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">injury / infection</text>
            <circle cx="450" cy="320" r="260" fill="none" {...ring("whole")} pointerEvents="none" />
          </g>

          {/* Vasodilation label anchor */}
          <g style={{ cursor: cur }} onClick={click("vasodilation")} filter={hotFilter("vasodilation")}>
            <circle cx="260" cy="440" r="60" fill="none" {...ring("vasodilation")} pointerEvents="none" />
            <text x="260" y="530" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">vasodilation</text>
          </g>

          {/* Permeability label anchor */}
          <g style={{ cursor: cur }} onClick={click("permeability")} filter={hotFilter("permeability")}>
            <circle cx="450" cy="470" r="50" fill="none" {...ring("permeability")} pointerEvents="none" />
            <text x="450" y="555" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">permeability</text>
          </g>

          {/* Recruitment label anchor */}
          <g style={{ cursor: cur }} onClick={click("recruitment")} filter={hotFilter("recruitment")}>
            <circle cx="640" cy="440" r="60" fill="none" {...ring("recruitment")} pointerEvents="none" />
            <text x="640" y="530" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">cell recruitment</text>
          </g>

          {/* Phagocytosis label anchor */}
          <g style={{ cursor: cur }} onClick={click("phagocytosis")} filter={hotFilter("phagocytosis")}>
            <circle cx="380" cy="220" r="55" fill="none" {...ring("phagocytosis")} pointerEvents="none" />
            <text x="380" y="165" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">phagocytosis</text>
          </g>

          {/* Mediators inset — a small panel listing the four main
             mediator families, drawn only when its step is active. */}
          {isHot("mediators") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M700,250 Q720,270 720,300"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <rect x="690" y="120" width="180" height="110" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="780" y="142" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>CHEMICAL MEDIATORS</text>
              <text x="780" y="162" textAnchor="middle" fontSize="9" fill="var(--text-2)">histamine</text>
              <text x="780" y="178" textAnchor="middle" fontSize="9" fill="var(--text-2)">prostaglandins</text>
              <text x="780" y="194" textAnchor="middle" fontSize="9" fill="var(--text-2)">cytokines</text>
              <text x="780" y="210" textAnchor="middle" fontSize="9" fill="var(--text-2)">complement</text>
            </g>
          )}

          {/* Cardinal signs inset — the four classic signs of acute
             inflammation, shown as a labelled panel. */}
          {isHot("signs") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="180" height="120" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="150" y="142" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">CARDINAL SIGNS</text>
              {[
                { sym: "redness",   y: 162 },
                { sym: "heat",      y: 180 },
                { sym: "swelling",  y: 198 },
                { sym: "pain",      y: 216 },
              ].map((s, i) => (
                <text key={i} x="150" y={s.y} textAnchor="middle" fontSize="9" fill="var(--text-2)">{s.sym}</text>
              ))}
              <text x="150" y="234" textAnchor="middle" fontSize="7.5" fill="var(--text-3)">+ loss of function</text>
            </g>
          )}

          {/* Resolution indicator — a green outline appears around the
             scene once step 9 is reached. Not a box, just a soft ring. */}
          {isHot("resolution") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <circle
                cx="450" cy="320" r="230"
                fill="none" stroke="#16A34A" strokeWidth="3"
                strokeDasharray="8 6"
                opacity="0.75"
              />
              <text x="450" y="585" textAnchor="middle" fontSize="11" fontWeight="700" fill="#16A34A">tissue returns to normal</text>
            </g>
          )}

          {/* Types inset — acute vs chronic comparison, shown on the
             final narration step. */}
          {isHot("types") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="700" y="400" width="180" height="120" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="790" y="422" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>ACUTE vs CHRONIC</text>
              <text x="790" y="446" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0392B">Acute</text>
              <text x="790" y="460" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">minutes to days</text>
              <text x="790" y="474" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">neutrophils dominate</text>
              <text x="790" y="494" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8B5CF6">Chronic</text>
              <text x="790" y="508" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">weeks to months</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Tissue</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Fast, general, self-limiting — unless the trigger persists</text>
        </svg>
      );
    },
  },

  /* =========================================================
     WOUND HEALING
     Topic: General Pathology (pat), Topic 07 (index 6).
     Second diagram in the pathology family. Reuses
     atlasWoundScene (introduced here), atlasInflammationScene,
     atlasWhiteCell, atlasVessel, atlasPlatelet. Follows on
     directly from pat:5 (acute inflammation) - this is what
     happens after the acute response winds down.
     ========================================================= */
  "pat:wound-healing": {
    id: "pat:wound-healing",
    type: "diagram",
    title: "Wound Healing — Repair, Regeneration, and Scar",
    topic: { courseId: "pat", topicIndex: 6 },
    parent: null,
    summary: "When tissue is damaged, the body doesn't just patch it — it runs a tightly ordered repair programme. A clot forms first to stop the bleeding, then immune cells clear the debris, then new tissue and new blood vessels grow into the wound, and finally the wound contracts and the collagen reorganises into a mature scar. The whole process takes days to weeks, and it either completes cleanly (healing by first intention) or leaves a larger scar (healing by second intention) depending on how much tissue was lost.",
    labels: [
      { id: "whole",         name: "The Whole Process",       desc: "Clot → inflammation → granulation → collagen → contraction → remodelling. Five overlapping phases running one after another." },
      { id: "hemostasis",    name: "Hemostasis",              desc: "The clot that stops the bleeding and acts as the scaffold everything else builds on." },
      { id: "inflammation",  name: "Inflammation",            desc: "Neutrophils arrive first to clear bacteria, then macrophages arrive to clean up dead tissue and debris." },
      { id: "macrophages",   name: "Macrophages",             desc: "The cleanup crew and the foremen. They eat debris and dead neutrophils, and they release the signals that start the next phase." },
      { id: "granulation",   name: "Granulation Tissue",      desc: "New pink tissue that fills the wound from the edges. It's a mix of new capillaries, fibroblasts, and loose connective tissue." },
      { id: "angiogenesis",  name: "Angiogenesis",            desc: "New capillaries bud into the granulation tissue, restoring blood supply to the healing wound." },
      { id: "fibroblasts",   name: "Fibroblasts & Collagen",  desc: "Fibroblasts lay down collagen, the structural protein that will eventually hold the wound together." },
      { id: "epithelialisation", name: "Epithelialisation",   desc: "Skin cells migrate across the surface of the wound to close it off from the outside world." },
      { id: "contraction",   name: "Contraction",             desc: "Myofibroblasts pull the wound edges together, shrinking the surface area that has to be covered." },
      { id: "scar",          name: "Scar Maturation",         desc: "Weeks to months later, the collagen reorganises into a strong, pale, mature scar. The tissue never fully returns to normal." },
    ],
    narration: [
      "Wound healing is the body's repair programme. It runs in four overlapping phases: stop the bleeding, clean up the damage, build new tissue, and remodel it into something strong. Depending on how much tissue was lost, it either heals cleanly with minimal scarring or leaves a larger scar behind.",
      "Phase one is hemostasis. The moment a vessel is cut, it tightens and platelets rush to the site. They stick together to form a plug, and a fibrin mesh locks the plug in place. That clot is not just a patch — it's the scaffold the whole repair will build on.",
      "Phase two is inflammation. Neutrophils arrive within minutes, attacking any bacteria that got in. They only last a few hours, then die off and become part of the debris that has to be cleared. In the meantime they've released signals calling the next wave in.",
      "The macrophages arrive next, and they're the ones who really run the show. They eat the dead neutrophils, eat bacteria and dead tissue, and then release the growth factors that tell the repair to move into its next phase. Without macrophages, healing stalls.",
      "Phase three begins: the wound starts filling with new tissue. From the edges and from the base, fresh pink granulation tissue grows in. It's soft, it's rich in new blood vessels, and it's what gives a healing wound its characteristic red, bumpy appearance.",
      "Part of building that new tissue is angiogenesis — new capillary loops bud off existing vessels and grow into the wound. Without new blood supply, the granulation tissue can't survive. This is why a wound with poor circulation heals so slowly.",
      "Fibroblasts move in alongside the new vessels and start laying down collagen. Collagen is the structural protein that will eventually hold the wound together. Early on it's laid down in a disorganised pattern, which is why fresh scar tissue is weak.",
      "While all this is happening underneath, the surface of the wound is being closed off. Skin cells from the edges migrate across the top of the granulation tissue, sliding over it until they meet in the middle. This is epithelialisation — it's what makes the wound waterproof again.",
      "As the wound fills and closes, myofibroblasts — specialised cells with muscle-like properties — pull the wound edges together. This is contraction, and it can shrink the wound surface dramatically. It's helpful for closing large wounds, but it's also why scars can pucker or restrict movement.",
      "The final phase is remodelling, and it can go on for months. The disorganised collagen is slowly broken down and re-laid in a more organised pattern, the new blood vessels recede, and the wound becomes a pale, firm, mature scar. The tissue is strong, but it will never be exactly what it was before. That's the difference between repair and regeneration.",
    ],
    stepFocus: [
      ["whole"],
      ["hemostasis"],
      ["inflammation"],
      ["macrophages"],
      ["granulation"],
      ["angiogenesis"],
      ["fibroblasts"],
      ["epithelialisation"],
      ["contraction"],
      ["scar"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:wound-healing"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The scene evolves as the narration runs. The four boolean
      // props on atlasWoundScene toggle on as the phase is reached,
      // so the same tissue patch visually goes from open wound to
      // clot to inflamed to granulating to scarred.
      const scene = {
        hemostasis:    activeStep >= 1,
        inflammation:  activeStep >= 2,
        proliferation: activeStep >= 4,
        remodelling:   activeStep >= 8,
      };

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The evolving wound scene — the centrepiece. Everything
             else (labels, insets, callouts) hangs off this. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasWoundScene({
              cx: 450, cy: 320, width: 520, height: 300,
              ...scene,
              highlight: false,
            })}
          </g>

          {/* Hemostasis anchor — a small callout pointing at the clot
             inside the wound, only shown on its own step. */}
          {isHot("hemostasis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M340,240 Q300,200 260,180"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="340" cy="240" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="90" y="130" width="170" height="70" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="175" y="155" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>CLOT FORMATION</text>
              <text x="175" y="173" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">platelets + fibrin mesh</text>
              <text x="175" y="188" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">scaffold for repair</text>
            </g>
          )}

          {/* Inflammation label anchor — the diagram's scene already
             draws the swarming neutrophils, this just labels them. */}
          <g style={{ cursor: cur }} onClick={click("inflammation")} filter={hotFilter("inflammation")}>
            <circle cx="620" cy="215" r="55" fill="none" {...ring("inflammation")} pointerEvents="none" />
            <text x="620" y="160" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">neutrophils arrive</text>
          </g>

          {/* Macrophage anchor — bottom-right, drawn only when its step
             is active so the scene doesn't get too busy. */}
          {isHot("macrophages") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M620,400 Q660,420 700,440"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="620" cy="400" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="690" y="415" width="180" height="80" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="780" y="440" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>MACROPHAGES</text>
              <text x="780" y="458" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">eat debris and dead</text>
              <text x="780" y="472" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">neutrophils; then signal</text>
              <text x="780" y="486" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">the next phase</text>
            </g>
          )}

          {/* Granulation label anchor */}
          <g style={{ cursor: cur }} onClick={click("granulation")} filter={hotFilter("granulation")}>
            <circle cx="450" cy="320" r="70" fill="none" {...ring("granulation")} pointerEvents="none" />
          </g>
          {isHot("granulation") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M380,400 Q340,440 300,470"
                fill="none"
                stroke={ATLAS_COLORS.trunk}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="380" cy="400" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="120" y="465" width="180" height="70" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="210" y="490" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>GRANULATION TISSUE</text>
              <text x="210" y="508" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">new capillaries + fibroblasts</text>
              <text x="210" y="523" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">+ loose connective tissue</text>
            </g>
          )}

          {/* Angiogenesis callout — small loops drawn over the wound
             area, only when its step is active. */}
          {isHot("angiogenesis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="700" y="130" width="160" height="70" rx="12" fill="var(--bg-2)" stroke="#E53935" strokeWidth="2" />
              <text x="780" y="155" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#E53935">ANGIOGENESIS</text>
              <text x="780" y="173" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">new capillaries</text>
              <text x="780" y="188" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">restore blood supply</text>
            </g>
          )}

          {/* Fibroblasts / collagen callout */}
          {isHot("fibroblasts") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="700" y="130" width="160" height="70" rx="12" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="780" y="155" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">FIBROBLASTS</text>
              <text x="780" y="173" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">lay down collagen</text>
              <text x="780" y="188" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">strengthens the wound</text>
            </g>
          )}

          {/* Epithelialisation — a top-of-wound indicator, only when
             its step is active. */}
          {isHot("epithelialisation") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M400,280 L500,280"
                stroke="#D89B14"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="10 4"
              />
              <polygon points="500,280 494,276 494,284" fill="#D89B14" />
              <polygon points="400,280 406,276 406,284" fill="#D89B14" />
              <text x="450" y="270" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#D89B14">epithelialisation</text>
              <text x="450" y="258" textAnchor="middle" fontSize="8" fill="var(--text-2)">skin cells close the surface</text>
            </g>
          )}

          {/* Contraction callout — arrows pulling the wound edges in. */}
          {isHot("contraction") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path d="M300,320 L360,320" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
              <polygon points="360,320 353,316 353,324" fill="#C0392B" />
              <path d="M600,320 L540,320" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
              <polygon points="540,320 547,316 547,324" fill="#C0392B" />
              <text x="450" y="345" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">contraction</text>
              <text x="450" y="360" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">myofibroblasts pull the edges in</text>
            </g>
          )}

          {/* Scar maturation callout — final phase. */}
          {isHot("scar") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="700" y="380" width="170" height="90" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="785" y="405" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>MATURE SCAR</text>
              <text x="785" y="423" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">collagen reorganised</text>
              <text x="785" y="437" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">blood vessels recede</text>
              <text x="785" y="451" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">tissue pale and firm</text>
              <text x="785" y="465" textAnchor="middle" fontSize="8" fill="var(--text-3)">strong, but not original</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Skin / tissue</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Five overlapping phases — clot, inflame, build, close, remodel</text>
        </svg>
      );
    },
  },

  /* =========================================================
     CHRONIC INFLAMMATION
     Topic: General Pathology (pat), Topic 08 (index 7).
     Third diagram in the pathology family. Reuses
     atlasInflammationScene with the new `chronic` prop, plus
     atlasWhiteCell, atlasVessel, atlasAntibody. Follows on
     directly from pat:5 (acute inflammation) - this is what
     happens when the trigger never goes away.
     ========================================================= */
  "pat:chronic-inflammation": {
    id: "pat:chronic-inflammation",
    type: "diagram",
    title: "Chronic Inflammation — When the Response Never Ends",
    topic: { courseId: "pat", topicIndex: 7 },
    parent: null,
    summary: "Acute inflammation is designed to finish. When it can't — because the trigger persists, the immune system can't clear it, or the response itself becomes self-sustaining — it becomes chronic. The cells change, the timeline stretches out from days to months or years, and the tissue is slowly damaged by the very response meant to protect it. Chronic inflammation underlies many of the long-term diseases of ageing: arthritis, atherosclerosis, inflammatory bowel disease, and more.",
    labels: [
      { id: "whole",         name: "The Whole Picture",       desc: "A response that should have ended within days but instead has been running for months, damaging tissue as it goes." },
      { id: "trigger",       name: "The Persistent Trigger",  desc: "What keeps the response going: an infection the immune system can't clear, a foreign body it can't destroy, or the body's own tissues mistaken for a threat." },
      { id: "cells",         name: "The Cell Change",         desc: "Neutrophils have long gone. Now the tissue is dominated by macrophages and lymphocytes — slower, longer-lived cells suited to a prolonged fight." },
      { id: "macrophages",   name: "Macrophages",             desc: "The main cell of chronic inflammation. They keep trying to clear the trigger, keep releasing signals, and keep recruiting more cells — the cycle that never closes." },
      { id: "lymphocytes",   name: "Lymphocytes",             desc: "T and B cells accumulate in chronic inflammation, driving an ongoing adaptive immune response that can itself damage tissue." },
      { id: "fibrosis",      name: "Fibrosis",                desc: "Chronic inflammation leads to scarring. Fibroblasts lay down collagen continuously, and the tissue becomes stiff and dysfunctional." },
      { id: "tissue-damage", name: "Tissue Destruction",      desc: "The macrophages' enzymes and the lymphocytes' signals end up destroying normal tissue. The response itself becomes the disease." },
      { id: "granuloma",     name: "Granuloma Formation",     desc: "When the trigger can't be destroyed, macrophages wall it off into a granuloma — a ball of immune cells that contains the problem but doesn't fix it." },
      { id: "examples",      name: "Common Examples",         desc: "Rheumatoid arthritis, atherosclerosis, inflammatory bowel disease, chronic hepatitis, tuberculosis, and many other long-term conditions." },
      { id: "contrast",      name: "Acute vs Chronic",        desc: "Acute: days, neutrophils, resolves cleanly. Chronic: months to years, macrophages and lymphocytes, ongoing damage and fibrosis." },
    ],
    narration: [
      "Acute inflammation is meant to end. But when the trigger doesn't go away — or when the immune system can't clear it — the response doesn't stop. It changes character, it stretches out over months or years, and it becomes chronic inflammation.",
      "The trigger can be many things. A chronic infection like tuberculosis, where the bacteria hide inside cells. A foreign body the immune system can't destroy. An autoimmune reaction where the body's own tissues are treated as the enemy. Or a persistent irritant like cigarette smoke or cholesterol plaques.",
      "When the response shifts from acute to chronic, the cells change. Neutrophils — the fast responders of acute inflammation — have long gone. In their place are macrophages and lymphocytes: slower, longer-lived cells built for a sustained fight.",
      "Macrophages become the dominant cell. They keep trying to clear the trigger, keep releasing cytokines, and keep calling in more immune cells. This is the cycle that never closes — each macrophage signal recruits another wave that will do the same thing.",
      "Lymphocytes — T and B cells — also accumulate. They drive an ongoing adaptive immune response against the trigger, and in autoimmune diseases they're the reason the body is attacking itself. Their signals can themselves damage normal tissue.",
      "Over time, the tissue starts to scar. Fibroblasts receive constant signals to lay down collagen, and the tissue becomes stiff and fibrotic. This is why chronic inflammatory diseases usually end in organ dysfunction — the scarring replaces working tissue.",
      "Meanwhile, the immune cells' own enzymes and reactive molecules destroy normal tissue around the site. The response meant to protect the tissue ends up being the thing that damages it. This is the paradox at the heart of chronic inflammation.",
      "When the trigger can't be destroyed, the body tries to wall it off instead. Macrophages cluster around it and fuse into multinucleate giant cells, forming a granuloma. A granuloma contains the problem — like the tubercles of TB — but it never actually resolves it.",
      "This is why so many long-term diseases come back to chronic inflammation. Rheumatoid arthritis, atherosclerosis, inflammatory bowel disease, chronic hepatitis, tuberculosis, and many others — all share the same underlying mechanism: an inflammatory response that doesn't know how to stop.",
      "Putting it together: acute inflammation is short and effective, neutrophils do the work, and the tissue returns to normal. Chronic inflammation is long, self-sustaining, dominated by macrophages and lymphocytes, and it damages the tissue it was meant to protect. Same system, two very different outcomes.",
    ],
    stepFocus: [
      ["whole"],
      ["trigger"],
      ["cells"],
      ["macrophages"],
      ["lymphocytes"],
      ["fibrosis"],
      ["tissue-damage"],
      ["granuloma"],
      ["examples"],
      ["nec-vs-apop"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:chronic-inflammation"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The scene shows the chronic infiltrate once we reach the cell-
      // change step, and stays visible after. The vessel stays visible
      // but is not the focus any more — in chronic inflammation it's
      // the tissue that matters, not the blood vessels.
      const scene = {
        vasodilation: activeStep >= 2,
        permeability: activeStep >= 2,
        recruitment:  false,
        phagocytosis: false,
        resolution:   false,
        chronic:      activeStep >= 2,
      };

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The evolving tissue scene — macrophages and lymphocytes
             infiltrate the tissue as the narration runs. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasInflammationScene({
              cx: 450, cy: 320, width: 540, height: 320,
              ...scene,
              highlight: false,
            })}
          </g>

          {/* Trigger callout — top-left, only on its own step. */}
          {isHot("trigger") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="200" height="90" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="160" y="125" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">PERSISTENT TRIGGER</text>
              <text x="160" y="145" textAnchor="middle" fontSize="9" fill="var(--text-2)">chronic infection</text>
              <text x="160" y="160" textAnchor="middle" fontSize="9" fill="var(--text-2)">foreign body</text>
              <text x="160" y="175" textAnchor="middle" fontSize="9" fill="var(--text-2)">autoimmune target</text>
            </g>
          )}

          {/* Cells callout — right side, comparison of cell types. */}
          {isHot("cells") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="670" y="100" width="200" height="120" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="770" y="125" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>THE CELL CHANGE</text>
              <text x="770" y="146" textAnchor="middle" fontSize="9" fill="var(--text-2)">Acute: neutrophils</text>
              <text x="770" y="162" textAnchor="middle" fontSize="9" fill="var(--text-2)">Chronic: macrophages</text>
              <text x="770" y="178" textAnchor="middle" fontSize="9" fill="var(--text-2)">+ lymphocytes</text>
              <text x="770" y="200" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">slower, longer-lived cells</text>
            </g>
          )}

          {/* Macrophages callout */}
          {isHot("macrophages") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M680,440 Q640,440 620,440"
                fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5"
                strokeDasharray="4 4" opacity="0.85"
              />
              <circle cx="620" cy="440" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="680" y="410" width="190" height="80" rx="12" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="775" y="435" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">MACROPHAGES</text>
              <text x="775" y="453" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">the dominant cell of chronic</text>
              <text x="775" y="467" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">inflammation — keep signalling,</text>
              <text x="775" y="481" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">keep recruiting, cycle never closes</text>
            </g>
          )}

          {/* Lymphocytes callout */}
          {isHot("lymphocytes") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M680,540 Q640,540 620,530"
                fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5"
                strokeDasharray="4 4" opacity="0.85"
              />
              <circle cx="620" cy="530" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="680" y="500" width="190" height="80" rx="12" fill="var(--bg-2)" stroke="#5B21B6" strokeWidth="2" />
              <text x="775" y="525" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#5B21B6">LYMPHOCYTES</text>
              <text x="775" y="543" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">T and B cells accumulate —</text>
              <text x="775" y="557" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">an ongoing adaptive response,</text>
              <text x="775" y="571" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">sometimes against self</text>
            </g>
          )}

          {/* Fibrosis callout — purple fibrotic strands overlaid. */}
          {isHot("fibrosis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="440" width="190" height="90" rx="12" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="155" y="465" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">FIBROSIS</text>
              <text x="155" y="483" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">fibroblasts lay down collagen</text>
              <text x="155" y="497" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">continuously — tissue becomes</text>
              <text x="155" y="511" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">stiff and loses function</text>
            </g>
          )}

          {/* Tissue damage callout */}
          {isHot("tissue-damage") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <circle cx="450" cy="320" r="220" fill="none" stroke="#C0392B" strokeWidth="3" strokeDasharray="8 6" opacity="0.75" />
              <rect x="330" y="550" width="240" height="60" rx="12" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="450" y="574" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">TISSUE DESTRUCTION</text>
              <text x="450" y="592" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">the response itself damages the tissue</text>
            </g>
          )}

          {/* Granuloma inset — a small diagram showing the ring of
             macrophages around a trapped trigger. */}
          {isHot("granuloma") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="330" y="550" width="240" height="60" rx="12" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="450" y="574" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">GRANULOMA</text>
              <text x="450" y="592" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">macrophages wall off the trigger — contains, doesn't cure</text>
              <circle cx="200" cy="300" r="48" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
              {[[200, 252], [200, 348], [152, 300], [248, 300]].map(([px, py], i) => (
                <circle key={i} cx={px} cy={py} r="9" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
              ))}
              <ellipse cx="200" cy="300" rx="10" ry="6" fill="#C0392B" stroke="#8C1C12" strokeWidth="1" />
              <text x="200" y="270" textAnchor="middle" fontSize="8" fill="var(--text-2)">walled-off trigger</text>
            </g>
          )}

          {/* Examples callout — bottom right, list of common diseases. */}
          {isHot("examples") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="660" y="150" width="210" height="150" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="765" y="175" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>COMMON EXAMPLES</text>
              {["rheumatoid arthritis", "atherosclerosis", "IBD (Crohn's / UC)", "chronic hepatitis", "tuberculosis"].map((e, i) => (
                <text key={i} x="765" y={198 + i * 18} textAnchor="middle" fontSize="9" fill="var(--text-2)">{e}</text>
              ))}
            </g>
          )}

          {/* Final contrast callout — acute vs chronic summary. */}
          {isHot("contrast") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="240" height="130" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="180" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C0392B">ACUTE</text>
              <text x="180" y="145" textAnchor="middle" fontSize="9" fill="var(--text-2)">days</text>
              <text x="180" y="162" textAnchor="middle" fontSize="9" fill="var(--text-2)">neutrophils</text>
              <text x="180" y="179" textAnchor="middle" fontSize="9" fill="var(--text-2)">resolves cleanly</text>
              <rect x="320" y="100" width="240" height="130" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="440" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8B5CF6">CHRONIC</text>
              <text x="440" y="145" textAnchor="middle" fontSize="9" fill="var(--text-2)">months to years</text>
              <text x="440" y="162" textAnchor="middle" fontSize="9" fill="var(--text-2)">macrophages + lymphocytes</text>
              <text x="440" y="179" textAnchor="middle" fontSize="9" fill="var(--text-2)">ongoing damage + fibrosis</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Tissue</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">The response that never ends — and damages what it was meant to protect</text>
        </svg>
      );
    },
  },

  /* =========================================================
     ACQUIRED IMMUNE RESPONSE
     Topic: General Pathology (pat), Topic 09 (index 8).
     Fourth diagram in the pathology family. Closes the loop
     that ph2:immune-system opened: shows how the adaptive
     immune system is triggered, and what it does once it's
     running. Reuses atlasAntibody, atlasLymphNode,
     atlasWhiteCell, atlasBloodCell. Adds one new primitive:
     atlasAPC (antigen-presenting cell).
     ========================================================= */
  "pat:acquired-immune-response": {
    id: "pat:acquired-immune-response",
    type: "diagram",
    title: "The Acquired Immune Response — Precision Defence",
    topic: { courseId: "pat", topicIndex: 8 },
    parent: null,
    summary: "The adaptive — acquired — immune system is the body's precision weapon. Unlike the innate system, which responds the same way to any threat, the adaptive system learns the exact identity of a specific pathogen, builds a defence tailored to it, and remembers it for years. It takes days to spin up the first time, but it's the reason vaccines work: the second time the same pathogen appears, the response is fast, strong, and often stops the infection before you notice it.",
    labels: [
      { id: "whole",        name: "The Whole Response",         desc: "Antigen presentation → T cell activation → B cell help → antibody production → memory. One coordinated sequence." },
      { id: "apc",          name: "Antigen-Presenting Cell",    desc: "A dendritic cell or macrophage that has engulfed a threat, digested it, and is showing a fragment on its surface inside an MHC molecule." },
      { id: "mhc",          name: "MHC Molecule",               desc: "The molecular 'display tray' an APC uses to hold a piece of antigen so a T cell can recognise it. Different MHC types are why tissue matching matters in transplants." },
      { id: "helper-t",     name: "Helper T Cell",              desc: "Recognises antigen on the APC and becomes activated. It then releases cytokines that coordinate the whole response — the conductor of the adaptive orchestra." },
      { id: "b-cell",       name: "B Cell",                     desc: "Recognises antigen directly, but needs confirmation from a helper T cell before it commits. Once activated, it multiplies and produces antibodies." },
      { id: "plasma-cell",  name: "Plasma Cell",                desc: "What a fully activated B cell becomes. A dedicated antibody factory, producing thousands of identical antibody molecules per second." },
      { id: "antibody",     name: "Antibodies",                 desc: "Y-shaped proteins that bind one specific antigen. They neutralise pathogens, tag them for destruction, and clump them together for easier clearance." },
      { id: "cytotoxic-t",  name: "Cytotoxic T Cell",           desc: "Kills cells that are already infected — the ones antibodies can't reach. It recognises infected cells by the viral peptides they display on their own MHC." },
      { id: "memory",       name: "Memory Cells",               desc: "Long-lived B and T cells left behind after the infection. On second exposure, they respond within hours instead of days — the basis of vaccination." },
      { id: "lymph-node",   name: "Lymph Node",                 desc: "Where it all happens. APC, helper T cell, B cell and cytotoxic T cell all meet here, in the same physical space, at the same time." },
    ],
    narration: [
      "The adaptive immune system is the body's precision weapon. Unlike the innate system — which responds the same way to any threat — the adaptive system learns the exact identity of a specific pathogen, builds a defence tailored to it, and remembers it for years. The trade-off: it takes days to spin up the first time.",
      "It starts with an antigen-presenting cell. A dendritic cell or macrophage engulfs a threat, digests it, and displays a fragment of it on its surface. That fragment is held in a specialised molecular tray called an MHC molecule — the same MHC that decides whether organs are compatible in a transplant.",
      "Helper T cells are the next step. When a helper T cell meets an APC showing the right antigen, it locks onto the MHC-antigen complex and becomes activated. This is the moment the adaptive response actually starts — the innate system has successfully handed the threat over.",
      "An activated helper T cell then does something critical: it releases cytokines that coordinate everything else. It tells B cells to start making antibodies, tells cytotoxic T cells to start killing, and amplifies the whole response. Helper T cells are the conductors of the adaptive orchestra.",
      "B cells recognise antigen directly, but they don't commit without confirmation. When a B cell's receptor binds antigen and a helper T cell confirms it, the B cell activates, multiplies, and starts producing antibodies tailored to that exact antigen.",
      "A fully activated B cell becomes a plasma cell — a dedicated antibody factory. Each plasma cell produces thousands of identical antibody molecules per second. Antibodies pour into the blood and lymph, ready to bind the specific pathogen that started the whole process.",
      "Antibodies have three main jobs. They neutralise pathogens by physically blocking the parts they need to infect cells. They tag pathogens for destruction by phagocytes and complement. And they clump pathogens together, making them easier to clear.",
      "Meanwhile, cytotoxic T cells handle the threats antibodies can't reach: cells that are already infected. A cytotoxic T cell recognises an infected cell by the viral peptides it displays on its own MHC, then kills it directly — stopping the virus from spreading.",
      "Once the infection is under control, most of the activated cells die off. But a small population of long-lived memory B and T cells stays behind. On second exposure to the same pathogen, these memory cells respond within hours instead of days — often so fast that you never notice you were infected. That's the entire basis of vaccination.",
      "The whole response happens in the lymph node. APC, helper T cell, B cell and cytotoxic T cell all need to meet in the same physical space at the same time. That's what lymph nodes are for — they're the immune system's coordination hubs. Enlarged lymph nodes during an infection are a sign the adaptive response is working.",
    ],
    stepFocus: [
      ["whole"],
      ["apc"],
      ["mhc"],
      ["helper-t"],
      ["b-cell"],
      ["plasma-cell"],
      ["antibody"],
      ["cytotoxic-t"],
      ["memory"],
      ["lymph-node"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:acquired-immune-response"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* ---- Lymph node — the physical location of the whole scene.
             Drawn large and centred, with the various cell types around
             it, so the student reads "this happens in a lymph node". ---- */}
          <g style={{ cursor: cur }} onClick={click("lymph-node")} filter={hotFilter("lymph-node")}>
            {atlasLymphNode({ cx: 450, cy: 320, scale: 3.6 })}
            <circle cx="450" cy="320" r="130" fill="none" {...ring("lymph-node")} pointerEvents="none" />
            <text x="450" y="470" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)">Lymph node — the meeting place</text>
          </g>

          {/* ---- APC on the left, presenting antigen to a helper T cell ---- */}
          <g style={{ cursor: cur }} onClick={click("apc")} filter={hotFilter("apc")}>
            {atlasAPC({ cx: 180, cy: 240, r: 32, presenting: activeStep >= 1, highlight: isHot("apc") })}
            <text x="180" y="300" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Antigen-presenting cell</text>
            <text x="180" y="313" textAnchor="middle" fontSize="9" fill="var(--text-2)">shows antigen to T cells</text>
            <circle cx="180" cy="240" r="52" fill="none" {...ring("apc")} pointerEvents="none" />
          </g>

          {/* MHC callout — leader line to the APC's MHC molecule. */}
          {isHot("mhc") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <path
                d="M210,220 Q260,190 310,170"
                fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.5"
                strokeDasharray="4 4" opacity="0.85"
              />
              <circle cx="210" cy="220" r="4" fill={ATLAS_COLORS.trunk} />
              <rect x="60" y="90" width="180" height="80" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="150" y="115" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>MHC MOLECULE</text>
              <text x="150" y="133" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">molecular display tray</text>
              <text x="150" y="148" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">holds antigen for T cells</text>
            </g>
          )}

          {/* ---- Helper T cell on the top-right, receiving the signal ---- */}
          <g style={{ cursor: cur }} onClick={click("helper-t")} filter={hotFilter("helper-t")}>
            {atlasWhiteCell({ cx: 720, cy: 240, r: 26 })}
            <text x="720" y="295" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Helper T cell</text>
            <text x="720" y="308" textAnchor="middle" fontSize="9" fill="var(--text-2)">coordinates the response</text>
            <circle cx="720" cy="240" r="42" fill="none" {...ring("helper-t")} pointerEvents="none" />
          </g>

          {/* Communication arrows between APC and Helper T */}
          {activeStep >= 3 && (
            <g pointerEvents="none">
              <path
                d="M215,240 Q400,215 690,240"
                fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="1.6"
                strokeDasharray="5 4" opacity="0.7"
              />
              <polygon points="690,240 682,236 682,244" fill={ATLAS_COLORS.trunk} />
              <text x="450" y="215" textAnchor="middle" fontSize="9" fontWeight="600" fill={ATLAS_COLORS.trunk}>antigen recognition →</text>
            </g>
          )}

          {/* ---- B cell on the bottom-left ---- */}
          <g style={{ cursor: cur }} onClick={click("b-cell")} filter={hotFilter("b-cell")}>
            {atlasWhiteCell({ cx: 180, cy: 440, r: 26 })}
            <text x="180" y="495" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">B cell</text>
            <text x="180" y="508" textAnchor="middle" fontSize="9" fill="var(--text-2)">recognises antigen directly</text>
            <circle cx="180" cy="440" r="42" fill="none" {...ring("b-cell")} pointerEvents="none" />
          </g>

          {/* ---- Plasma cell below B cell, only after the B cell is
             activated by the helper T ---- */}
          {activeStep >= 5 && (
            <g style={{ cursor: cur }} onClick={click("plasma-cell")} filter={hotFilter("plasma-cell")}>
              {atlasWhiteCell({ cx: 320, cy: 540, r: 30 })}
              <text x="320" y="595" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Plasma cell</text>
              <text x="320" y="608" textAnchor="middle" fontSize="9" fill="var(--text-2)">antibody factory</text>
              <circle cx="320" cy="540" r="48" fill="none" {...ring("plasma-cell")} pointerEvents="none" />
            </g>
          )}

          {/* ---- Antibodies — a cluster shown to the right of the plasma
             cell, growing as the student progresses past step 7 ---- */}
          {activeStep >= 6 && (
            <g style={{ cursor: cur }} onClick={click("antibody")} filter={hotFilter("antibody")}>
              {[
                [520, 540, 1.2],
                [600, 520, 1.4],
                [680, 545, 1.2],
                [560, 590, 1.1],
                [640, 590, 1.3],
              ].map(([ax, ay, s], i) => (
                <g key={i}>
                  {atlasAntibody({ cx: ax, cy: ay, scale: s, bound: false, highlight: isHot("antibody") })}
                </g>
              ))}
              <text x="600" y="625" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Antibodies</text>
              <circle cx="600" cy="560" r="90" fill="none" {...ring("antibody")} pointerEvents="none" />
            </g>
          )}

          {/* ---- Cytotoxic T cell on the right ---- */}
          <g style={{ cursor: cur }} onClick={click("cytotoxic-t")} filter={hotFilter("cytotoxic-t")}>
            {atlasWhiteCell({ cx: 720, cy: 460, r: 26 })}
            <text x="720" y="515" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text)">Cytotoxic T cell</text>
            <text x="720" y="528" textAnchor="middle" fontSize="9" fill="var(--text-2)">kills infected cells</text>
            <circle cx="720" cy="460" r="42" fill="none" {...ring("cytotoxic-t")} pointerEvents="none" />
          </g>

          {/* ---- Memory cells inset — bottom right, appears at the end ---- */}
          {activeStep >= 8 && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="660" y="540" width="180" height="60" rx="12" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="5 4" />
              <text x="750" y="565" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>MEMORY CELLS</text>
              <text x="750" y="583" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">respond in hours on second exposure</text>
            </g>
          )}

          {/* ---- Static region labels ---- */}
          <text x="450" y="30"  textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Acquired (adaptive) immune response</text>
          <text x="450" y="612" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Antigen → T cell → B cell → antibody → memory</text>
        </svg>
      );
    },
  },

  /* =========================================================
     HAEMODYNAMIC DISORDERS
     Topic: General Pathology (pat), Topic 03 (index 2).
     Fifth diagram in the pathology family. Reuses atlasVessel,
     atlasBloodCell, atlasPlatelet. Adds two new primitives:
     atlasThrombus and atlasEmbolus. Covers the pathologies of
     blood flow — what happens when the normal circulation
     goes wrong.
     ========================================================= */
  "pat:haemodynamic-disorders": {
    id: "pat:haemodynamic-disorders",
    type: "diagram",
    title: "Haemodynamic Disorders — When Blood Flow Goes Wrong",
    topic: { courseId: "pat", topicIndex: 2 },
    parent: null,
    summary: "Blood has to keep moving, in the right direction, at the right pressure, inside vessels that stay sealed. When any of those fail — a clot forms where it shouldn't, a fragment breaks off and travels, a vessel bursts, or the pressure collapses — the result is a haemodynamic disorder. They include thrombosis, embolism, infarction, haemorrhage, and shock. Together they're responsible for the majority of sudden deaths in adults: heart attacks, strokes, and pulmonary emboli are all haemodynamic.",
    labels: [
      { id: "whole",       name: "The Whole Picture",       desc: "Thrombosis, embolism, infarction, haemorrhage, and shock — five faces of the same underlying problem: flow gone wrong." },
      { id: "normal",      name: "Normal Flow",             desc: "Laminar flow, intact endothelium, balanced clotting. Blood travels smoothly because nothing disturbs it." },
      { id: "thrombus",    name: "Thrombus",                desc: "A clot that forms inside a vessel while blood is still flowing. Anchored to the wall, and dangerous because it can block the lumen or break off." },
      { id: "virchow",     name: "Virchow's Triad",         desc: "The three conditions that cause thrombosis: stasis of flow, injury to the vessel wall, and hypercoagulability of the blood." },
      { id: "embolus",     name: "Embolus",                 desc: "A mass travelling in the bloodstream — usually a fragment of thrombus, but sometimes fat, air, or tumour. It lodges downstream where the vessel narrows." },
      { id: "infarction",  name: "Infarction",              desc: "Tissue death caused by blocked blood supply. The infarcted tissue is pale (in solid organs) or red (in loose tissue or when flow is restored)." },
      { id: "infarct-types", name: "Types of Infarct",      desc: "White infarcts occur in solid organs with end-arterial supply (kidney, heart, spleen). Red infarcts occur in loose tissue, dual-supply organs (lung), or after venous occlusion." },
      { id: "haemorrhage", name: "Haemorrhage",             desc: "Bleeding out of a vessel. Can be external, internal, or into a body cavity. Severity depends on rate, volume, and location — a small bleed in the brain can be fatal." },
      { id: "shock",       name: "Shock",                   desc: "Whole-body failure of perfusion. Cells don't get enough blood, switch to anaerobic metabolism, and eventually die. Cardiogenic, hypovolaemic, distributive, and obstructive types." },
      { id: "clinical",    name: "Clinical Examples",       desc: "Myocardial infarction (heart attack), stroke, deep vein thrombosis, pulmonary embolism, and disseminated intravascular coagulation — all haemodynamic disorders." },
    ],
    narration: [
      "Blood has to keep moving, in the right direction, at the right pressure, inside vessels that stay sealed. When any of those fail, the result is a haemodynamic disorder. Together, they account for the majority of sudden deaths in adults — heart attacks, strokes, and pulmonary emboli are all in this family.",
      "Normal flow is laminar — smooth, layered, undisturbed. The vessel lining is intact, the blood's clotting system is balanced, and nothing is triggering the coagulation cascade. Any deviation from this state is what starts the trouble.",
      "A thrombus is a clot that forms inside a vessel while blood is still flowing past it. Unlike a clot that forms outside the body or after death, a thrombus is anchored to the vessel wall, and it shows layered bands called lines of Zahn. That anchoring is what makes it dangerous — a free-floating clot would just wash away.",
      "Three things cause thrombosis, and they're known as Virchow's triad. First, stasis — blood sitting still, as in a long flight or after surgery. Second, injury to the vessel wall — as in atherosclerosis or after a catheter. Third, hypercoagulability — blood that clots too easily, as in pregnancy, cancer, or inherited clotting disorders.",
      "A thrombus can break off and travel. When it does, it becomes an embolus. Most emboli are fragments of thrombus, but they can also be fat from a fractured bone, air from a surgical or diving accident, or a fragment of tumour. Whatever it's made of, it moves with the bloodstream until it reaches a vessel too narrow to pass.",
      "When an embolus lodges and blocks flow, the tissue downstream loses its blood supply. If the blockage isn't relieved quickly, that tissue dies. This is infarction — and the dead tissue is called an infarct. Time is tissue: the sooner the blockage is cleared, the more can be saved.",
      "There are two main types of infarct. White infarcts happen in solid organs with end-arterial supply — the kidney, the heart, the spleen. Blood can't get in from anywhere else, so the tissue becomes pale and anaemic. Red infarcts happen in loose tissue, in organs with dual blood supply like the lung, or after venous occlusion — the tissue becomes engorged with blood that can't escape.",
      "Haemorrhage is the opposite problem — blood escaping from a vessel. It can be external, internal into a tissue, or into a body cavity. Severity depends on how fast it's bleeding, how much has been lost, and where it's collecting. A small haemorrhage in the brainstem can be fatal; a much larger one in a limb may not be.",
      "At the whole-body level, if perfusion fails completely, you get shock. Tissues don't get enough blood, cells switch to anaerobic metabolism, lactic acid builds up, and organ function deteriorates. There are four broad types — cardiogenic (the pump has failed), hypovolaemic (not enough blood volume), distributive (vessels are dilated and pressure has collapsed), and obstructive (something is physically preventing flow).",
      "Putting it together: normal flow is disturbed by Virchow's triad, which produces a thrombus. The thrombus can embolise and travel, blocking a downstream vessel and causing infarction. Vessels can also burst and haemorrhage, and if the whole system fails, shock. Myocardial infarction, stroke, deep vein thrombosis, and pulmonary embolism — the four biggest killers in adult medicine — are all haemodynamic disorders.",
    ],
    stepFocus: [
      ["whole"],
      ["normal"],
      ["thrombus"],
      ["virchow"],
      ["embolus"],
      ["infarction"],
      ["infarct-types"],
      ["haemorrhage"],
      ["shock"],
      ["clinical"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:haemodynamic-disorders"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The main vessel runs across the middle. What's in it changes
      // as the student steps through the phases.
      const showThrombus  = activeStep >= 2 && activeStep < 4;
      const showEmbolus   = activeStep >= 4 && activeStep < 5;
      const showInfarct   = activeStep >= 5 && activeStep < 7;
      const showHaem      = activeStep === 7;
      const showShock     = activeStep === 8;

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* Main vessel running across the diagram — the central scene. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasVessel({ d: "M80,320 Q450,300 820,320", oxygenated: true, width: 40 })}
            {/* Red cells flowing through, drawn at several positions */}
            {[
              [140, 316], [200, 314], [260, 312], [340, 310], [420, 308],
              [500, 310], [580, 312], [660, 314], [740, 316],
            ].map(([rx, ry], i) => (
              <ellipse key={i} cx={rx} cy={ry} rx="6" ry="4" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" opacity="0.85" />
            ))}
            <text x="450" y="380" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-2)">Blood vessel</text>
          </g>

          {/* Normal flow label anchor */}
          <g style={{ cursor: cur }} onClick={click("normal")} filter={hotFilter("normal")}>
            <text x="450" y="290" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-2)" pointerEvents="none">laminar flow — undisturbed</text>
          </g>

          {/* Thrombus — appears on steps 3-4, drawn inside the vessel. */}
          {showThrombus && (
            <g style={{ cursor: cur }} onClick={click("thrombus")} filter={hotFilter("thrombus")}>
              {atlasThrombus({
                cx: 480, cy: 300, length: 120, thickness: 30,
                occlusive: activeStep >= 3,
                embolised: false,
                highlight: isHot("thrombus"),
              })}
              <circle cx="480" cy="300" r="80" fill="none" {...ring("thrombus")} pointerEvents="none" />
            </g>
          )}

          {/* Virchow's triad inset — three labelled circles fanning off
             the thrombus, shown only on its own step. */}
          {isHot("virchow") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="80" width="220" height="140" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="170" y="106" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>VIRCHOW'S TRIAD</text>
              <text x="170" y="128" textAnchor="middle" fontSize="9" fill="var(--text-2)">1. Stasis of flow</text>
              <text x="170" y="146" textAnchor="middle" fontSize="9" fill="var(--text-2)">2. Endothelial injury</text>
              <text x="170" y="164" textAnchor="middle" fontSize="9" fill="var(--text-2)">3. Hypercoagulability</text>
              <text x="170" y="192" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">any one alone can start a clot</text>
            </g>
          )}

          {/* Embolus — a fragment travelling downstream from the
             thrombus position. */}
          {showEmbolus && (
            <g style={{ cursor: cur }} onClick={click("embolus")} filter={hotFilter("embolus")}>
              {atlasEmbolus({
                cx: 680, cy: 310, r: 18, type: "thrombus",
                highlight: isHot("embolus"),
              })}
              <circle cx="680" cy="310" r="40" fill="none" {...ring("embolus")} pointerEvents="none" />
              <text x="680" y="360" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text-2)">travelling embolus</text>
            </g>
          )}

          {/* Infarction — a wedge of tissue with a blocked vessel
             leading to it, shown on steps 6-7. */}
          {showInfarct && (
            <g style={{ cursor: cur }} onClick={click("infarction")} filter={hotFilter("infarction")}>
              {/* Downstream vessel narrowing */}
              {atlasVessel({ d: "M760,320 Q800,400 800,480", oxygenated: true, width: 20 })}
              {/* Infarct wedge — pale (white infarct) */}
              <path
                d="M770,500 L860,540 L830,600 L740,570 Z"
                fill="#F5E8E0" stroke="#B63B2E" strokeWidth="2"
              />
              <text x="800" y="575" textAnchor="middle" fontSize="10" fontWeight="700" fill="#B63B2E">infarct</text>
              <circle cx="800" cy="540" r="70" fill="none" {...ring("infarction")} pointerEvents="none" />
            </g>
          )}

          {/* Infarct types inset — the two main types, side by side. */}
          {isHot("infarct-types") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="440" width="160" height="110" rx="14" fill="var(--bg-2)" stroke="#B63B2E" strokeWidth="2" />
              <text x="140" y="462" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#B63B2E">WHITE INFARCT</text>
              <path d="M100,510 L160,490 L180,520 L120,540 Z" fill="#F5E8E0" stroke="#B63B2E" strokeWidth="1.4" />
              <text x="140" y="545" textAnchor="middle" fontSize="7.5" fill="var(--text-2)">solid organs</text>
              <rect x="240" y="440" width="160" height="110" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="320" y="462" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">RED INFARCT</text>
              <path d="M280,510 L340,490 L360,520 L300,540 Z" fill="#E53935" stroke="#8C1C12" strokeWidth="1.4" opacity="0.75" />
              <text x="320" y="545" textAnchor="middle" fontSize="7.5" fill="var(--text-2)">loose / dual supply</text>
            </g>
          )}

          {/* Haemorrhage — a vessel with a break, blood escaping. */}
          {showHaem && (
            <g style={{ cursor: cur }} onClick={click("haemorrhage")} filter={hotFilter("haemorrhage")}>
              {/* Rupture in the vessel */}
              <path d="M450,320 L450,340" stroke="#8C1C12" strokeWidth="6" strokeLinecap="round" />
              {/* Blood droplets escaping */}
              {[[440, 360], [455, 380], [430, 400], [465, 415], [445, 435]].map(([dx, dy], i) => (
                <ellipse key={i} cx={dx} cy={dy} rx="7" ry="5" fill="#E53935" stroke="#8C1C12" strokeWidth="0.8" opacity="0.9" />
              ))}
              <text x="450" y="470" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">haemorrhage</text>
              <circle cx="450" cy="390" r="70" fill="none" {...ring("haemorrhage")} pointerEvents="none" />
            </g>
          )}

          {/* Shock — whole-body failure, shown as a body outline with
             faded/blue-tinted extremities. */}
          {showShock && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="440" width="220" height="130" rx="14" fill="var(--bg-2)" stroke="#5B21B6" strokeWidth="2" />
              <text x="750" y="465" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5B21B6">SHOCK</text>
              <text x="750" y="485" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">whole-body failure of perfusion</text>
              <text x="750" y="503" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">cardiogenic · hypovolaemic</text>
              <text x="750" y="521" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">distributive · obstructive</text>
              <text x="750" y="545" textAnchor="middle" fontSize="8" fill="var(--text-3)">cells switch to anaerobic metabolism</text>
            </g>
          )}

          {/* Clinical examples — shown on the last step. */}
          {isHot("clinical") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="80" width="220" height="140" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="170" y="106" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>CLINICAL EXAMPLES</text>
              <text x="170" y="130" textAnchor="middle" fontSize="9" fill="var(--text-2)">myocardial infarction</text>
              <text x="170" y="148" textAnchor="middle" fontSize="9" fill="var(--text-2)">stroke</text>
              <text x="170" y="166" textAnchor="middle" fontSize="9" fill="var(--text-2)">deep vein thrombosis</text>
              <text x="170" y="184" textAnchor="middle" fontSize="9" fill="var(--text-2)">pulmonary embolism</text>
              <text x="170" y="202" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">the four biggest killers</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Haemodynamic disorders</text>
          <text x="450" y="612" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">When flow, vessel, or pressure goes wrong</text>
        </svg>
      );
    },
  },

  /* =========================================================
     CELLULAR ADAPTATION, CELL INJURY AND CELL DEATH
     Topic: General Pathology (pat), Topic 02 (index 1).
     Sixth diagram in the pathology family. Introduces the
     atlasCellInjury primitive. Reuses atlasWhiteCell,
     atlasVessel. Covers what cells do under stress: adapt,
     get injured, and die - two ways.
     ========================================================= */
  "pat:cell-injury": {
    id: "pat:cell-injury",
    type: "diagram",
    title: "Cellular Adaptation, Cell Injury and Cell Death",
    topic: { courseId: "pat", topicIndex: 1 },
    parent: null,
    summary: "Every cell in your body is constantly adapting to its environment. When the stress is mild, cells adapt — they get bigger, smaller, multiply, or change type. When the stress is too much, they get injured — first reversibly, then irreversibly. And when the injury can't be repaired, they die. There are two ways cells die: necrosis (messy, inflammatory) and apoptosis (clean, programmed). Every disease in pathology comes back to one of these outcomes.",
    labels: [
      { id: "whole",        name: "The Whole Story",       desc: "Adapt → injure → die. Every cell under stress follows this same progression, and every disease sits somewhere on it." },
      { id: "normal",       name: "Normal Cell",           desc: "Baseline state: intact membrane, normal nucleus, steady-state metabolism. The starting point for every change." },
      { id: "stressors",    name: "Stressors",             desc: "What pushes a cell away from normal: hypoxia, toxins, infection, physical trauma, radiation, metabolic imbalance." },
      { id: "adaptation",   name: "Adaptation",            desc: "Reversible change that lets the cell survive. Four main types: hypertrophy, atrophy, hyperplasia, metaplasia." },
      { id: "reversible",   name: "Reversible Injury",     desc: "Cell swelling, membrane blebs, ER swelling. The cell is struggling but can fully recover if the stress is removed." },
      { id: "irreversible", name: "Irreversible Injury",   desc: "Membrane breaks, calcium floods in, mitochondria fail. The point of no return — the cell is now committed to dying." },
      { id: "necrosis",     name: "Necrosis",              desc: "Messy death. The cell ruptures, spills its contents, and triggers inflammation. This is what happens after a heart attack or a severe burn." },
      { id: "apoptosis",    name: "Apoptosis",             desc: "Clean, programmed death. The cell shrinks, its nucleus condenses, it buds into apoptotic bodies, and it's quietly eaten by macrophages. No inflammation." },
      { id: "nec-vs-apop",  name: "Necrosis vs Apoptosis", desc: "Necrosis: pathological, inflammatory, cell bursts. Apoptosis: physiological or pathological, silent, cell shrinks." },
      { id: "clinical",     name: "Clinical Examples",     desc: "Myocardial infarction (necrosis), cancer therapy (apoptosis), muscle hypertrophy from exercise, endometrial atrophy after menopause — every disease has a cellular-level explanation." },
    ],
    narration: [
      "Every cell in your body is constantly adapting to its environment. When conditions change, a cell either adapts, gets injured, or dies. That progression — from adaptation through injury to death — is the underlying story of every disease in pathology.",
      "The starting point is a normal cell: intact membrane, normal nucleus, balanced metabolism. Stressors push cells away from this state. The classic stressors are hypoxia (not enough oxygen), toxins, infections, physical trauma, radiation, and metabolic imbalances like high glucose.",
      "When the stress is mild and sustained, cells adapt. There are four main types. Hypertrophy: the cell gets bigger. Atrophy: it gets smaller. Hyperplasia: it multiplies. Metaplasia: it changes into a different normal cell type. Each is a survival strategy.",
      "If the stress is too severe for adaptation, the cell gets injured. First reversibly — the cell swells, blebs form on its membrane, and the endoplasmic reticulum dilates. Remove the stress now, and the cell fully recovers. There's no permanent damage yet.",
      "If the stress continues, the injury becomes irreversible. Membranes rupture, calcium floods into the cell, mitochondria fail, and ATP runs out. This is the point of no return. The cell is now committed to dying, even if the stress is removed.",
      "The cell can die in two main ways. The first is necrosis — the messy kind. The cell ruptures, spills its contents into the surrounding tissue, and triggers an inflammatory response. This is what happens after a heart attack, a severe burn, or a bacterial infection.",
      "The second way is apoptosis — the clean, programmed kind. The cell shrinks, its nucleus condenses, and it buds into small membrane-bound fragments called apoptotic bodies. These are quietly eaten by macrophages. No inflammation, no mess.",
      "The difference between the two matters clinically. Necrosis is always pathological and always inflammatory. Apoptosis can be physiological — it's how your body removes old cells and shapes developing tissues — and it's silent. Cancer cells often avoid apoptosis when they should undergo it.",
      "Both patterns happen everywhere in the body. Myocardial infarction is a classic necrosis — a patch of heart muscle dies from lack of oxygen. Endometrial shedding during menstruation is a classic apoptosis. Muscle hypertrophy from weight training, and atrophy from a cast, are both adaptations.",
      "Putting it all together: cells adapt to stress, then get injured reversibly, then irreversibly, then die by necrosis or apoptosis. Every disease in pathology is either an adaptation, an injury, a death, or the body's response to one of those. Once you understand this arc, the rest of pathology is variations on it.",
    ],
    stepFocus: [
      ["whole"],
      ["normal"],
      ["stressors"],
      ["adaptation"],
      ["reversible"],
      ["irreversible"],
      ["necrosis"],
      ["apoptosis"],
      ["nec-vs-apop"],
      ["clinical"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:cell-injury"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The middle of the diagram holds the current-state cell. Its
      // state maps from the narration step.
      const cellState = [
        "normal",       // step 0 (whole)
        "normal",       // step 1 (normal)
        "normal",       // step 2 (stressors)
        "hypertrophy",  // step 3 (adaptation)
        "reversible",   // step 4 (reversible)
        "irreversible", // step 5 (irreversible)
        "necrosis",     // step 6 (necrosis)
        "apoptosis",    // step 7 (apoptosis)
        "normal",       // step 8 (contrast)
        "normal",       // step 9 (clinical)
      ][activeStep] || "normal";

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* Background — a soft tissue patch, so the cell reads as
             sitting inside tissue not floating on blank space. */}
          <ellipse cx="450" cy="310" rx="400" ry="260" fill="#FBE9E7" opacity="0.25" />

          {/* ---- The main cell in the centre — changes state per step ---- */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasCellInjury({
              cx: 450, cy: 280, r: 55,
              state: cellState,
              highlight: false,
            })}
            <circle cx="450" cy="280" r="85" fill="none" {...ring("whole")} pointerEvents="none" />
          </g>

          {/* ---- Normal-cell label anchor (only on its own step) ---- */}
          <g style={{ cursor: cur }} onClick={click("normal")} filter={hotFilter("normal")}>
            {isHot("normal") && (
              <g pointerEvents="none" filter="url(#atlas-glow)">
                <text x="450" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>normal cell</text>
                <text x="450" y="216" textAnchor="middle" fontSize="9" fill="var(--text-2)">intact membrane · normal nucleus</text>
              </g>
            )}
          </g>

          {/* ---- Stressors inset (only on its own step) ---- */}
          {isHot("stressors") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="190" height="140" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="155" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">STRESSORS</text>
              {["hypoxia", "toxins", "infection", "trauma", "radiation", "metabolic"].map((s, i) => (
                <text key={i} x="155" y={168 + i * 16} textAnchor="middle" fontSize="9" fill="var(--text-2)">{s}</text>
              ))}
            </g>
          )}

          {/* ---- Adaptation inset — shows the four types as a quad ---- */}
          {isHot("adaptation") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="200" height="180" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="160" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">FOUR ADAPTATIONS</text>
              {["hypertrophy — bigger", "atrophy — smaller", "hyperplasia — more cells", "metaplasia — new type"].map((s, i) => (
                <text key={i} x="160" y={170 + i * 20} textAnchor="middle" fontSize="9" fill="var(--text-2)">{s}</text>
              ))}
              <text x="160" y="275" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">all reversible if stress removed</text>
            </g>
          )}

          {/* ---- Reversible injury callout ---- */}
          {isHot("reversible") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="200" height="110" rx="14" fill="var(--bg-2)" stroke="#E53935" strokeWidth="2" />
              <text x="160" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#E53935">REVERSIBLE INJURY</text>
              <text x="160" y="168" textAnchor="middle" fontSize="9" fill="var(--text-2)">cell swelling</text>
              <text x="160" y="184" textAnchor="middle" fontSize="9" fill="var(--text-2)">membrane blebs</text>
              <text x="160" y="200" textAnchor="middle" fontSize="9" fill="var(--text-2)">dilated ER</text>
              <text x="160" y="220" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">fully recoverable</text>
            </g>
          )}

          {/* ---- Irreversible injury callout ---- */}
          {isHot("irreversible") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="200" height="125" rx="14" fill="var(--bg-2)" stroke="#8C1C12" strokeWidth="2" />
              <text x="160" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8C1C12">IRREVERSIBLE INJURY</text>
              <text x="160" y="168" textAnchor="middle" fontSize="9" fill="var(--text-2)">membrane rupture</text>
              <text x="160" y="184" textAnchor="middle" fontSize="9" fill="var(--text-2)">calcium influx</text>
              <text x="160" y="200" textAnchor="middle" fontSize="9" fill="var(--text-2)">mitochondrial failure</text>
              <text x="160" y="222" textAnchor="middle" fontSize="8.5" fill="#C0392B" fontWeight="700">point of no return</text>
            </g>
          )}

          {/* ---- Necrosis vs apoptosis comparison panel ---- */}
          {(isHot("necrosis") || isHot("apoptosis") || isHot("contrast")) && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="660" y="120" width="200" height="220" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="760" y="145" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>NECROSIS vs APOPTOSIS</text>
              <text x="760" y="175" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8C1C12">Necrosis</text>
              <text x="760" y="192" textAnchor="middle" fontSize="9" fill="var(--text-2)">cell bursts</text>
              <text x="760" y="207" textAnchor="middle" fontSize="9" fill="var(--text-2)">spills contents</text>
              <text x="760" y="222" textAnchor="middle" fontSize="9" fill="var(--text-2)">inflammation</text>
              <text x="760" y="237" textAnchor="middle" fontSize="9" fill="var(--text-2)">always pathological</text>
              <text x="760" y="268" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5B21B6">Apoptosis</text>
              <text x="760" y="285" textAnchor="middle" fontSize="9" fill="var(--text-2)">cell shrinks</text>
              <text x="760" y="300" textAnchor="middle" fontSize="9" fill="var(--text-2)">nucleus condenses</text>
              <text x="760" y="315" textAnchor="middle" fontSize="9" fill="var(--text-2)">no inflammation</text>
              <text x="760" y="330" textAnchor="middle" fontSize="9" fill="var(--text-2)">can be physiological</text>
            </g>
          )}

          {/* ---- Clinical examples inset ---- */}
          {isHot("clinical") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="120" width="220" height="180" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="170" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>CLINICAL EXAMPLES</text>
              <text x="170" y="172" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8C1C12">Necrosis</text>
              <text x="170" y="188" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">myocardial infarction</text>
              <text x="170" y="202" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">severe burns · gangrene</text>
              <text x="170" y="228" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5B21B6">Apoptosis</text>
              <text x="170" y="244" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">endometrial shedding</text>
              <text x="170" y="258" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">cancer therapy · development</text>
              <text x="170" y="284" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2F6FED">Adaptation</text>
              <text x="170" y="298" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">muscle hypertrophy · atrophy</text>
            </g>
          )}

          {/* ---- Static region labels ---- */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Cell under stress</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Adapt → reversible injury → irreversible injury → death (necrosis or apoptosis)</text>
        </svg>
      );
    },
  },

  /* =========================================================
     CELL CYCLE, CONTROL AND APPLICATIONS
     Topic: General Pathology (pat), Topic 04 (index 3).
     Seventh diagram in the pathology family. Introduces the
     atlasCellCycle and atlasChromosome primitives that
     pat:10 Neoplasia will reuse. Covers how a cell divides,
     how that division is controlled, and how the controls are
     targeted in cancer therapy.
     ========================================================= */
  "pat:cell-cycle": {
    id: "pat:cell-cycle",
    type: "diagram",
    title: "The Cell Cycle — Control, Checkpoints, and Cancer",
    topic: { courseId: "pat", topicIndex: 3 },
    parent: null,
    summary: "Every cell that divides goes through the same four-phase cycle: it grows (G1), copies its DNA (S), checks the copy (G2), and divides (M). Three checkpoints — at G1/S, G2/M, and the spindle assembly checkpoint — pause the cycle at each transition and only let it continue if everything is correct. Cancer is what happens when those checkpoints fail. Many chemotherapy drugs work by attacking the cell cycle at specific phases, which is why they kill fast-dividing cells first.",
    labels: [
      { id: "whole",        name: "The Whole Cycle",        desc: "Four phases — G1, S, G2, M — plus a resting state (G0). One turn around the ring is one cell division." },
      { id: "g1",           name: "G1 — Gap 1",             desc: "The cell grows, makes proteins, and prepares to copy its DNA. This is the phase where the cell decides whether to divide at all." },
      { id: "s",            name: "S — Synthesis",           desc: "The cell copies its entire genome. Each chromosome goes from one chromatid to two identical sister chromatids." },
      { id: "g2",           name: "G2 — Gap 2",             desc: "The cell checks that the DNA was copied correctly and makes the proteins it will need for division." },
      { id: "m",            name: "M — Mitosis",            desc: "The cell actually divides: the nucleus splits (mitosis) and the cytoplasm splits (cytokinesis), producing two daughter cells." },
      { id: "g0",           name: "G0 — Quiescence",        desc: "A resting state outside the cycle. Cells here are not dividing — most of your body's cells are in G0 most of the time." },
      { id: "checkpoints",  name: "Checkpoints",            desc: "Control points at G1/S, G2/M, and mid-M. Each one pauses the cycle and only lets it continue if the previous phase went correctly." },
      { id: "cyclins",      name: "Cyclins & CDKs",         desc: "The molecular drivers of the cycle. Cyclins rise and fall through each phase, activating CDKs, which push the cell forward." },
      { id: "cancer",       name: "Cancer",                 desc: "What happens when checkpoints fail. Cells divide without control, ignore stop signals, and accumulate mutations over time." },
      { id: "drugs",        name: "Chemotherapy Targets",   desc: "Many chemo drugs attack specific phases. Methotrexate blocks S; vinca alkaloids and taxanes block M. That's why they hit fast-dividing cells hardest." },
    ],
    narration: [
      "Every cell that divides goes through the same four-phase cycle. It grows, copies its DNA, checks the copy, and divides. One full turn produces two daughter cells — each with a complete copy of the genome. The whole thing is controlled by checkpoints that decide whether the cycle continues or pauses.",
      "The first phase is G1 — Gap 1. The cell grows, builds up its supply of proteins and organelles, and gets ready to copy its DNA. This is also where the cell decides whether to divide at all. If conditions aren't right, it exits the cycle and goes into a resting state called G0.",
      "In G0, the cell is alive and working but not dividing. Most of the cells in your body are here — liver cells, kidney cells, neurons — quietly doing their jobs. They can stay in G0 for years, or forever. Only when they receive specific signals do they re-enter the cycle at G1.",
      "If the cell decides to divide, it moves into S phase — Synthesis. It copies its entire genome. Each chromosome goes from being a single chromatid to being two identical sister chromatids joined at a centromere. By the end of S, the cell has double the normal amount of DNA.",
      "Next is G2 — Gap 2. The cell checks that the DNA was copied correctly, repairs any errors, and makes the proteins it will need for division. It also makes sure the centrosomes have been duplicated. If anything looks wrong, the cell cycle pauses here until it's fixed.",
      "Then it enters M phase — Mitosis. The chromosomes condense, the nuclear envelope breaks down, the spindle forms, and the sister chromatids are pulled to opposite poles. The cell divides into two daughter cells, each with a complete copy of the genome.",
      "Running the whole cycle are three checkpoints. The G1/S checkpoint asks: is the DNA damaged? Is the cell big enough? Are the nutrients available? If not, the cycle halts. The G2/M checkpoint asks: was the DNA copied correctly? The spindle assembly checkpoint asks: are all chromosomes attached to the spindle?",
      "The molecular drivers of all this are cyclins and CDKs. Cyclins rise and fall through the cycle; each one activates a specific CDK. The CDK then phosphorylates target proteins that push the cell into the next phase. When a phase is done, the cyclin is destroyed, and the cycle pauses until the next cyclin is made.",
      "Cancer is what happens when checkpoints fail. If the G1/S checkpoint is broken, a cell with damaged DNA keeps dividing. If the spindle assembly checkpoint is broken, chromosomes get mis-segregated. Over time, mutations accumulate, and the cell divides without control. This is why so many cancer-causing mutations are in checkpoint genes — p53, RB, cyclins, CDKs.",
      "Because cancer cells divide faster than most normal cells, many chemotherapy drugs target the cell cycle. Methotrexate and 5-FU block S phase by interfering with DNA synthesis. Vinca alkaloids and taxanes block M phase by disrupting the spindle. That's why chemo hits fast-dividing tissues hardest — hair, gut lining, bone marrow — and why side effects cluster there.",
    ],
    stepFocus: [
      ["whole"],
      ["g1"],
      ["g0"],
      ["s"],
      ["g2"],
      ["m"],
      ["checkpoints"],
      ["cyclins"],
      ["cancer"],
      ["drugs"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:cell-cycle"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // Which phase of the cycle is highlighted per step.
      const activePhase = ["G1","G1","G1","S","G2","M","G1","G1","G1","S"][activeStep] || "G1";
      const showCheckpoints = activeStep === 6 || activeStep === 8 || activeStep === 9;

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The cell cycle ring — the centrepiece. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasCellCycle({
              cx: 450, cy: 300, radius: 150,
              activePhase,
              showCheckpoints,
              showG0: true,
            })}
          </g>

          {/* G1 phase label anchor — clickable region over the top-left
             portion of the ring. */}
          <g style={{ cursor: cur }} onClick={click("g1")} filter={hotFilter("g1")}>
            <circle cx="370" cy="200" r="60" fill="none" {...ring("g1")} pointerEvents="none" />
          </g>

          {/* S phase label anchor */}
          <g style={{ cursor: cur }} onClick={click("s")} filter={hotFilter("s")}>
            <circle cx="530" cy="200" r="60" fill="none" {...ring("s")} pointerEvents="none" />
          </g>

          {/* G2 label anchor */}
          <g style={{ cursor: cur }} onClick={click("g2")} filter={hotFilter("g2")}>
            <circle cx="530" cy="400" r="60" fill="none" {...ring("g2")} pointerEvents="none" />
          </g>

          {/* M label anchor */}
          <g style={{ cursor: cur }} onClick={click("m")} filter={hotFilter("m")}>
            <circle cx="370" cy="400" r="60" fill="none" {...ring("m")} pointerEvents="none" />
          </g>

          {/* G0 label anchor */}
          <g style={{ cursor: cur }} onClick={click("g0")} filter={hotFilter("g0")}>
            <circle cx="200" cy="150" r="50" fill="none" {...ring("g0")} pointerEvents="none" />
          </g>

          {/* Chromosome illustration — shows the change from single
             chromatid to sister chromatids, drawn to the right of the
             ring, appearing on S and M steps. */}
          {(activeStep === 3 || activeStep === 5) && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="690" y="170" width="180" height="180" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="780" y="195" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">
                {activeStep === 3 ? "AFTER S PHASE" : "IN MITOSIS"}
              </text>
              {activeStep === 3 ? (
                // After S — one chromosome with two sister chromatids
                <>
                  <text x="780" y="215" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">two sister chromatids</text>
                  {atlasChromosome({ cx: 780, cy: 275, length: 42, condensation: 0.4, spindle: false })}
                </>
              ) : (
                // In M — sister chromatids separating on the spindle
                <>
                  <text x="780" y="215" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">separating on spindle</text>
                  {atlasChromosome({ cx: 745, cy: 275, length: 32, condensation: 1, spindle: true })}
                  {atlasChromosome({ cx: 815, cy: 275, length: 32, condensation: 1, spindle: true })}
                </>
              )}
            </g>
          )}

          {/* Checkpoints inset — shows the three control points. */}
          {isHot("checkpoints") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="150" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>THREE CHECKPOINTS</text>
              {[
                ["G1/S —", "DNA damage? Size? Nutrients?"],
                ["G2/M —", "DNA copied correctly?"],
                ["Spindle —", "All chromosomes attached?"],
              ].map(([h, body], i) => (
                <g key={i}>
                  <text x="80" y={155 + i * 30} fontSize="9.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>{h}</text>
                  <text x="80" y={170 + i * 30} fontSize="8.5" fill="var(--text-2)">{body}</text>
                </g>
              ))}
            </g>
          )}

          {/* Cyclins & CDKs inset — a small wave diagram showing cyclin
             levels rising and falling through the cycle. */}
          {isHot("cyclins") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="150" rx="14" fill="var(--bg-2)" stroke="#5B21B6" strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5B21B6">CYCLINS & CDKs</text>
              {/* A representative wave — cyclin D at G1, E at G1/S, A at S, B at G2/M */}
              <path
                d="M75,215 Q95,190 115,215 Q135,185 155,215 Q175,180 195,215 Q215,175 240,215"
                fill="none" stroke="#8B5CF6" strokeWidth="2.4"
              />
              <text x="170" y="235" textAnchor="middle" fontSize="8" fill="var(--text-2)">cyclin levels rise & fall</text>
            </g>
          )}

          {/* Cancer inset — a comparison of normal vs dysregulated division. */}
          {isHot("cancer") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="150" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C0392B">CANCER</text>
              <text x="170" y="148" textAnchor="middle" fontSize="9" fill="var(--text-2)">checkpoints fail</text>
              <text x="170" y="166" textAnchor="middle" fontSize="9" fill="var(--text-2)">cell divides without control</text>
              <text x="170" y="184" textAnchor="middle" fontSize="9" fill="var(--text-2)">damaged DNA keeps copying</text>
              <text x="170" y="202" textAnchor="middle" fontSize="9" fill="var(--text-2)">mutations accumulate</text>
              <text x="170" y="226" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#8C1C12">p53 · RB · cyclins · CDKs</text>
            </g>
          )}

          {/* Drugs inset — chemo drugs and the phase they block. */}
          {isHot("drugs") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="240" height="180" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="180" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>CHEMO TARGETS</text>
              <text x="80" y="155" fontSize="9.5" fontWeight="700" fill="#2F6FED">S phase blockers</text>
              <text x="80" y="170" fontSize="8.5" fill="var(--text-2)">methotrexate · 5-FU</text>
              <text x="80" y="196" fontSize="9.5" fontWeight="700" fill="#F5B93F">M phase blockers</text>
              <text x="80" y="211" fontSize="8.5" fill="var(--text-2)">vinca alkaloids · taxanes</text>
              <text x="80" y="240" fontSize="9" fontWeight="700" fill={ATLAS_COLORS.trunk}>Why side effects cluster:</text>
              <text x="80" y="256" fontSize="8.5" fill="var(--text-2)">hair · gut · bone marrow</text>
              <text x="80" y="270" fontSize="8.5" fill="var(--text-2)">(fastest-dividing tissues)</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">The cell cycle</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Grow (G1) → copy DNA (S) → check (G2) → divide (M) — with checkpoints controlling every step</text>
        </svg>
      );
    },
  },

  /* =========================================================
     CELL CYCLE AND NEOPLASIA
     Topic: General Pathology (pat), Topic 10 (index 9).
     Eighth and final diagram in the pathology family.
     Reuses atlasCellCycle and atlasChromosome. Shows the
     progression from a normal regulated cell cycle to
     uncontrolled neoplastic growth — the endpoint of every
     other pathology topic.
     ========================================================= */
  "pat:neoplasia": {
    id: "pat:neoplasia",
    type: "diagram",
    title: "Cell Cycle and Neoplasia — When Control Is Lost",
    topic: { courseId: "pat", topicIndex: 9 },
    parent: null,
    summary: "Cancer is not one disease — it's what happens when the normal controls on cell division fail. The cell cycle keeps running, but the checkpoints that should stop it don't. Cells divide when they shouldn't, ignore signals to stop, avoid the programmed death that would normally remove them, and accumulate more mutations with each division. Over years, this produces a tumour: a clone of cells that has escaped every safeguard the body has.",
    labels: [
      { id: "whole",       name: "The Whole Picture",      desc: "From a normal regulated cell cycle to a tumour — the endpoint of every other pathology topic." },
      { id: "normal",      name: "Normal Cell Cycle",      desc: "Regulated division with intact checkpoints. Cells divide when they should, stop when they should, and die when they should." },
      { id: "checkpoint",  name: "Checkpoint Failure",     desc: "The first step. A mutation disables one of the checkpoints — usually p53 or RB — and cells with damaged DNA start getting through." },
      { id: "oncogenes",   name: "Oncogenes",              desc: "Genes that drive division — like RAS, MYC. When mutated or overexpressed, they push the cell forward when it should stop." },
      { id: "tsg",         name: "Tumour Suppressors",     desc: "Genes that stop division — like p53, RB. When both copies are lost, the brakes are gone." },
      { id: "proliferation", name: "Uncontrolled Proliferation", desc: "Cells divide without the normal signals. They ignore contact inhibition — they pile up instead of stopping at a monolayer." },
      { id: "apoptosis",   name: "Apoptosis Evasion",      desc: "Normal cells self-destruct when damaged. Cancer cells disable that self-destruct button — often by overexpressing BCL-2 or losing p53." },
      { id: "angiogenesis", name: "Angiogenesis",          desc: "A tumour can't grow past about 2mm without its own blood supply. It releases VEGF and grows new vessels into itself." },
      { id: "invasion",    name: "Invasion & Metastasis",  desc: "The final step. Cells break through the basement membrane, travel through blood or lymph, and set up new tumours elsewhere. This is what makes cancer lethal." },
      { id: "staging",     name: "Staging & Grading",      desc: "How we describe a tumour. Stage is how far it has spread (TNM); grade is how abnormal the cells look. Both guide treatment and prognosis." },
    ],
    narration: [
      "Cancer is not one disease — it's what happens when the normal controls on cell division fail. Every other topic in pathology leads here. Heart attacks kill tissue fast; cancer kills it slowly, by accumulation. Over years, the loss of control produces a tumour: a clone of cells that has escaped every safeguard the body has.",
      "Start from the normal cell cycle. Cells divide when they receive the right signals, at the right time, and stop when they shouldn't. The three checkpoints — G1/S, G2/M, and the spindle checkpoint — are the control points that prevent damaged cells from dividing. Every checkpoint is enforced by tumour suppressor genes.",
      "The first step toward cancer is checkpoint failure. A cell accumulates a mutation in a checkpoint gene — most often p53, sometimes RB. That single mutation means the cell no longer stops at G1/S when its DNA is damaged. It copies that damage into both daughter cells, and each daughter has to accumulate more mutations to become a cancer.",
      "Two families of genes drive the process. Oncogenes are the accelerators — RAS, MYC, and others. When these are mutated or overexpressed, they push the cell forward when it should be stopping. A single mutated copy is enough — they act dominantly. This is why they're called 'gain of function' mutations.",
      "Tumour suppressor genes are the brakes — p53, RB, BRCA1, APC. When they're working, they stop the cell at checkpoints or trigger its death. When both copies are lost — through mutation, deletion, or silencing — the brakes are gone. This is why tumour suppressors are 'loss of function' and recessive at the cellular level.",
      "With checkpoints broken, cells start proliferating without the normal signals. They don't stop at a monolayer in culture — they pile up. They keep dividing when growth factors are absent, ignore contact inhibition, and don't respond to the signals that tell normal cells to stop dividing.",
      "The next thing cancer cells do is evade apoptosis. In a normal cell, DNA damage triggers p53, which triggers the cell's self-destruct. In cancer, that pathway is broken — often p53 is lost, or BCL-2 is overexpressed. Now damaged cells survive when they should have died, accumulating still more mutations.",
      "As the tumour grows past about two millimetres, it needs its own blood supply. It releases VEGF and grows new vessels into itself — angiogenesis. This is why tumours are often visible on imaging as dense, vascular masses. It's also why some drugs target VEGF: cut off the blood supply and the tumour stalls.",
      "The final and most dangerous step is invasion and metastasis. Cells break through the basement membrane, invade surrounding tissue, and enter the blood or lymph. They travel to distant sites and set up new tumours. It's not the primary tumour that usually kills; it's the metastases. This is what makes cancer a systemic disease.",
      "Finally, how we describe a tumour. Stage is how far it has spread — the TNM system: tumour size, node involvement, metastasis. Grade is how abnormal the cells look under the microscope. Both are used to choose treatment and estimate prognosis. The lower the stage and grade, the better the outcome.",
    ],
    stepFocus: [
      ["whole"],
      ["normal"],
      ["checkpoint"],
      ["oncogenes"],
      ["tsg"],
      ["proliferation"],
      ["apoptosis"],
      ["angiogenesis"],
      ["invasion"],
      ["staging"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["pat:neoplasia"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // Progression: the cell cycle ring on the left becomes progressively
      // disabled, and the tumour mass on the right grows as the narration
      // moves through the steps. At the end, both are shown together.
      const showRing = activeStep < 5;
      const showTumour = activeStep >= 4;
      const tumourSize = Math.min(1, Math.max(0, (activeStep - 3) / 6));
      const ringEnabled = activeStep < 2;

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* ---- LEFT: the cell cycle ring ---- */}
          {showRing && (
            <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
              {atlasCellCycle({
                cx: 280, cy: 300, radius: 130,
                activePhase: "G1",
                showCheckpoints: !ringEnabled,
                showG0: true,
              })}
              <circle cx="280" cy="300" r="160" fill="none" {...ring("whole")} pointerEvents="none" />
            </g>
          )}

          {/* Normal cycle label anchor */}
          <g style={{ cursor: cur }} onClick={click("normal")} filter={hotFilter("normal")}>
            <circle cx="280" cy="300" r="140" fill="none" {...ring("normal")} pointerEvents="none" />
          </g>

          {/* ---- RIGHT: the tumour mass ---- */}
          {showTumour && (
            <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
              {(() => {
                const baseR = 30 + tumourSize * 90;
                const tcx = 660;
                const tcy = 320;
                // A cluster of overlapping circles, growing with tumourSize
                const cells = [
                  [0, 0],          [0.5, -0.4],     [-0.5, -0.3],
                  [0.4, 0.5],      [-0.4, 0.5],     [0, -0.7],
                  [0.7, 0.1],      [-0.7, 0.1],     [0.2, -0.3],
                  [-0.2, -0.6],    [0.6, -0.6],     [-0.6, 0.6],
                ];
                return (
                  <g>
                    {cells.slice(0, Math.max(3, Math.round(cells.length * tumourSize))).map(([dx, dy], i) => (
                      <circle
                        key={i}
                        cx={tcx + dx * baseR}
                        cy={tcy + dy * baseR * 0.85}
                        r={baseR * 0.32}
                        fill="#FBDCDC"
                        stroke="#C0392B"
                        strokeWidth="1.6"
                        opacity="0.85"
                      />
                    ))}
                    {/* Irregular tumour outline */}
                    <ellipse
                      cx={tcx}
                      cy={tcy}
                      rx={baseR * 1.15}
                      ry={baseR * 1.05}
                      fill="none"
                      stroke="#8C1C12"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      opacity="0.7"
                    />
                  </g>
                );
              })()}
            </g>
          )}

          {/* Checkpoint failure inset — a broken checkpoint gate. */}
          {isHot("checkpoint") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="130" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C0392B">CHECKPOINT FAILURE</text>
              <text x="170" y="150" textAnchor="middle" fontSize="9" fill="var(--text-2)">usually p53 or RB</text>
              <text x="170" y="168" textAnchor="middle" fontSize="9" fill="var(--text-2)">damaged DNA keeps copying</text>
              <text x="170" y="192" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#8C1C12">first step toward cancer</text>
              <text x="170" y="212" textAnchor="middle" fontSize="8" fill="var(--text-3)">1 mutation — not yet a tumour</text>
            </g>
          )}

          {/* Oncogenes vs TSG inset — the two families side by side. */}
          {(isHot("oncogenes") || isHot("tsg")) && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="240" height="150" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="180" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>TWO GENE FAMILIES</text>
              <text x="80" y="152" fontSize="10" fontWeight="700" fill="#C0392B">Oncogenes (accelerator)</text>
              <text x="80" y="168" fontSize="8.5" fill="var(--text-2)">RAS · MYC · ERBB2</text>
              <text x="80" y="182" fontSize="8.5" fill="var(--text-2)">gain of function · dominant</text>
              <text x="80" y="208" fontSize="10" fontWeight="700" fill="#2F6FED">Tumour suppressors (brakes)</text>
              <text x="80" y="224" fontSize="8.5" fill="var(--text-2)">p53 · RB · BRCA1 · APC</text>
              <text x="80" y="238" fontSize="8.5" fill="var(--text-2)">loss of function · both copies</text>
            </g>
          )}

          {/* Uncontrolled proliferation inset */}
          {isHot("proliferation") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="120" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C0392B">UNCONTROLLED GROWTH</text>
              <text x="170" y="148" textAnchor="middle" fontSize="9" fill="var(--text-2)">no signal needed</text>
              <text x="170" y="164" textAnchor="middle" fontSize="9" fill="var(--text-2)">ignores contact inhibition</text>
              <text x="170" y="180" textAnchor="middle" fontSize="9" fill="var(--text-2)">piles up instead of stopping</text>
              <text x="170" y="204" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#8C1C12">monolayer → multilayered mass</text>
            </g>
          )}

          {/* Apoptosis evasion inset */}
          {isHot("apoptosis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="220" height="130" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="170" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8B5CF6">APOPTOSIS EVASION</text>
              <text x="170" y="150" textAnchor="middle" fontSize="9" fill="var(--text-2)">p53 lost — self-destruct gone</text>
              <text x="170" y="166" textAnchor="middle" fontSize="9" fill="var(--text-2)">or BCL-2 overexpressed</text>
              <text x="170" y="190" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5B21B6">damaged cells survive</text>
              <text x="170" y="208" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">mutations accumulate further</text>
            </g>
          )}

          {/* Angiogenesis inset */}
          {isHot("angiogenesis") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="620" y="80" width="240" height="130" rx="14" fill="var(--bg-2)" stroke="#E53935" strokeWidth="2" />
              <text x="740" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#E53935">ANGIOGENESIS</text>
              <text x="740" y="128" textAnchor="middle" fontSize="9" fill="var(--text-2)">tumour releases VEGF</text>
              <text x="740" y="144" textAnchor="middle" fontSize="9" fill="var(--text-2)">new vessels grow into it</text>
              <text x="740" y="166" textAnchor="middle" fontSize="9" fill="var(--text-2)">needed past ~2 mm</text>
              <text x="740" y="188" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8C1C12">target of some drugs</text>
            </g>
          )}

          {/* Invasion & metastasis inset */}
          {isHot("invasion") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="240" height="160" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="180" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C0392B">INVASION & METASTASIS</text>
              <text x="80" y="152" fontSize="9.5" fill="var(--text-2)">1. break basement membrane</text>
              <text x="80" y="170" fontSize="9.5" fill="var(--text-2)">2. invade surrounding tissue</text>
              <text x="80" y="188" fontSize="9.5" fill="var(--text-2)">3. enter blood or lymph</text>
              <text x="80" y="206" fontSize="9.5" fill="var(--text-2)">4. travel to distant site</text>
              <text x="80" y="224" fontSize="9.5" fill="var(--text-2)">5. colonise a new organ</text>
              <text x="80" y="248" fontSize="9" fontWeight="700" fill="#8C1C12">this is what usually kills</text>
            </g>
          )}

          {/* Staging & grading inset */}
          {isHot("staging") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="100" width="240" height="160" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="180" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>STAGING & GRADING</text>
              <text x="80" y="155" fontSize="10" fontWeight="700" fill="#2F6FED">Stage (TNM)</text>
              <text x="80" y="172" fontSize="9" fill="var(--text-2)">T = tumour size</text>
              <text x="80" y="188" fontSize="9" fill="var(--text-2)">N = node involvement</text>
              <text x="80" y="204" fontSize="9" fill="var(--text-2)">M = metastasis present</text>
              <text x="80" y="228" fontSize="10" fontWeight="700" fill="#8B5CF6">Grade</text>
              <text x="80" y="244" fontSize="9" fill="var(--text-2)">how abnormal the cells look</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Normal cycle → neoplasia</text>
          <text x="450" y="610" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Checkpoint failure → uncontrolled growth → invasion → metastasis</text>
        </svg>
      );
    },
  },

  /* =========================================================
     RENAL PHYSIOLOGY — KIDNEY & URINE FORMATION
     Topic: Physiology II (ph2), Topic 05 (index 4).
     Opens the renal family. Introduces atlasNephron and
     atlasGlomerulus. Covers how the kidney filters blood,
     reabsorbs what the body needs, secretes what it doesn't,
     and produces urine.
     ========================================================= */
  "ph2:renal-physiology": {
    id: "ph2:renal-physiology",
    type: "diagram",
    title: "Renal Physiology — How the Kidney Makes Urine",
    topic: { courseId: "ph2", topicIndex: 4 },
    parent: null,
    summary: "Your kidneys filter your entire blood volume many times a day. They pull out waste, excess water, and excess electrolytes, and they keep what the body actually needs. The whole process happens inside millions of tiny functional units called nephrons. Each nephron filters blood at one end, then reabsorbs and secretes along its tubule, and finally empties what's left as urine. The result is precise control over your body's fluid, electrolytes, and acid-base balance.",
    labels: [
      { id: "whole",        name: "The Whole System",        desc: "Filter, reabsorb, secrete, excrete. Four processes that run together in every nephron, all day, every day." },
      { id: "kidney",       name: "The Kidney",              desc: "Two bean-shaped organs, one on each side of your spine. Each contains about a million nephrons." },
      { id: "nephron",      name: "The Nephron",             desc: "The functional unit of the kidney. One nephron = one filter + one long tubule + one collecting duct." },
      { id: "glomerulus",   name: "The Glomerulus",          desc: "A knot of capillaries inside a Bowman's capsule. Blood pressure pushes water and small solutes out — cells and large proteins stay behind." },
      { id: "pct",          name: "Proximal Convoluted Tubule", desc: "The busiest segment. Reabsorbs about 65% of the filtered water, sodium, glucose and amino acids back into the blood." },
      { id: "loop",         name: "Loop of Henle",           desc: "Creates a salt gradient in the kidney's inner tissue. Descending limb lets water out; ascending limb pumps salt out but not water." },
      { id: "dct",          name: "Distal Convoluted Tubule", desc: "Fine-tuning. Reabsorbs sodium and calcium under hormonal control — this is where aldosterone and PTH act." },
      { id: "collecting",   name: "Collecting Duct",         desc: "Final adjustments. ADH makes it permeable to water; without ADH, it stays impermeable and lots of dilute urine is produced." },
      { id: "hormones",     name: "Hormonal Control",        desc: "ADH, aldosterone, and the renin-angiotensin system regulate what the tubule reabsorbs and secretes, hour by hour." },
      { id: "gfr",          name: "Glomerular Filtration Rate", desc: "How much fluid the glomeruli filter per minute — about 125 mL/min in a healthy adult. GFR is the single best measure of kidney function." },
    ],
    narration: [
      "Your kidneys filter your entire blood volume many times a day. They pull out waste, excess water, and excess electrolytes, and they keep what the body actually needs. The result is precise control over fluid balance, electrolyte balance, blood pressure, and acid-base balance. Without the kidneys doing this every minute, you would be dead in days.",
      "Each kidney contains about a million tiny functional units called nephrons. A nephron is a filter attached to a long, winding tubule. Blood enters the filter, fluid gets pushed out, and the tubule then fine-tunes that fluid — keeping some things and dumping others — before the remainder leaves as urine.",
      "The filter is the glomerulus. It's a knot of capillaries inside a cup-shaped Bowman's capsule. Blood pressure pushes water, small solutes, and waste out of the capillary into the capsule. Red cells and large proteins can't fit through, so they stay in the blood. What gets pushed out is called the filtrate — about 180 litres a day.",
      "The filtrate then enters the proximal convoluted tubule — the PCT. This is the busiest segment. It reabsorbs about sixty-five per cent of the water, sodium, glucose and amino acids back into the blood. Glucose and amino acids are reabsorbed completely; if glucose appears in your urine, it means blood glucose has overwhelmed this step, as happens in diabetes.",
      "Next comes the loop of Henle. It dips down into the inner part of the kidney and comes back up. The descending limb is permeable to water but not to salt; the ascending limb pumps salt out but not water. Together, they create a salt gradient in the kidney's inner tissue — this gradient is what allows you to concentrate your urine.",
      "The distal convoluted tubule — the DCT — is where fine-tuning happens. It reabsorbs sodium and calcium under hormonal control. Aldosterone tells it to reabsorb more sodium (and excrete potassium in exchange); parathyroid hormone tells it to reabsorb more calcium. Small adjustments here make a big difference to blood composition.",
      "The collecting duct is the final segment. Several nephrons drain into one collecting duct, which runs down through the kidney to the ureter. The collecting duct is where the hormone ADH acts. When ADH is present, the duct becomes permeable to water and reabsorbs it — concentrated urine. Without ADH, water stays in the duct and lots of dilute urine is produced.",
      "Three hormones control the whole process. ADH from the pituitary controls water reabsorption in the collecting duct. Aldosterone from the adrenal cortex controls sodium reabsorption and potassium secretion in the DCT. The renin-angiotensin-aldosterone system, activated by the kidney itself, raises blood pressure and sodium reabsorption when the body needs them.",
      "How much fluid the glomeruli filter per minute is called the glomerular filtration rate, or GFR. In a healthy adult, it's about 125 millilitres per minute — 180 litres a day. That's the whole blood volume filtered about sixty times. GFR is the single best measure of kidney function; when it drops, kidney disease has started.",
      "Putting it all together: blood is filtered at the glomerulus, the PCT reabsorbs most of what was filtered, the loop of Henle builds a gradient, the DCT fine-tunes under hormonal control, and the collecting duct makes the final adjustment under ADH. What's left becomes urine. Every part of the nephron is essential — if any segment fails, the whole balance breaks down.",
    ],
    stepFocus: [
      ["whole"],
      ["kidney"],
      ["nephron"],
      ["glomerulus"],
      ["pct"],
      ["loop"],
      ["dct"],
      ["collecting"],
      ["hormones"],
      ["gfr"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:renal-physiology"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // Which nephron segment is highlighted at each step.
      const activeSegment = [
        null,         // 0 - whole
        null,         // 1 - kidney
        null,         // 2 - nephron
        "glomerulus", // 3 - glomerulus
        "pct",        // 4 - PCT
        "descending", // 5 - loop (descending first, then ascending on the same step)
        "dct",        // 6 - DCT
        "collecting", // 7 - collecting duct
        null,         // 8 - hormones
        null,         // 9 - gfr
      ][activeStep];

      // On step 5 (loop of Henle), highlight both limbs.
      const loopActive = activeStep === 5;

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The nephron — the centrepiece, drawn large. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasNephron({
              cx: 500, cy: 280, scale: 1.3,
              activeSegment: loopActive ? "descending" : activeSegment,
            })}
            <rect x="60" y="40" width="780" height="500" fill="none" {...ring("whole")} pointerEvents="none" />
          </g>

          {/* Nephron label anchor */}
          <g style={{ cursor: cur }} onClick={click("nephron")} filter={hotFilter("nephron")}>
            <circle cx="370" cy="280" r="80" fill="none" {...ring("nephron")} pointerEvents="none" />
          </g>

          {/* Kidney outline — a soft bean shape behind the nephron to
             suggest the whole organ the nephron sits inside. */}
          <g style={{ cursor: cur }} onClick={click("kidney")} filter={hotFilter("kidney")}>
            <path
              d="M70,120 Q30,200 60,340 Q90,460 180,480 Q260,490 280,440 Q290,410 270,380 Q240,340 250,300 Q260,260 230,220 Q200,180 150,150 Q110,130 70,120 Z"
              fill="#FBE9E7"
              stroke={isHot("kidney") ? ATLAS_COLORS.trunk : "#B63B2E"}
              strokeWidth="2"
              opacity="0.5"
            />
            <text x="150" y="320" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Kidney</text>
          </g>

          {/* Glomerulus inset — a magnified view of the filtration
             barrier, shown on the glomerulus step. */}
          {activeStep === 3 && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="80" width="220" height="170" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="750" y="105" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">GLOMERULUS (magnified)</text>
              {atlasGlomerulus({ cx: 750, cy: 175, r: 45, showFiltration: true, highlight: true })}
              <text x="750" y="240" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">pressure pushes fluid into capsule</text>
            </g>
          )}

          {/* Hormonal control inset — three hormones with arrows
             pointing to their target segments. */}
          {isHot("hormones") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="80" width="220" height="180" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="750" y="105" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>HORMONAL CONTROL</text>
              <text x="660" y="132" fontSize="9.5" fontWeight="700" fill="#2F6FED">ADH</text>
              <text x="660" y="148" fontSize="8.5" fill="var(--text-2)">collecting duct — water</text>
              <text x="660" y="176" fontSize="9.5" fontWeight="700" fill="#8B5CF6">Aldosterone</text>
              <text x="660" y="192" fontSize="8.5" fill="var(--text-2)">DCT — Na reabsorb, K excrete</text>
              <text x="660" y="220" fontSize="9.5" fontWeight="700" fill="#C0392B">RAAS</text>
              <text x="660" y="236" fontSize="8.5" fill="var(--text-2)">whole nephron — BP up</text>
            </g>
          )}

          {/* GFR inset — a small flow meter showing 125 mL/min. */}
          {isHot("gfr") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="80" width="220" height="150" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="750" y="105" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>GLOMERULAR FILTRATION</text>
              <text x="750" y="140" textAnchor="middle" fontSize="28" fontWeight="800" fill={ATLAS_COLORS.trunk}>125</text>
              <text x="750" y="158" textAnchor="middle" fontSize="10" fill="var(--text-2)">mL / min</text>
              <text x="750" y="185" textAnchor="middle" fontSize="9" fill="var(--text-2)">≈ 180 L / day</text>
              <text x="750" y="205" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">best measure of kidney function</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">The nephron — one million per kidney</text>
          <text x="450" y="605" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Filter → reabsorb → secrete → excrete: the four jobs of the kidney</text>
        </svg>
      );
    },
  },

  /* =========================================================
     RENAL PHYSIOLOGY — ACID-BASE BALANCE
     Topic: Physiology II (ph2), Topic 06 (index 5).
     Second diagram in the renal family. Reuses atlasNephron,
     atlasGlomerulus. Introduces one new primitive: atlasBuffer.
     Covers how the body keeps pH in its narrow safe range —
     buffers, lungs, kidneys — and what happens when each fails.
     ========================================================= */
  "ph2:acid-base": {
    id: "ph2:acid-base",
    type: "diagram",
    title: "Renal Physiology — Acid-Base Balance",
    topic: { courseId: "ph2", topicIndex: 5 },
    parent: null,
    summary: "Your body has to keep its pH between 7.35 and 7.45 — a range so narrow that a shift of 0.4 in either direction can kill you. Three systems defend that range: chemical buffers act in seconds, the lungs adjust in minutes, and the kidneys adjust over hours to days. Only the kidneys can actually remove acid from the body, which is why they're the long-term solution. When any of the three systems fails, the result is acidosis or alkalosis — and the kidneys' response tells you what has gone wrong.",
    labels: [
      { id: "whole",         name: "The Whole Balance",       desc: "Buffers, lungs, and kidneys working together to keep pH in a range of 7.35 to 7.45. Each system catches what the others miss." },
      { id: "ph",            name: "pH & Why It Matters",     desc: "The concentration of hydrogen ions in your blood. Small shifts change how every enzyme and protein in your body works." },
      { id: "buffers",       name: "Chemical Buffers",        desc: "Proteins, phosphate, and bicarbonate act in seconds to mop up excess acid or base. The fastest defence, but limited in capacity." },
      { id: "bicarbonate",   name: "Bicarbonate Buffer",      desc: "The main buffer in blood. CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. This equation is the whole story of acid-base chemistry." },
      { id: "hh",            name: "Henderson-Hasselbalch",   desc: "pH = 6.1 + log([HCO₃⁻]/[CO₂]). The relationship that lets you work out what's wrong from a blood gas." },
      { id: "lungs",         name: "Lungs — CO₂ Control",     desc: "Breathe faster to blow off CO₂ (raises pH); breathe slower to keep CO₂ (lowers pH). Reacts in minutes — the second line of defence." },
      { id: "kidney-h",      name: "Kidney — H⁺ Excretion",   desc: "The nephron secretes H⁺ into the tubular fluid, mostly in the PCT and DCT. This is the only way to actually remove acid from the body." },
      { id: "kidney-hco3",   name: "Kidney — HCO₃⁻ Handling", desc: "The kidney filters bicarbonate, then reabsorbs almost all of it, and generates new bicarbonate when the body needs it." },
      { id: "resp-disorders", name: "Respiratory Disorders",  desc: "Respiratory acidosis (too much CO₂) or respiratory alkalosis (too little CO₂). The problem is in the lungs." },
      { id: "met-disorders", name: "Metabolic Disorders",     desc: "Metabolic acidosis (too little HCO₃⁻) or metabolic alkalosis (too much HCO₃⁻). The problem isn't in the lungs — compensation kicks in." },
    ],
    narration: [
      "Your body has to keep its pH between 7.35 and 7.45 — a range so narrow that a shift of 0.4 in either direction can kill you. Three systems defend that range at different speeds: chemical buffers act in seconds, the lungs adjust over minutes, and the kidneys adjust over hours to days. Only the kidneys can actually remove acid from the body, which is why they're the long-term solution.",
      "pH is the concentration of hydrogen ions in your blood. Even a tiny shift changes the shape and charge of every protein in your body — enzymes stop working, channels stop gating, hormones stop binding. That's why the body defends a narrow range so aggressively, and why any disease that disturbs pH is serious.",
      "The first line of defence is chemical buffers. Proteins, phosphate, and bicarbonate act within seconds to mop up excess acid or base. They don't remove anything from the body — they just hold onto the extra hydrogen until something else can deal with it. Their capacity is limited, but their speed is unmatched.",
      "The most important buffer is the bicarbonate system. It runs through a simple equation: CO₂ combines with water to make carbonic acid, which then splits into hydrogen ions and bicarbonate. Every part of that equation can shift up or down depending on what the body needs — add CO₂, and the equation pushes right; remove it, and it pushes left.",
      "The relationship between these components is captured in the Henderson-Hasselbalch equation: pH equals 6.1 plus the log of bicarbonate concentration divided by CO₂ concentration. This is the equation your blood gas analyser uses. Give it a pH, a bicarbonate, and a CO₂, and it tells you exactly what's wrong and how the body is trying to compensate.",
      "The lungs are the second line of defence. They control how much CO₂ stays in your blood. Breathe faster and you blow off CO₂ — the equation shifts left, hydrogen ions get consumed, and pH rises. Breathe slower and CO₂ builds up — the equation shifts right, hydrogen ions increase, and pH falls. The lungs react within minutes, so they're the body's rapid-response system.",
      "The kidneys are the long-term solution. They're the only organ that can actually remove acid from the body — not just buffer it. The nephron secretes hydrogen ions into the tubular fluid, mostly in the proximal and distal tubules. Those hydrogen ions are then either buffered by phosphate or excreted as ammonium, and lost in the urine.",
      "The kidney also handles bicarbonate. It filters bicarbonate from the blood, then reabsorbs almost all of it in the proximal tubule. More importantly, the kidney can generate brand-new bicarbonate when the body is acidotic — that's how it corrects a long-standing acidosis. Conversely, in alkalosis, the kidney excretes bicarbonate to bring pH back down.",
      "When something goes wrong with the lungs, you get a respiratory disorder. If the lungs can't blow off CO₂ — from COPD, hypoventilation, or sedation — CO₂ builds up and pH falls: respiratory acidosis. If the lungs blow off too much CO₂ — from hyperventilation, pain, or anxiety — pH rises: respiratory alkalosis.",
      "When the problem isn't in the lungs, you get a metabolic disorder. Too little bicarbonate (from diabetic ketoacidosis, lactic acidosis, or renal failure) gives you metabolic acidosis. Too much bicarbonate (from vomiting, diuretics, or mineralocorticoid excess) gives you metabolic alkalosis. In both cases, the respiratory system tries to compensate — but only the kidneys can fully correct the problem. Reading a blood gas means looking at all three numbers: pH tells you which way the balance has shifted, CO₂ tells you what the lungs are doing, and bicarbonate tells you what the kidneys are doing.",
    ],
    stepFocus: [
      ["whole"],
      ["ph"],
      ["buffers"],
      ["bicarbonate"],
      ["hh"],
      ["lungs"],
      ["kidney-h"],
      ["kidney-hco3"],
      ["resp-disorders"],
      ["met-disorders"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:acid-base"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // The buffer equation highlight per step.
      const bufferStage = [null, null, null, 1, 2, null, null, null, null, null][activeStep];

      // The pH value shifts during the respiratory and metabolic
      // disorder steps, so the indicator moves visibly.
      const pH = [
        7.4, 7.4, 7.4, 7.4, 7.4,
        7.4,   // lungs
        7.4,   // kidney H+
        7.4,   // kidney HCO3
        7.30,  // respiratory acidosis
        7.48,  // metabolic alkalosis
      ][activeStep] || 7.4;

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The buffer equation — the centrepiece of the top half. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasBuffer({
              cx: 450, cy: 200,
              activeStage: bufferStage,
              pH,
            })}
            <rect x="80" y="100" width="740" height="200" fill="none" {...ring("whole")} pointerEvents="none" />
          </g>

          {/* pH label anchor */}
          <g style={{ cursor: cur }} onClick={click("ph")} filter={hotFilter("ph")}>
            <circle cx="450" cy="90" r="50" fill="none" {...ring("ph")} pointerEvents="none" />
            <text x="450" y="70" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">pH range 7.35 – 7.45</text>
          </g>

          {/* Buffers label anchor — a small clickable region over the
             left side of the equation. */}
          <g style={{ cursor: cur }} onClick={click("buffers")} filter={hotFilter("buffers")}>
            <circle cx="150" cy="200" r="60" fill="none" {...ring("buffers")} pointerEvents="none" />
          </g>

          {/* Bicarbonate label anchor */}
          <g style={{ cursor: cur }} onClick={click("bicarbonate")} filter={hotFilter("bicarbonate")}>
            <circle cx="600" cy="200" r="60" fill="none" {...ring("bicarbonate")} pointerEvents="none" />
          </g>

          {/* Henderson-Hasselbalch inset */}
          {isHot("hh") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="300" height="110" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="210" y="365" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>HENDERSON-HASSELBALCH</text>
              <text x="210" y="395" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">pH = 6.1 + log([HCO₃⁻]/[CO₂])</text>
              <text x="210" y="420" textAnchor="middle" fontSize="9" fill="var(--text-2)">kidney sets the numerator</text>
              <text x="210" y="435" textAnchor="middle" fontSize="9" fill="var(--text-2)">lungs set the denominator</text>
            </g>
          )}

          {/* Lungs inset — a stylised pair of lungs with arrows. */}
          {isHot("lungs") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="200" height="130" rx="14" fill="var(--bg-2)" stroke="#2F6FED" strokeWidth="2" />
              <text x="160" y="365" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#2F6FED">LUNGS · CO₂ CONTROL</text>
              {/* Two lung shapes */}
              <path d="M110,390 Q95,400 100,420 Q105,440 125,438 Q135,425 130,400 Q125,388 110,390 Z" fill="#F5A8A0" stroke="#B63B2E" strokeWidth="1.2" />
              <path d="M170,390 Q185,400 180,420 Q175,440 155,438 Q145,425 150,400 Q155,388 170,390 Z" fill="#F5A8A0" stroke="#B63B2E" strokeWidth="1.2" />
              <text x="160" y="460" textAnchor="middle" fontSize="8" fill="var(--text-2)">breathe faster → pH up</text>
            </g>
          )}

          {/* Kidney H+ secretion inset — a small nephron segment with
             arrows pointing out to show H+ being secreted into the
             tubular fluid. */}
          {isHot("kidney-h") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="220" height="140" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="170" y="365" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">KIDNEY · H⁺ EXCRETION</text>
              {/* A tubular segment with H+ arrows going into it */}
              <path d="M90,405 Q120,395 150,405 Q180,415 210,405" fill="none" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
              {[110, 140, 170].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="385" x2={x} y2="397" stroke="#C0392B" strokeWidth="2.4" strokeLinecap="round" />
                  <polygon points={`${x},400 ${x - 4},393 ${x + 4},393`} fill="#C0392B" />
                </g>
              ))}
              <text x="170" y="445" textAnchor="middle" fontSize="8" fill="var(--text-2)">PCT + DCT secrete H⁺</text>
              <text x="170" y="460" textAnchor="middle" fontSize="8" fill="var(--text-2)">into tubular fluid</text>
            </g>
          )}

          {/* Kidney HCO3 handling inset */}
          {isHot("kidney-hco3") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="220" height="140" rx="14" fill="var(--bg-2)" stroke="#2F6FED" strokeWidth="2" />
              <text x="170" y="365" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#2F6FED">KIDNEY · HCO₃⁻ HANDLING</text>
              <text x="170" y="390" textAnchor="middle" fontSize="9" fill="var(--text-2)">filtered at the glomerulus</text>
              <text x="170" y="407" textAnchor="middle" fontSize="9" fill="var(--text-2)">reabsorbed ~90% in PCT</text>
              <text x="170" y="424" textAnchor="middle" fontSize="9" fill="var(--text-2)">new HCO₃⁻ generated when</text>
              <text x="170" y="439" textAnchor="middle" fontSize="9" fill="var(--text-2)">the body is acidotic</text>
              <text x="170" y="465" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#2F6FED">the long-term fix</text>
            </g>
          )}

          {/* Respiratory disorders inset — acid/alkaline side by side. */}
          {isHot("resp-disorders") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="300" height="140" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="210" y="365" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">RESPIRATORY DISORDERS</text>
              <text x="80" y="395" fontSize="10" fontWeight="700" fill="#8C1C12">Acidosis</text>
              <text x="80" y="410" fontSize="8.5" fill="var(--text-2)">↑ CO₂ · hypoventilation</text>
              <text x="80" y="425" fontSize="8.5" fill="var(--text-2)">COPD · sedation</text>
              <text x="80" y="455" fontSize="10" fontWeight="700" fill="#2F6FED">Alkalosis</text>
              <text x="80" y="470" fontSize="8.5" fill="var(--text-2)">↓ CO₂ · hyperventilation</text>
            </g>
          )}

          {/* Metabolic disorders inset */}
          {isHot("met-disorders") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="60" y="340" width="300" height="140" rx="14" fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="2" />
              <text x="210" y="365" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8B5CF6">METABOLIC DISORDERS</text>
              <text x="80" y="395" fontSize="10" fontWeight="700" fill="#8C1C12">Acidosis</text>
              <text x="80" y="410" fontSize="8.5" fill="var(--text-2)">↓ HCO₃⁻ · DKA · lactic</text>
              <text x="80" y="425" fontSize="8.5" fill="var(--text-2)">renal failure</text>
              <text x="80" y="455" fontSize="10" fontWeight="700" fill="#2F6FED">Alkalosis</text>
              <text x="80" y="470" fontSize="8.5" fill="var(--text-2)">↑ HCO₃⁻ · vomiting · diuretics</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">The bicarbonate buffer equation</text>
          <text x="450" y="605" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Buffers (seconds) → lungs (minutes) → kidneys (hours to days)</text>
        </svg>
      );
    },
  },

  /* =========================================================
     THE DIGESTIVE SYSTEM
     Topic: Physiology II (ph2), Topic 07 (index 6).
     Seventh and final diagram in the Physiology II family.
     Introduces atlasGITract. Reuses atlasVessel for the portal
     circulation. Covers how food becomes molecules the body
     can absorb.
     ========================================================= */
  "ph2:digestive-system": {
    id: "ph2:digestive-system",
    type: "diagram",
    title: "The Digestive System — From Food to Fuel",
    topic: { courseId: "ph2", topicIndex: 6 },
    parent: null,
    summary: "Your digestive system takes food — large, complex, unusable — and breaks it down into molecules small enough to absorb into your blood. It's a tube about nine metres long, from mouth to anus, with accessory organs that add enzymes, bile, and bicarbonate along the way. Digestion is both mechanical (chewing, churning) and chemical (enzymes cutting molecules apart). Absorption happens mainly in the small intestine, where a vast surface area covered in villi pulls nutrients into the blood. What can't be absorbed is eliminated.",
    labels: [
      { id: "whole",          name: "The Whole System",       desc: "A nine-metre tube plus accessory organs. Food in at the top, waste out at the bottom, and absorption happening all along the way." },
      { id: "tube",           name: "The GI Tube",            desc: "Mouth → oesophagus → stomach → small intestine → large intestine → rectum → anus. One continuous tube, four layers thick." },
      { id: "digestion",      name: "Mechanical & Chemical",  desc: "Two kinds of breakdown happening together. Mechanical: chewing, churning. Chemical: enzymes splitting molecules apart." },
      { id: "stomach",        name: "The Stomach",            desc: "A muscular bag that stores food, churns it, and adds acid and pepsin. Protein digestion starts here; nothing is absorbed yet." },
      { id: "small-intestine", name: "Small Intestine",       desc: "About six metres long, three segments (duodenum, jejunum, ileum). Where 90% of digestion finishes and almost all absorption happens." },
      { id: "villi",          name: "Villi & Microvilli",     desc: "Finger-like projections lining the small intestine. Each is packed with capillaries and a lymph vessel, giving the gut a surface area the size of a tennis court." },
      { id: "accessory",      name: "Accessory Organs",       desc: "Liver, gallbladder, and pancreas. They don't carry food, but they add bile, enzymes, and bicarbonate that the gut needs to finish digestion." },
      { id: "large-intestine", name: "Large Intestine",       desc: "About 1.5 metres long. Absorbs water and electrolytes from what's left, and houses the gut microbiome that ferments fibre." },
      { id: "portal",         name: "Portal Circulation",     desc: "Blood from the gut doesn't go straight to the heart — it goes to the liver first, through the hepatic portal vein, so the liver can process everything you absorbed." },
      { id: "whole-end",      name: "Putting It Together",    desc: "Mechanical and chemical digestion, absorption, processing by the liver, and elimination. Every step depends on the one before it." },
    ],
    narration: [
      "Your digestive system takes food — large, complex, unusable — and breaks it down into molecules small enough to absorb into your blood. It's a tube about nine metres long, from mouth to anus, with accessory organs branching off it. Every part of that tube has a specific job, and each job has to happen in the right order.",
      "The tube itself has four layers, from the inside out: the mucosa, the submucosa, the muscularis, and the serosa. The mucosa does the absorbing and secreting, the muscularis does the churning, and the whole thing is held together by connective tissue. Along the way, the tube is divided into named segments — mouth, oesophagus, stomach, small intestine, large intestine, rectum, anus.",
      "Digestion happens in two ways at once. Mechanical digestion is chewing, churning, and mixing — it breaks food into smaller pieces but doesn't change the molecules. Chemical digestion uses enzymes to actually split molecules apart — proteins into amino acids, starches into glucose, fats into fatty acids and glycerol. Both kinds happen in every part of the tube that sees food.",
      "The stomach is a muscular bag. It stores food, churns it into a soupy mix called chyme, and adds gastric juice — hydrochloric acid and the enzyme pepsin. Protein digestion starts here. The acid kills bacteria too. Nothing is absorbed in the stomach; its job is to prepare food for the small intestine, and to release it in controlled amounts.",
      "The small intestine is where almost everything happens. It's about six metres long, divided into three segments — duodenum, jejunum, and ileum. About ninety per cent of digestion finishes here, and almost all absorption happens here. The duodenum receives bile and pancreatic juice; the jejunum and ileum do the absorbing.",
      "The inner wall of the small intestine is covered in villi — finger-like projections about a millimetre tall, and each one is covered in even smaller microvilli. This massively increases the surface area for absorption. Every villus has a capillary network inside it, so nutrients absorbed at the surface are immediately picked up by the blood.",
      "Three organs help without being part of the food-carrying tube. The pancreas makes pancreatic juice — a cocktail of enzymes that digest protein, fat, and carbohydrate, plus bicarbonate to neutralise stomach acid. The liver makes bile, which emulsifies fat. The gallbladder stores bile and releases it when food arrives. All three connect to the duodenum by ducts.",
      "After the small intestine has extracted what it can, what's left enters the large intestine — about a metre and a half long. Its job is to absorb water and electrolytes. By the time material has passed through, it's changed from watery chyme to solid stool. The large intestine also houses the gut microbiome, which ferments fibre and produces some vitamins.",
      "Absorbed nutrients don't go straight to the heart. Blood from the gut goes first to the liver, through the hepatic portal vein. This lets the liver process everything you just absorbed — detoxifying, storing, or redistributing — before it reaches the rest of the body. It's why the liver is called the body's chemical factory.",
      "Putting it all together: mechanical and chemical digestion break food down, absorption pulls nutrients into the blood, the portal circulation takes them to the liver for processing, and whatever can't be absorbed is eliminated as stool. Every step depends on the one before it — a problem at any stage ripples through the whole system, from a missing enzyme to a damaged villus to a blocked duct.",
    ],
    stepFocus: [
      ["whole"],
      ["tube"],
      ["digestion"],
      ["stomach"],
      ["small-intestine"],
      ["villi"],
      ["accessory"],
      ["large-intestine"],
      ["portal"],
      ["whole-end"],
    ],
    viewBox: "0 0 900 620",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["ph2:digestive-system"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // Which segment of the GI tract is highlighted at each step.
      const activeSegment = [
        null,               // 0 - whole
        null,               // 1 - tube
        null,               // 2 - digestion
        "stomach",          // 3 - stomach
        "small-intestine",  // 4 - small intestine
        "small-intestine",  // 5 - villi (still on small intestine)
        null,               // 6 - accessory organs
        "large-intestine",  // 7 - large intestine
        null,               // 8 - portal
        null,               // 9 - putting it together
      ][activeStep];

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {/* The GI tract — the centrepiece. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasGITract({
              cx: 380, cy: 320, scale: 1.1,
              activeSegment,
            })}
            <rect x="120" y="60" width="520" height="520" fill="none" {...ring("whole")} pointerEvents="none" />
          </g>

          {/* Tube label anchor */}
          <g style={{ cursor: cur }} onClick={click("tube")} filter={hotFilter("tube")}>
            <circle cx="200" cy="200" r="50" fill="none" {...ring("tube")} pointerEvents="none" />
          </g>

          {/* Small intestine label anchor */}
          <g style={{ cursor: cur }} onClick={click("small-intestine")} filter={hotFilter("small-intestine")}>
            <circle cx="380" cy="420" r="70" fill="none" {...ring("small-intestine")} pointerEvents="none" />
          </g>

          {/* Villi inset — magnified view of intestinal wall, shown on
             the villi step. */}
          {isHot("villi") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="180" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>VILLI (magnified)</text>
              {/* Four finger-like villi, each with a red capillary loop */}
              {[680, 710, 740, 770].map((vx, i) => (
                <g key={i}>
                  <path d={`M${vx},240 Q${vx - 6},200 ${vx},170 Q${vx + 6},200 ${vx},240 Z`} fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.2" />
                  <path d={`M${vx},232 Q${vx - 3},210 ${vx},180 Q${vx + 3},210 ${vx},232`} fill="none" stroke="#E53935" strokeWidth="1.2" />
                </g>
              ))}
              <text x="750" y="270" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">each villus has a capillary inside</text>
            </g>
          )}

          {/* Accessory organs inset */}
          {isHot("accessory") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="160" rx="14" fill="var(--bg-2)" stroke="#16A34A" strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#16A34A">ACCESSORY ORGANS</text>
              <text x="660" y="172" fontSize="9.5" fontWeight="700" fill="#C0392B">Liver</text>
              <text x="660" y="186" fontSize="8.5" fill="var(--text-2)">makes bile</text>
              <text x="660" y="212" fontSize="9.5" fontWeight="700" fill="#16A34A">Gallbladder</text>
              <text x="660" y="226" fontSize="8.5" fill="var(--text-2)">stores bile</text>
              <text x="660" y="252" fontSize="9.5" fontWeight="700" fill="#B8860B">Pancreas</text>
              <text x="660" y="266" fontSize="8.5" fill="var(--text-2)">enzymes + bicarbonate</text>
            </g>
          )}

          {/* Portal circulation inset — a diagram showing blood going
             gut → liver → heart instead of gut → heart directly. */}
          {isHot("portal") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="180" rx="14" fill="var(--bg-2)" stroke="#2F6FED" strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#2F6FED">PORTAL CIRCULATION</text>
              {/* Gut → Liver → Heart */}
              <text x="665" y="180" fontSize="9.5" fontWeight="700" fill="var(--text)">gut</text>
              <line x1="690" y1="178" x2="730" y2="178" stroke="#2F6FED" strokeWidth="2" />
              <polygon points="730,178 722,174 722,182" fill="#2F6FED" />
              <text x="740" y="182" fontSize="9.5" fontWeight="700" fill="var(--text)">liver</text>
              <line x1="770" y1="178" x2="810" y2="178" stroke="#2F6FED" strokeWidth="2" />
              <polygon points="810,178 802,174 802,182" fill="#2F6FED" />
              <text x="825" y="182" fontSize="9.5" fontWeight="700" fill="var(--text)">heart</text>
              <text x="750" y="215" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">hepatic portal vein</text>
              <text x="750" y="240" textAnchor="middle" fontSize="8.5" fill="var(--text-2)">everything absorbed hits the liver first</text>
              <text x="750" y="262" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill="var(--text-3)">liver = chemical factory</text>
            </g>
          )}

          {/* Digestion inset — mechanical vs chemical, side by side. */}
          {isHot("digestion") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="160" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>TWO KINDS OF DIGESTION</text>
              <text x="660" y="175" fontSize="9.5" fontWeight="700" fill="#2F6FED">Mechanical</text>
              <text x="660" y="190" fontSize="8.5" fill="var(--text-2)">chewing, churning, mixing</text>
              <text x="660" y="204" fontSize="8.5" fill="var(--text-2)">pieces get smaller</text>
              <text x="660" y="234" fontSize="9.5" fontWeight="700" fill="#C0392B">Chemical</text>
              <text x="660" y="249" fontSize="8.5" fill="var(--text-2)">enzymes split molecules</text>
              <text x="660" y="263" fontSize="8.5" fill="var(--text-2)">proteins → amino acids</text>
            </g>
          )}

          {/* Large intestine inset — water absorption. */}
          {isHot("large-intestine") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="140" rx="14" fill="var(--bg-2)" stroke="#C0392B" strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0392B">LARGE INTESTINE</text>
              <text x="750" y="172" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">absorbs water + electrolytes</text>
              <text x="750" y="190" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">houses the gut microbiome</text>
              <text x="750" y="208" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">ferments fibre</text>
              <text x="750" y="234" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill="var(--text-3)">watery chyme → solid stool</text>
            </g>
          )}

          {/* Whole-end recap inset */}
          {isHot("whole-end") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="120" width="220" height="180" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="750" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ATLAS_COLORS.trunk}>THE WHOLE STORY</text>
              <text x="660" y="172" fontSize="9" fill="var(--text-2)">1. chew + churn</text>
              <text x="660" y="190" fontSize="9" fill="var(--text-2)">2. stomach adds acid + pepsin</text>
              <text x="660" y="208" fontSize="9" fill="var(--text-2)">3. duodenum adds bile + enzymes</text>
              <text x="660" y="226" fontSize="9" fill="var(--text-2)">4. jejunum + ileum absorb</text>
              <text x="660" y="244" fontSize="9" fill="var(--text-2)">5. liver processes everything</text>
              <text x="660" y="262" fontSize="9" fill="var(--text-2)">6. colon reabsorbs water</text>
            </g>
          )}

          {/* Static region labels */}
          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">The digestive tube — mouth to anus</text>
          <text x="450" y="605" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Chew, churn, split, absorb, process, eliminate</text>
        </svg>
      );
    },
  },

  /* =========================================================
     BLOOD ANTICOAGULANTS
     Topic: Hematology I (hem), Topic 06 (index 5).
     Closes the Hematology I course. Uses the atlasClottingCascade
     primitive to show WHERE each of the three anticoagulant
     strategies acts, plus a row of the four laboratory tubes
     at the bottom. Two arenas — the patient and the tube —
     shown together.
     ========================================================= */
  "hem:6": {
    id: "hem:6",
    type: "diagram",
    title: "Blood Anticoagulants — Drugs, Tubes, and Mechanisms",
    topic: { courseId: "hem", topicIndex: 5 },
    parent: null,
    summary: "Blood is meant to clot — it's the reason you don't bleed out from a paper cut. But clotting becomes dangerous when it happens inside a vessel that's still intact, and it becomes useless when it happens inside a blood sample before the lab can test it. Anticoagulants exist to interfere with the clotting mechanism in both situations. There are three ways to do that: remove the calcium the cascade needs (EDTA, citrate, oxalate), accelerate the body's own inhibitor antithrombin (heparin), or stop the liver from making the vitamin K dependent factors (warfarin). Every anticoagulant you'll meet in this course — whether it's given to a patient or sits inside a blood tube — works through one of those three strategies.",
    labels: [
      { id: "whole",       name: "The Whole Picture",       desc: "Two arenas, three strategies. Anticoagulants protect the patient from dangerous clots, and protect the sample from clotting before testing — using the same underlying mechanisms." },
      { id: "cascade",     name: "The Clotting Cascade",    desc: "The chain of clotting factors that ends in a fibrin mesh. It depends on calcium ions at several key steps — and that dependency is what most anticoagulants exploit." },
      { id: "heparin",     name: "Heparin",                 desc: "An indirect anticoagulant given by injection. Binds antithrombin and makes it neutralise thrombin and factor Xa far more quickly. Monitored by the activated partial thromboplastin time. Reversed by protamine." },
      { id: "warfarin",    name: "Warfarin",                desc: "An oral anticoagulant for long-term prevention. Blocks the liver's ability to make vitamin K dependent factors II, VII, IX and X. Monitored by the PT/INR. Reversed by vitamin K." },
      { id: "edta",        name: "EDTA (purple tube)",       desc: "The tube for the full blood count. Chelates calcium so tightly that the cascade stalls irreversibly. Preserves cell morphology exceptionally well — but interferes with calcium and other ion measurements, and can cause platelet clumping." },
      { id: "citrate",     name: "Citrate (blue tube)",      desc: "The tube for coagulation tests. Binds calcium weakly and reversibly — so the lab can add calcium back and watch the clot form under controlled conditions. The fill volume must be exact, or the result is invalid." },
      { id: "lab-heparin", name: "Heparin (green tube)",     desc: "The tube for blood gases and some biochemistry. Leaves calcium in the sample intact, so it interferes with fewer analytes. But it distorts white cell morphology and is unsuitable for the full blood count." },
      { id: "oxalate",     name: "Oxalate (grey tube)",      desc: "An older calcium chelator, largely obsolete. Damages red cells — causing haemolysis and falsely high potassium — and forms calcium oxalate crystals that interfere with some measurements. Survives in a few specialised glucose and lactate assays." },
    ],
    narration: [
      "This is the clotting cascade — the chain of proteins in your plasma that turns liquid blood into a solid clot. Two routes run down the sides, intrinsic and extrinsic, and both converge on the same common pathway in the middle, which ends in a fibrin mesh. That mesh is the actual plug that stops the bleeding.",
      "The whole cascade is a relay. Each factor switches on the next, until fibrinogen is converted into fibrin. Any break in that relay — anywhere along the chain — stops the clot from forming. That's the property every anticoagulant exploits: they don't have to block the whole cascade, they just have to break one link.",
      "Look at the red X's on the cascade. Four of these steps have the same requirement: calcium ions. Without calcium to bridge the clotting factors to the platelet surface, those steps can't happen. Remove the calcium, and the cascade stalls here — while every factor is still sitting in the plasma, unused. This is the first anticoagulant strategy, and it's the one most laboratory tubes rely on.",
      "Now the X's are gone and two steps are ringed in amber. This is where heparin acts. The body already makes a protein called antithrombin that neutralises two of these factors — thrombin, right here, and factor Xa above it. But antithrombin works too slowly on its own to stop an active clot. Heparin binds antithrombin and changes its shape, making it hundreds of times more effective. Heparin isn't an inhibitor itself — it's an accelerator of an inhibitor that's already there.",
      "Here, four factors have faded: II, VII, IX, and X. These are the vitamin K dependent factors — the liver can only make them if it can recycle vitamin K. Warfarin blocks that recycling step. The already-circulating factors still work for a few days, which is why warfarin is slow to start and slow to stop. But once they decay, no new ones can be made.",
      "Now we switch arenas — from the patient to the laboratory. Down at the bottom you can see four colour-coded tubes, and each one contains a different anticoagulant. Every tube is chosen to preserve some measurements and interfere with others. Choosing the wrong tube doesn't just give a wrong answer — it can give a result that looks perfectly plausible and is entirely wrong.",
      "First tube on the left: EDTA, the purple one. It's the calcium chelator we saw on the cascade — it binds calcium so tightly that the cascade stalls irreversibly. That's why it's the tube for the full blood count: it preserves red cells, white cells and platelets unusually well. But it wrecks any measurement of calcium or other ions it binds, and it can cause platelets to clump in some patients — producing a falsely low platelet count.",
      "Next: citrate, the blue tube. It also binds calcium — but loosely and reversibly. That's the whole reason it's used for clotting tests: the lab can add calcium back to the sample and watch the clot form under controlled conditions. The tube must be filled to the mark, because the blood-to-anticoagulant ratio has to be exact. An underfilled blue tube is over-anticoagulated, and the clotting times come out falsely prolonged.",
      "The last two tubes are the ones we haven't talked about yet. The green tube is heparin — the same drug we saw acting on the cascade, just in tube form. It leaves calcium intact, so it's used where a chelator would ruin the measurement: blood gases, some electrolytes. But it distorts white cell shape and can't be used for the full blood count. The grey tube is oxalate — an older chelator, largely abandoned because it damages red cells and forms crystals.",
      "And here's the whole picture at once. Three strategies act on the cascade — remove calcium, accelerate antithrombin, or block vitamin K. Four laboratory tubes each use one of those strategies to preserve a specific test. Match the agent to the purpose, and you get a valid sample. Mismatch it, and the anticoagulant itself becomes the source of the error.",
    ],
    stepFocus: [
      ["whole"],
      ["whole"],
      ["cascade"],
      ["heparin"],
      ["warfarin"],
      ["whole", "edta", "citrate", "lab-heparin", "oxalate"],
      ["edta"],
      ["citrate"],
      ["lab-heparin", "oxalate"],
      ["whole", "edta", "citrate", "lab-heparin", "oxalate"],
    ],
    viewBox: "0 0 900 760",
    render: ({ onLabelClick, activeLabelId, activeStep = 0, preview }) => {
      const diagram = DIAGRAMS["hem:6"];
      const focus = diagram.stepFocus[activeStep] || [];
      const inFocus = (id) => focus.includes(id);
      const lastStep = diagram.narration.length - 1;
      const click = (id) => (preview ? undefined : () => onLabelClick(id));
      const cur = preview ? "default" : "pointer";
      const ring = (id) => (activeLabelId === id
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3.5 }
        : { stroke: "transparent", strokeWidth: 0 });
      const isHot = (id) => inFocus(id) && activeStep !== lastStep;
      const hotFilter = (id) => (isHot(id) ? "url(#atlas-glow)" : undefined);

      // Which blockAt mode the cascade is showing per step.
      const blockAt = [
        null,             // 0 - whole
        null,             // 1 - two arenas
        "calcium",        // 2 - cascade & calcium
        "antithrombin",   // 3 - heparin
        "vitaminK",       // 4 - warfarin
        "calcium",        // 5 - lab anticoagulants overview
        "calcium",        // 6 - EDTA
        "calcium",        // 7 - citrate
        null,             // 8 - heparin + oxalate lab
        "calcium",        // 9 - artifacts
      ][activeStep];

      // Tube glyphs — one per lab anticoagulant. Drawn as a small
      // test tube with a coloured cap, matching the cap colour of the
      // real collection tube for that anticoagulant. Anchored at
      // tubeTopY, which is set below the cascade area and above the
      // footer text so nothing overlaps.
      const tubeTopY = 580;
      const tube = (id, cx, capColor, bodyColor, label, sub) => {
        const isFocused = isHot(id);
        const tubeW = 44;
        const tubeH = 110;
        const capH = 14;
        return (
          <g
            key={id}
            style={{ cursor: cur }}
            onClick={click(id)}
            filter={isFocused ? "url(#atlas-glow)" : undefined}
            className={isFocused ? "atlas-pulse" : undefined}
          >
            {/* Tube body — pale glass */}
            <rect
              x={cx - tubeW / 2}
              y={tubeTopY}
              width={tubeW}
              height={tubeH}
              rx={6}
              fill="#F4F2EE"
              stroke="#94A3B8"
              strokeWidth="1.4"
            />
            {/* Liquid inside — the anticoagulant solution */}
            <rect
              x={cx - tubeW / 2 + 3}
              y={tubeTopY + capH + 6}
              width={tubeW - 6}
              height={tubeH - capH - 14}
              rx={4}
              fill={bodyColor}
              opacity="0.35"
            />
                        {/* Coloured cap */}
            <rect
              x={cx - tubeW / 2 - 3}
              y={tubeTopY - 6}
              width={tubeW + 6}
              height={capH}
              rx={3}
              fill={capColor}
              stroke={capColor}
              strokeWidth="1.4"
            />
            {/* Label under the tube */}
            <text
              x={cx}
              y={tubeTopY + tubeH + 20}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill="var(--text)"
            >
              {label}
            </text>
            <text
              x={cx}
              y={tubeTopY + tubeH + 34}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-2)"
            >
              {sub}
            </text>
                        {/* Selection ring */}
            <rect
              x={cx - tubeW / 2 - 8}
              y={tubeTopY - 12}
              width={tubeW + 16}
              height={tubeH + 20}
              rx={10}
              fill="none"
              {...ring(id)}
              pointerEvents="none"
            />
          </g>
        );
      };

      return (
        <svg viewBox="0 0 900 760" width="100%" height="100%">
          {/* ---- TOP HALF: the clotting cascade ---- */}
          {/* Cascade drawn at cx 350, giving the right-edge captions
             (which extend from the cascade's right column at x ≈ 520)
             clear space before the insets at x 640. */}
          <g style={{ cursor: cur }} onClick={click("whole")} filter={hotFilter("whole")}>
            {atlasClottingCascade({
              cx: 350, cy: 200, scale: 1,
              blockAt,
              showLabels: true,
              highlight: false,
            })}
          </g>

          {/* Cascade label anchor — a clickable region over the cascade */}
          <g style={{ cursor: cur }} onClick={click("cascade")} filter={hotFilter("cascade")}>
            <rect x="30" y="40" width="620" height="380" fill="none" {...ring("cascade")} pointerEvents="none" />
          </g>

          {/* Heparin inset — shown on its own step. Positioned below the
             cascade and above the tube row, so it never collides with
             the cascade captions or the tube labels. */}
          {isHot("heparin") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="410" width="230" height="150" rx="14" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="755" y="435" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>HEPARIN</text>
              <text x="755" y="458" textAnchor="middle" fontSize="9" fill="var(--text-2)">indirect anticoagulant —</text>
              <text x="755" y="473" textAnchor="middle" fontSize="9" fill="var(--text-2)">accelerates antithrombin</text>
              <text x="755" y="495" textAnchor="middle" fontSize="9" fill="var(--text-2)">given by injection</text>
              <text x="755" y="510" textAnchor="middle" fontSize="9" fill="var(--text-2)">acts within minutes</text>
              <text x="755" y="530" textAnchor="middle" fontSize="9" fontWeight="700" fill={ATLAS_COLORS.trunk}>monitored by aPTT</text>
              <text x="755" y="550" textAnchor="middle" fontSize="8" fill="var(--text-3)">bleeding · HIT (rare, paradoxical)</text>
            </g>
          )}

          {/* Warfarin inset — shown on its own step. Same position as the
             heparin inset; only one is displayed at a time. */}
          {isHot("warfarin") && (
            <g pointerEvents="none" filter="url(#atlas-glow)">
              <rect x="640" y="410" width="230" height="150" rx="14" fill="var(--bg-2)" stroke="#2F6FED" strokeWidth="2" />
              <text x="755" y="435" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2F6FED">WARFARIN</text>
              <text x="755" y="458" textAnchor="middle" fontSize="9" fill="var(--text-2)">blocks vitamin K recycling</text>
              <text x="755" y="473" textAnchor="middle" fontSize="9" fill="var(--text-2)">liver can't make II, VII, IX, X</text>
              <text x="755" y="495" textAnchor="middle" fontSize="9" fill="var(--text-2)">oral · slow onset and offset</text>
              <text x="755" y="510" textAnchor="middle" fontSize="9" fill="var(--text-2)">long-term prevention</text>
              <text x="755" y="530" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2F6FED">monitored by PT / INR</text>
              <text x="755" y="550" textAnchor="middle" fontSize="8" fill="var(--text-3)">reversed by vitamin K · teratogenic</text>
            </g>
          )}

          {/* ---- BOTTOM HALF: the four laboratory tubes ---- */}
          {/* Lab header sits left of the insets. The insets occupy
             x 640–870 when shown; the header is centered at x 300 so
             it spans roughly x 0–600 and never collides with them. */}
          <text
            x="300"
            y="560"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="var(--text-2)"
            pointerEvents="none"
          >
            Laboratory anticoagulants — colour-coded tubes
          </text>

          {/* EDTA — purple */}
          {tube("edta", 190, "#8B5CF6", "#DDD0FF", "EDTA", "purple · FBC")}

          {/* Citrate — blue */}
          {tube("citrate", 380, "#2F6FED", "#B8CFFF", "Citrate", "blue · coagulation")}

          {/* Lab heparin — green */}
          {tube("lab-heparin", 570, "#16A34A", "#B8F0D0", "Heparin", "green · blood gases")}

          {/* Oxalate — grey */}
          {tube("oxalate", 760, "#64748B", "#C7D0DC", "Oxalate", "grey · rare assays")}

          {/* Static region labels. The cascade header centers on the
             cascade's new x position (350). The footer sits below the
             tube sub-labels, giving the tube row its own clean band. */}
          <text x="350" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">The clotting cascade</text>
          <text x="450" y="755" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-2)" pointerEvents="none">Three strategies · two arenas · match the agent to the purpose</text>
        </svg>
      );
    },
  },

};