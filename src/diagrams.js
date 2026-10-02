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
      <stop offset="0%" stopColor="#FFD873" />
      <stop offset="100%" stopColor={ATLAS_COLORS.trunk} />
    </linearGradient>
    <linearGradient id="atlas-grad-lymphoid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#5C93FF" />
      <stop offset="100%" stopColor={ATLAS_COLORS.lymphoid} />
    </linearGradient>
    <linearGradient id="atlas-grad-erythroid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#E0685A" />
      <stop offset="100%" stopColor={ATLAS_COLORS.erythroid} />
    </linearGradient>
    <linearGradient id="atlas-grad-nucleus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#B19DFA" />
      <stop offset="100%" stopColor={ATLAS_COLORS.nucleus} />
    </linearGradient>
    <filter id="atlas-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#000" floodOpacity="0.28" />
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

/* ---------------------------------------------------------------- */
/* Cardiac cycle - a small valve glyph, reused four times. Not an   */
/* atlasNode (this diagram isn't a flowchart of boxes - it's one    */
/* heart whose parts change state), so it gets its own tiny helper, */
/* same way the erythroid maturation strip above has its own stage  */
/* layout instead of forcing the tree layout to fit.                */
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
      <line x1={-spread} y1={-10} x2={0} y2={0} stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1={spread} y1={-10} x2={0} y2={0} stroke={color} strokeWidth="4" strokeLinecap="round" />
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
      fill={oxygenated ? ATLAS_COLORS.erythroid : ATLAS_COLORS.lymphoid}
      opacity="0.9" />
    <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.3}
      fill={oxygenated ? "#F5C7C0" : "#B8D0FF"} opacity="0.7" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="9" fill="var(--text-2)">{label}</text>}
  </g>
);

const atlasWhiteCell = ({ cx, cy, r = 7, label }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#F3F1FF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.2" />
    <circle cx={cx} cy={cy} r={r * 0.55} fill={ATLAS_COLORS.nucleus} opacity="0.75" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="9" fill="var(--text-2)">{label}</text>}
  </g>
);

const atlasPlatelet = ({ cx, cy, r = 4, label }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.6" />
    {label && <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="9" fill="var(--text-2)">{label}</text>}
  </g>
);

const atlasLymphNode = ({ cx, cy, scale = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}>
    <ellipse cx="0" cy="0" rx="16" ry="11" fill={ATLAS_COLORS.lymphoid} opacity="0.7" />
    <ellipse cx="0" cy="0" rx="10" ry="6" fill="#0A0F1A" opacity="0.22" />
    <ellipse cx="-4" cy="-2" rx="3" ry="2" fill="#fff" opacity="0.5" />
    <ellipse cx="4" cy="2" rx="3" ry="2" fill="#fff" opacity="0.5" />
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

const atlasLungs = ({ cx, cy, scale = 1, highlight = false }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}
    stroke={highlight ? ATLAS_COLORS.trunk : ATLAS_COLORS.neutral}
    strokeWidth={highlight ? 2 : 1.4}>
    <rect x="-6" y="-60" width="12" height="30" rx="4" fill="#F3F1FF" opacity="0.9" />
    <path d="M0,-30 Q-14,-22 -22,-10" fill="none" />
    <path d="M0,-30 Q14,-22 22,-10" fill="none" />
    <path d="M-18,-8 Q-58,-4 -58,32 Q-58,60 -26,66 Q-10,60 -8,26 Q-10,4 -18,-8 Z"
      fill="#FBE9E7" opacity="0.85" />
    <path d="M18,-8 Q58,-4 58,32 Q58,60 26,66 Q10,60 8,26 Q10,4 18,-8 Z"
      fill="#FBE9E7" opacity="0.85" />
    {[[-34,20],[-44,36],[-28,44],[34,20],[44,36],[28,44]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3" fill={ATLAS_COLORS.lymphoid} opacity="0.55" />
    ))}
  </g>
);

