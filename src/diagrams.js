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
     CARDIAC CYCLE — one heart, seven phases
     Topic: Physiology II (ph2), Topic 02 (index 1), "The Cardiovascular System"
     Not a tree: one fixed heart, and only valve state / chamber fill
     opacity change per activeStep, so Play reads as the heart actually
     beating rather than slides changing. Uses the same gradients/shadow
     filter as every other diagram (atlasDefs), blue = deoxygenated /
     right heart, crimson = oxygenated / left heart - same semantic use
     of ATLAS_COLORS.lymphoid / ATLAS_COLORS.erythroid as elsewhere.
     ========================================================= */
  "ph2:cardiac-cycle": {
    id: "ph2:cardiac-cycle",
    type: "diagram",
    title: "The Cardiac Cycle — One Heartbeat, Seven Phases",
    topic: { courseId: "ph2", topicIndex: 1 },
    parent: null,
    // Cyclic process - a heartbeat has no "end", so Play loops continuously
    // once started rather than stopping after step 7. Compare to a one-shot
    // process (e.g. Wound Healing, once built) which should NOT set this.
    loop: true,
    // Fixed right-panel summary - this should mirror what the actual
    // Cardiovascular System topic note says, not be written independently.
    // Placeholder below until the real note text is pasted in for a check.
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
    // Per-phase state. av/sl: valve open or closed. ra/la/rv/lv: chamber
    // fill opacity, so the heart visibly empties and refills as it beats.
    phaseState: [
      { av: "open",   sl: "closed", ra: 1,    la: 1,    rv: 0.55, lv: 0.55 }, // atrial systole
      { av: "closed", sl: "closed", ra: 0.3,  la: 0.3,  rv: 0.85, lv: 0.85 }, // isovolumic contraction - S1
      { av: "closed", sl: "open",   ra: 0.3,  la: 0.3,  rv: 0.55, lv: 0.55 }, // rapid ejection
      { av: "closed", sl: "open",   ra: 0.3,  la: 0.3,  rv: 0.4,  lv: 0.4  }, // reduced ejection
      { av: "closed", sl: "closed", ra: 0.4,  la: 0.4,  rv: 0.4,  lv: 0.4  }, // isovolumic relaxation - S2
      { av: "open",   sl: "closed", ra: 0.6,  la: 0.6,  rv: 0.75, lv: 0.75 }, // rapid filling
      { av: "open",   sl: "closed", ra: 0.75, la: 0.75, rv: 0.85, lv: 0.85 }, // diastasis
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

          {/* vena cavae -> RA */}
          <path d="M560,60 Q600,40 630,100 L630,170 Q600,160 560,160 Z"
            fill="url(#atlas-grad-lymphoid)" opacity="0.5" {...ring("svc")} style={{ cursor: cur }} onClick={click("svc")} />
          {/* pulmonary artery <- RV */}
          <path d="M560,170 Q520,100 460,70 L460,140 Q520,160 560,230 Z"
            fill="url(#atlas-grad-lymphoid)" opacity={s.sl === "open" ? 0.85 : 0.4} {...ring("pa")} style={{ cursor: cur }} onClick={click("pa")} />
          {/* pulmonary veins -> LA */}
          <path d="M340,60 Q300,40 270,100 L270,170 Q300,160 340,160 Z"
            fill="url(#atlas-grad-erythroid)" opacity="0.5" {...ring("pveins")} style={{ cursor: cur }} onClick={click("pveins")} />
          {/* aorta <- LV */}
          <path d="M340,170 Q380,90 440,60 L440,130 Q390,160 340,230 Z"
            fill="url(#atlas-grad-erythroid)" opacity={s.sl === "open" ? 0.85 : 0.4} {...ring("aorta")} style={{ cursor: cur }} onClick={click("aorta")} />

          {/* right atrium */}
          <ellipse cx="590" cy="190" rx="95" ry="70" fill="url(#atlas-grad-lymphoid)" opacity={s.ra}
            filter="url(#atlas-shadow)" {...ring("ra")} style={{ cursor: cur }} onClick={click("ra")} />
          {/* left atrium */}
          <ellipse cx="310" cy="190" rx="95" ry="70" fill="url(#atlas-grad-erythroid)" opacity={s.la}
            filter="url(#atlas-shadow)" {...ring("la")} style={{ cursor: cur }} onClick={click("la")} />

          {/* A-V valves, at the atrio-ventricular junction */}
          {atlasValve({ id: "av", x: 590, y: 275, open: s.av === "open", color: ATLAS_COLORS.lymphoid, onLabelClick, activeLabelId, preview })}
          {atlasValve({ id: "av", x: 310, y: 275, open: s.av === "open", flip: true, color: ATLAS_COLORS.erythroid, onLabelClick, activeLabelId, preview })}

          {/* right ventricle */}
          <path d="M470,290 Q470,420 560,480 Q650,460 680,370 Q690,300 630,280 Q550,260 470,290 Z"
            fill="url(#atlas-grad-lymphoid)" opacity={s.rv} filter="url(#atlas-shadow)" {...ring("rv")} style={{ cursor: cur }} onClick={click("rv")} />
          {/* left ventricle */}
          <path d="M430,290 Q430,440 330,510 Q230,470 210,370 Q200,290 270,275 Q360,255 430,290 Z"
            fill="url(#atlas-grad-erythroid)" opacity={s.lv} filter="url(#atlas-shadow)" {...ring("lv")} style={{ cursor: cur }} onClick={click("lv")} />

          {/* interventricular septum */}
          <line x1="450" y1="280" x2="450" y2="500" stroke={ATLAS_COLORS.neutral} strokeWidth="6" strokeLinecap="round" opacity="0.5" />

          {/* semilunar valves, at ventricular outflow */}
          {atlasValve({ id: "sl", x: 560, y: 210, open: s.sl === "open", color: ATLAS_COLORS.lymphoid, onLabelClick, activeLabelId, preview })}
          {atlasValve({ id: "sl", x: 360, y: 210, open: s.sl === "open", flip: true, color: ATLAS_COLORS.erythroid, onLabelClick, activeLabelId, preview })}

          {/* S1 / S2 heart sound markers */}
          {activeStep === 1 && <text x="450" y="300" textAnchor="middle" fontSize="22" fontWeight="700" fill={ATLAS_COLORS.trunk}>S1</text>}
          {activeStep === 4 && <text x="450" y="300" textAnchor="middle" fontSize="22" fontWeight="700" fill={ATLAS_COLORS.trunk}>S2</text>}

          {/* chamber labels */}
          <text x="590" y="194" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">RA</text>
          <text x="310" y="194" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">LA</text>
          <text x="560" y="400" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">RV</text>
          <text x="320" y="400" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.85" pointerEvents="none">LV</text>
        </svg>
      );
    },
  },

};
