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
export const ATLAS_COURSE_NAMES = {
  hem: "Hematology I",
  ph2: "Physiology II",
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

};