const atlasHeart = ({ cx, cy, scale = 1, highlight = false, onDrill }) => (
  <g transform={`translate(${cx},${cy}) scale(${scale})`}
    style={onDrill ? { cursor: "pointer" } : undefined}>
    <path
      d="M-50,-15 Q-62,-50 -30,-62 Q0,-70 0,-45 Q0,-70 30,-62 Q62,-50 50,-15 Q45,20 0,58 Q-45,20 -50,-15 Z"
      fill="#FBE9E7" opacity="0.4" stroke={ATLAS_COLORS.erythroid} strokeWidth="1.4" />
    <path d="M-42,-25 Q-32,-45 -14,-40 L-14,-8 Q-30,-6 -42,-25 Z"
      fill={ATLAS_COLORS.lymphoid} opacity="0.75" />
    <path d="M42,-25 Q32,-45 14,-40 L14,-8 Q30,-6 42,-25 Z"
      fill={ATLAS_COLORS.erythroid} opacity="0.75" />
    <path d="M-42,-4 Q-46,26 -14,44 L-6,-2 Q-26,-4 -42,-4 Z"
      fill={ATLAS_COLORS.lymphoid} opacity="0.85" />
    <path d="M42,-4 Q46,26 14,44 L6,-2 Q26,-4 42,-4 Z"
      fill={ATLAS_COLORS.erythroid} opacity="0.85" />
    <line x1="-4" y1="-40" x2="-4" y2="44" stroke="#0A0F1A" strokeWidth="2.5" opacity="0.4" />
    <text x="-26" y="-22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">RA</text>
    <text x="26" y="-22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">LA</text>
    <text x="-24" y="24" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">RV</text>
    <text x="24" y="24" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">LV</text>
    {highlight && <path
      d="M-50,-15 Q-62,-50 -30,-62 Q0,-70 0,-45 Q0,-70 30,-62 Q62,-50 50,-15 Q45,20 0,58 Q-45,20 -50,-15 Z"
      fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="3" />}
    {onDrill && <text x="42" y="-46" textAnchor="middle" fontSize="13" fill={ATLAS_COLORS.trunk}>⤢</text>}
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
  </g>
);

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
      { id: "clp", name: "Common Lymphoid Progenitor", desc: "Commits to the lymphoid line — B cells, T cells and natural killer cells. These are the cells of adaptive and innate immunity." },
      { id: "myeloid-leaf", name: "Myeloid-derived cells", desc: "Red cells, platelets, granulocytes and monocytes — all downstream of the common myeloid progenitor. Open the CMP branch to see each one." },
      { id: "b", name: "B Lymphocytes", desc: "Mature in the bone marrow, produce antibodies once activated." },
      { id: "t", name: "T Lymphocytes", desc: "Mature in the thymus, coordinate and carry out cell-mediated immunity." },
      { id: "nk", name: "Natural Killer Cells", desc: "Innate lymphoid cells that kill virus-infected and tumour cells without needing prior sensitisation." },
    ],
    narration: [
      "Every second of your life, roughly two million red blood cells die and are replaced. All of it starts with one kind of cell.",
      "The haematopoietic stem cell can do two things at once — make a copy of itself, and give rise to every blood cell you will ever have.",
      "Before birth this happens in the yolk sac, then the liver, then finally settles permanently in the bone marrow.",
      "From the stem cell, two broad progenitor lines branch out — the common myeloid progenitor and the common lymphoid progenitor.",
      "The myeloid progenitor is the trunk for red cells, platelets, granulocytes and monocytes — the cells of oxygen transport and innate defence.",
      "The lymphoid progenitor is the trunk for B cells, T cells and natural killer cells — the cells of adaptive and innate immunity.",
      "Each of these lines branches further into progenitors committed to one or two final cell types.",
      "Growth factors — EPO, G-CSF, thrombopoietin — act at specific branch points, pushing a progenitor to mature down one path.",
      "By the time a cell reaches the end of a branch it has lost the ability to become anything else. This is terminal differentiation.",
      "Tap the myeloid progenitor now to see this branch open up in full detail.",
    ],
    stepFocus: [
      ["hsc"], ["hsc"], ["hsc"], ["hsc", "cmp", "clp"], ["cmp"], ["clp"], ["cmp", "clp"], ["cmp"], ["b", "t", "nk", "myeloid-leaf"], ["cmp"],
    ],
        viewBox: "0 0 900 440",
    render: ({ onLabelClick, activeLabelId, activeStep, onOpenDrill, preview }) => {
      const focus = DIAGRAMS["hem:haematopoiesis"].stepFocus[activeStep] || [];
      const c = (id, props) => atlasCell({ ...props, id, onLabelClick, activeLabelId, pulsing: !preview && focus.includes(id) });
      return (
        <svg viewBox="0 0 900 440" width="100%" height="100%">
          {atlasDefs()}
          {atlasFlow("M450,116 Q350,135 260,152")}
          {atlasFlow("M450,116 Q550,135 640,152")}
          {atlasFlow("M260,230 Q220,270 195,300")}
          {atlasFlow("M640,230 Q565,270 495,300")}
          {atlasFlow("M640,230 Q625,270 605,300")}
          {atlasFlow("M640,230 Q685,270 710,300")}

          {c("hsc", { cx: 450, cy: 70, r: 46, label: "HSC", sub: "Stem cell", fill: ATLAS_COLORS.nucleus, dim: ATLAS_COLORS.nucleusDim })}
          {c("cmp", { cx: 260, cy: 190, r: 40, label: "CMP", sub: "Myeloid", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim, onOpenDrill: true })}
          {c("clp", { cx: 640, cy: 190, r: 40, label: "CLP", sub: "Lymphoid", fill: ATLAS_COLORS.lymphoid, dim: ATLAS_COLORS.lymphoidDim })}

          {/* myeloid-leaf: one clickable cluster of illustrated cells, same
              single label/id as before - red cell, platelet, granulocyte */}
          <g onClick={() => onLabelClick("myeloid-leaf")} style={{ cursor: "pointer" }} className={!preview && focus.includes("myeloid-leaf") ? "atlas-pulse" : ""}>
            <g transform="translate(165,320)">
              <ellipse cx="0" cy="0" rx="24" ry="14" fill="url(#atlas-grad-erythroid)" opacity={activeLabelId === "myeloid-leaf" ? 1 : 0.55} />
              <ellipse cx="0" cy="0" rx="11" ry="6" fill="#F5C7C0" opacity="0.7" />
            </g>
            <g transform="translate(205,340)">
              <circle r="10" fill="url(#atlas-grad-trunk)" opacity={activeLabelId === "myeloid-leaf" ? 1 : 0.55} />
            </g>
            <g transform="translate(180,355)">
              <circle r="12" fill="url(#atlas-grad-erythroid)" opacity={activeLabelId === "myeloid-leaf" ? 0.9 : 0.45} />
            </g>
            <text x="195" y="390" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={activeLabelId === "myeloid-leaf" ? ATLAS_COLORS.erythroid : "var(--text)"}>Red cells · platelets</text>
            <text x="195" y="402" textAnchor="middle" fontSize="9" fill="var(--text-2)">granulocytes · monocytes</text>
          </g>

          {c("b", { cx: 495, cy: 330, r: 28, label: "B cells", fill: ATLAS_COLORS.lymphoid, dim: ATLAS_COLORS.lymphoidDim })}
          {c("t", { cx: 605, cy: 330, r: 28, label: "T cells", fill: ATLAS_COLORS.lymphoid, dim: ATLAS_COLORS.lymphoidDim })}
          {c("nk", { cx: 715, cy: 330, r: 28, label: "NK cells", fill: ATLAS_COLORS.lymphoid, dim: ATLAS_COLORS.lymphoidDim })}
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
      const n = (id, props) => atlasNode({ ...props, id, onLabelClick, activeLabelId, pulsing: !preview && focus.includes(id) });
      return (
        <svg viewBox="0 0 900 380" width="100%" height="100%">
          {atlasDefs()}
          {atlasLine(450, 90, 260, 160)}
          {atlasLine(450, 90, 640, 160)}
          {atlasLine(260, 220, 180, 280)}
          {atlasLine(260, 220, 340, 280)}
          {atlasLine(640, 220, 640, 280)}
          {n("cmp", { x: 380, y: 30, w: 140, h: 60, label: "CMP", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim })}
          {n("gmp", { x: 180, y: 160, w: 160, h: 60, label: "GMP", sub: "Granulocyte-monocyte", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim })}
          {n("mep", { x: 560, y: 160, w: 160, h: 60, label: "MEP", sub: "Megakaryocyte-erythroid", fill: ATLAS_COLORS.erythroid, dim: ATLAS_COLORS.erythroidDim, onOpenDrill: true })}
          {n("gran", { x: 90, y: 280, w: 140, h: 55, label: "Granulocytes", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim })}
          {n("mono", { x: 250, y: 280, w: 140, h: 55, label: "Monocytes", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim })}
          {n("mega", { x: 560, y: 280, w: 160, h: 55, label: "Megakaryocytes", sub: "→ Platelets", fill: ATLAS_COLORS.erythroid, dim: ATLAS_COLORS.erythroidDim })}
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
      const n = (id, props) => atlasNode({ ...props, id, onLabelClick, activeLabelId, pulsing: !preview && focus.includes(id) });
      const stages = [
        { id: "s1", label: "Proerythro-\nblast" }, { id: "s2", label: "Basophilic\nnormoblast" },
        { id: "s3", label: "Polychromato-\nphilic" }, { id: "s4", label: "Orthochromatic\nnormoblast" },
        { id: "s5", label: "Reticulocyte" }, { id: "s6", label: "Mature\nRBC" },
      ];
      const w = 120, gap = 20, startX = 40, y = 120;
      return (
        <svg viewBox="0 0 900 260" width="100%" height="100%">
          {atlasDefs()}
          {stages.slice(0, -1).map((s, i) => atlasLine(startX + (i + 1) * (w + gap) - gap, y + 25, startX + (i + 1) * (w + gap), y + 25))}
          {n("epo", { x: 520, y: 30, w: 190, h: 40, label: "EPO", sub: "acts here →", fill: ATLAS_COLORS.trunk, dim: ATLAS_COLORS.trunkDim })}
          {stages.map((s, i) => n(s.id, {
            x: startX + i * (w + gap), y, w, h: 65,
            label: s.label.split("\n")[0], sub: s.label.split("\n")[1] || "",
            fill: ATLAS_COLORS.erythroid, dim: ATLAS_COLORS.erythroidDim,
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
        ? { stroke: ATLAS_COLORS.trunk, strokeWidth: 3 }
        : { stroke: "transparent", strokeWidth: 0 });
      const dim = (id) => (activeStep === 9 ? 1 : (inFocus(id) ? 1 : 0.28));

      return (
        <svg viewBox="0 0 900 620" width="100%" height="100%">
          {atlasDefs()}

          <g style={{ cursor: cur, opacity: dim("system") * dim("whole") }} onClick={click("system")}>
            {atlasLungs({ cx: 450, cy: 90, scale: 1, highlight: inFocus("system") || inFocus("whole") })}
          </g>

          <g opacity={dim("system")}>
            <path d="M395,220 Q380,160 420,120" stroke={ATLAS_COLORS.lymphoid} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M505,220 Q520,160 480,120" stroke={ATLAS_COLORS.erythroid} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.55" />
            {atlasBloodCell({ cx: 408, cy: 170, r: 4, oxygenated: false, animate: true, delay: "0s" })}
            {atlasBloodCell({ cx: 492, cy: 170, r: 4, oxygenated: true,  animate: true, delay: "1s" })}
          </g>

          <g opacity={dim("system")}>
            <path d="M560,300 Q640,400 620,520" stroke={ATLAS_COLORS.erythroid} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M340,300 Q260,400 280,520" stroke={ATLAS_COLORS.lymphoid} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.55" />
            {atlasBloodCell({ cx: 610, cy: 440, r: 4, oxygenated: true,  animate: true, delay: "0.5s" })}
            {atlasBloodCell({ cx: 292, cy: 440, r: 4, oxygenated: false, animate: true, delay: "1.5s" })}
          </g>

          <g style={{ opacity: dim("system") * dim("bp"), cursor: cur }} onClick={click("bp")}>
            <rect x="250" y="530" width="400" height="60" rx="14" fill={ATLAS_COLORS.neutral} opacity="0.22" />
            <text x="450" y="566" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">Whole body · tissues</text>
          </g>

          <g style={{ cursor: cur, opacity: dim("heart") * dim("whole") }} onClick={click("heart")}>
            {atlasHeart({
              cx: 450, cy: 320, scale: 1,
              highlight: inFocus("heart") || inFocus("whole") || inFocus("cycle") || inFocus("conduction"),
              onDrill: onOpenDrill,
            })}
            <circle cx="450" cy="320" r="115" fill="none" {...ring("heart")} pointerEvents="none" />
          </g>

          {inFocus("conduction") && (
            <g opacity="0.9" pointerEvents="none">
              {atlasConductionPath({ cx: 450, cy: 320, scale: 1 })}
            </g>
          )}

          {inFocus("blood") && (
            <g pointerEvents="none">
              {atlasBloodCell({ cx: 400, cy: 280, r: 6, oxygenated: true,  label: "RBC" })}
              {atlasWhiteCell({ cx: 500, cy: 280, r: 6, label: "WBC" })}
              {atlasPlatelet({ cx: 450, cy: 380, r: 4, label: "Plt" })}
            </g>
          )}

          {inFocus("hemostasis") && (
            <g pointerEvents="none">
              <rect x="70" y="270" width="160" height="120" rx="10" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="150" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>VESSEL INJURY</text>
              <line x1="90" y1="330" x2="210" y2="330" stroke={ATLAS_COLORS.erythroid} strokeWidth="14" strokeLinecap="round" opacity="0.5" />
              <line x1="150" y1="324" x2="150" y2="345" stroke="#0A0F1A" strokeWidth="3" />
              {atlasPlatelet({ cx: 138, cy: 336, r: 4 })}
              {atlasPlatelet({ cx: 150, cy: 336, r: 4 })}
              {atlasPlatelet({ cx: 162, cy: 336, r: 4 })}
              {atlasFlowArrow({ x1: 150, y1: 356, x2: 150, y2: 372, color: ATLAS_COLORS.trunk })}
              <text x="150" y="384" textAnchor="middle" fontSize="10" fill="var(--text-2)">platelet plug + fibrin</text>
            </g>
          )}

          {inFocus("flow") && (
            <g pointerEvents="none">
              <rect x="670" y="270" width="180" height="120" rx="10" fill="var(--bg-2)" stroke={ATLAS_COLORS.trunk} strokeWidth="2" />
              <text x="760" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill={ATLAS_COLORS.trunk}>FLOW · PRESSURE</text>
              <path d="M690,330 L810,330" stroke={ATLAS_COLORS.erythroid} strokeWidth="12" strokeLinecap="round" opacity="0.5" />
              {atlasFlowArrow({ x1: 700, y1: 350, x2: 800, y2: 350, color: ATLAS_COLORS.erythroid })}
              <text x="700" y="372" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">high P</text>
              <text x="800" y="372" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">lower P</text>
            </g>
          )}

          {inFocus("bp") && (
            <g pointerEvents="none">
              {atlasFlowArrow({ x1: 450, y1: 435, x2: 450, y2: 528, color: ATLAS_COLORS.trunk, dashed: true })}
              <text x="450" y="490" textAnchor="middle" fontSize="10.5" fill={ATLAS_COLORS.trunk} fontWeight="700">nerves · hormones</text>
            </g>
          )}

          {inFocus("lymph") && (
            <g pointerEvents="none" opacity="0.95">
              <path d="M320,300 Q220,330 200,420 Q210,510 250,540" stroke={ATLAS_COLORS.lymphoid} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="10 6" />
              {atlasLymphNode({ cx: 240, cy: 380 })}
              {atlasLymphNode({ cx: 215, cy: 460 })}
              <text x="150" y="500" fontSize="10.5" fill={ATLAS_COLORS.lymphoid} fontWeight="700">lymph → blood</text>
            </g>
          )}

          <text x="450" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Lungs</text>
          <text x="450" y="614" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-2)" pointerEvents="none">Body</text>
          <text x="120" y="220" textAnchor="middle" fontSize="11" fill="var(--text-3)" pointerEvents="none">Blood</text>
          <text x="800" y="220" textAnchor="middle" fontSize="11" fill="var(--text-3)" pointerEvents="none">Hemostasis</text>
          <text x="805" y="470" textAnchor="middle" fontSize="11" fill="var(--text-3)" pointerEvents="none">Flow · BP</text>
          <text x="120" y="570" textAnchor="middle" fontSize="11" fill="var(--text-3)" pointerEvents="none">Lymphatics</text>
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
          {atlasDefs()}
          <path d="M560,60 Q600,40 630,100 L630,170 Q600,160 560,160 Z"
            fill="url(#atlas-grad-lymphoid)" opacity="0.5" {...ring("svc")} style={{ cursor: cur }} onClick={click("svc")} />
          <path d="M560,170 Q520,100 460,70 L460,140 Q520,160 560,230 Z"
            fill="url(#atlas-grad-lymphoid)" opacity={s.sl === "open" ? 0.85 : 0.4} {...ring("pa")} style={{ cursor: cur }} onClick={click("pa")} />
          <path d="M340,60 Q300,40 270,100 L270,170 Q300,160 340,160 Z"
            fill="url(#atlas-grad-erythroid)" opacity="0.5" {...ring("pveins")} style={{ cursor: cur }} onClick={click("pveins")} />
          <path d="M340,170 Q380,90 440,60 L440,130 Q390,160 340,230 Z"
            fill="url(#atlas-grad-erythroid)" opacity={s.sl === "open" ? 0.85 : 0.4} {...ring("aorta")} style={{ cursor: cur }} onClick={click("aorta")} />
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

};