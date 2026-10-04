// AtlasView.jsx
// ------------------------------------------------------------
// The Atlas tab - hand-drawn, illustrated diagrams, one per
// topic, driven entirely by diagrams.js.
//
// Nothing here is AI-generated and nothing fetches at runtime -
// every visual is a fixed SVG, drawn once in diagrams.js and
// displayed here. No new npm packages: zoom/pan is plain pointer
// events, narration is the browser's own speechSynthesis (same
// engine and the same "ascend_voice_gender" preference the
// existing Listen/podcast feature in App.js already uses).
// ------------------------------------------------------------
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  DIAGRAMS,
  ATLAS_COLORS,
  ATLAS_COURSE_NAMES,
  diagramsForCourse,
  coursesWithDiagrams,
  diagramForTopic,
  atlasDefs,
} from "./diagrams";

// Per-label mini-illustration for the legend.
const LEGEND_VIEWBOXES = {
  // Cardiovascular System
  system: "0 0 100 100",
  blood: "0 0 100 100",
  hemostasis: "0 0 100 100",
  heart: "0 0 100 100",
  conduction: "0 0 100 100",
  cycle: "0 0 100 100",
  flow: "0 0 100 100",
  bp: "0 0 100 100",
  lymph: "0 0 100 100",
  whole: "0 0 100 100",
  // Cardiac Cycle drill-down
  ra: "0 0 100 100",
  la: "0 0 100 100",
  rv: "0 0 100 100",
  lv: "0 0 100 100",
  av: "0 0 100 100",
  sl: "0 0 100 100",
  svc: "0 0 100 100",
  pa: "0 0 100 100",
  pveins: "0 0 100 100",
  aorta: "0 0 100 100",
  // Haematopoiesis
  hsc: "0 0 100 100",
  cmp: "0 0 100 100",
  clp: "0 0 100 100",
  b: "0 0 100 100",
  t: "0 0 100 100",
  nk: "0 0 100 100",
  "myeloid-leaf": "0 0 100 100",
  gmp: "0 0 100 100",
  mep: "0 0 100 100",
  gran: "0 0 100 100",
  mono: "0 0 100 100",
  mega: "0 0 100 100",
  liver: "0 0 100 100",
  spleen: "0 0 100 100",
  // Erythroid maturation
  s1: "0 0 100 100",
  s2: "0 0 100 100",
  s3: "0 0 100 100",
  s4: "0 0 100 100",
  s5: "0 0 100 100",
  s6: "0 0 100 100",
  epo: "0 0 100 100",
  // Lymphatic System
  capillary: "0 0 100 100",
  interstitial: "0 0 100 100",
  lymphcap: "0 0 100 100",
  vessel: "0 0 100 100",
  node: "0 0 100 100",
  lymphocyte: "0 0 100 100",
  duct: "0 0 100 100",
  // Respiratory Physiology
  airway: "0 0 100 100",
  lungs: "0 0 100 100",
  alveolus: "0 0 100 100",
  membrane: "0 0 100 100",
  o2: "0 0 100 100",
  co2: "0 0 100 100",
  control: "0 0 100 100",
  volumes: "0 0 100 100",
  pleura: "0 0 100 100",
  // Immune System
  barrier: "0 0 100 100",
  innate: "0 0 100 100",
  inflammation: "0 0 100 100",
  apc: "0 0 100 100",
  bcell: "0 0 100 100",
  antibody: "0 0 100 100",
  tcell: "0 0 100 100",
  memory: "0 0 100 100",
  lymphnode: "0 0 100 100",
  // Acute Inflammation
  trigger: "0 0 100 100",
  vasodilation: "0 0 100 100",
  permeability: "0 0 100 100",
  recruitment: "0 0 100 100",
  phagocytosis: "0 0 100 100",
  mediators: "0 0 100 100",
  signs: "0 0 100 100",
  resolution: "0 0 100 100",
  types: "0 0 100 100",
  // Wound Healing
  macrophages: "0 0 100 100",
  granulation: "0 0 100 100",
  angiogenesis: "0 0 100 100",
  fibroblasts: "0 0 100 100",
  epithelialisation: "0 0 100 100",
  contraction: "0 0 100 100",
  scar: "0 0 100 100",
  // Chronic Inflammation
  cells: "0 0 100 100",
  lymphocytes: "0 0 100 100",
  fibrosis: "0 0 100 100",
  "tissue-damage": "0 0 100 100",
  granuloma: "0 0 100 100",
  examples: "0 0 100 100",
  contrast: "0 0 100 100",
  // Acquired Immune Response
  mhc: "0 0 100 100",
  "helper-t": "0 0 100 100",
  "b-cell": "0 0 100 100",
  "plasma-cell": "0 0 100 100",
  "cytotoxic-t": "0 0 100 100",
  "lymph-node": "0 0 100 100",

  // ---- Haemodynamic Disorders ----
  normal: "0 0 100 100",
  thrombus: "0 0 100 100",
  virchow: "0 0 100 100",
  embolus: "0 0 100 100",
  infarction: "0 0 100 100",
  "infarct-types": "0 0 100 100",
  haemorrhage: "0 0 100 100",
  shock: "0 0 100 100",
  clinical: "0 0 100 100",
  // Cell Injury
  stressors: "0 0 100 100",
  adaptation: "0 0 100 100",
  reversible: "0 0 100 100",
  irreversible: "0 0 100 100",
  necrosis: "0 0 100 100",
  apoptosis: "0 0 100 100",
  "nec-vs-apop": "0 0 100 100",
  // Cell Cycle
  g1: "0 0 100 100",
  s: "0 0 100 100",
  g2: "0 0 100 100",
  m: "0 0 100 100",
  g0: "0 0 100 100",
  checkpoints: "0 0 100 100",
  cyclins: "0 0 100 100",
  cancer: "0 0 100 100",
  drugs: "0 0 100 100",
  // Neoplasia
  checkpoint: "0 0 100 100",
  oncogenes: "0 0 100 100",
  tsg: "0 0 100 100",
  proliferation: "0 0 100 100",
  invasion: "0 0 100 100",
  staging: "0 0 100 100",
};

const LEGEND_SWATCHES = {
  system: (active) => (
    <g>
      <circle cx="50" cy="42" r="18" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.5" />
      <path d="M18 78 Q50 60 82 78" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  blood: (active) => (
    <g>
      <ellipse cx="34" cy="50" rx="14" ry="9" fill="#E53935" stroke="#8C1C12" strokeWidth="1" />
      <circle cx="62" cy="44" r="9" fill="#F3F1FF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.2" />
      <circle cx="62" cy="44" r="5" fill={ATLAS_COLORS.nucleus} opacity="0.75" />
      <ellipse cx="70" cy="72" rx="8" ry="5" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.8" />
    </g>
  ),
  hemostasis: (active) => (
    <g>
      <line x1="12" y1="55" x2="88" y2="55" stroke="#C0392B" strokeWidth="12" strokeLinecap="round" />
      <line x1="50" y1="46" x2="50" y2="66" stroke="#0A0F1A" strokeWidth="3" />
      <ellipse cx="42" cy="57" rx="6" ry="4" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.8" />
      <ellipse cx="50" cy="58" rx="6" ry="4" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.8" />
      <ellipse cx="58" cy="57" rx="6" ry="4" fill={ATLAS_COLORS.trunk} stroke="#8B6410" strokeWidth="0.8" />
    </g>
  ),
  heart: (active) => (
    <g>
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Q78 62 50 84 Q22 62 20 30 Z" fill="#FBE9E7" stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="2" />
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Z" fill="#2D7BFF" opacity="0.9" />
      <path d="M20 30 Q22 52 50 84 Q78 62 80 30 Q70 44 50 44 Q30 44 20 30 Z" fill="#E53935" opacity="0.9" />
    </g>
  ),
  conduction: (active) => (
    <g>
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Q78 62 50 84 Q22 62 20 30 Z" fill="#FBE9E7" stroke="#C0392B" strokeWidth="1.5" />
      <circle cx="34" cy="30" r="5" fill={ATLAS_COLORS.trunk}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="44" r="4" fill={ATLAS_COLORS.trunk} />
      <path d="M50 48 L50 66 M50 66 Q42 72 36 78 M50 66 Q58 72 64 78" stroke={ATLAS_COLORS.trunk} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  cycle: (active) => (
    <g>
      <path d="M50 18 A32 32 0 0 1 82 50" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="4" strokeLinecap="round" />
      <path d="M82 50 A32 32 0 0 1 50 82" fill="none" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 82 A32 32 0 0 1 18 50" fill="none" stroke={ATLAS_COLORS.trunk} strokeWidth="4" strokeLinecap="round" />
      <path d="M18 50 A32 32 0 0 1 50 18" fill="none" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 40 L84 46 L76 52 Z" fill={ATLAS_COLORS.trunk} />
    </g>
  ),
  flow: (active) => (
    <g>
      <rect x="14" y="34" width="72" height="32" rx="16" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="2.5" />
      <path d="M22 50 L74 50" stroke="#E53935" strokeWidth="5" strokeLinecap="round" />
      <path d="M68 42 L80 50 L68 58 Z" fill="#E53935" />
    </g>
  ),
  bp: (active) => (
    <g>
      <circle cx="50" cy="24" r="10" fill="#8B5CF6" opacity="0.85" />
      <rect x="20" y="40" width="26" height="32" rx="6" fill="#2F6FED" opacity="0.85" />
      <rect x="54" y="40" width="26" height="32" rx="6" fill="#F5B93F" opacity="0.85" />
      <path d="M50 34 L50 40 M33 40 L33 34 M67 40 L67 34" stroke="var(--text-2)" strokeWidth="1.4" />
    </g>
  ),
  lymph: (active) => (
    <g>
      <path d="M14 60 Q30 40 50 50 Q70 60 86 40" fill="none" stroke="#2D7BFF" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" />
      <ellipse cx="36" cy="52" rx="10" ry="7" fill="#2F6FED" opacity="0.85" />
      <ellipse cx="64" cy="48" rx="10" ry="7" fill="#2F6FED" opacity="0.85" />
    </g>
  ),
    whole: (active) => (
    <g>
      {/* Hub-and-spokes system glyph — one large central node connected
         to three smaller ones, all outlined for dark-mode visibility. */}
      <circle cx="50" cy="28" r="14" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} stroke="#5B21B6" strokeWidth="1.8" />
      <circle cx="22" cy="72" r="11" fill="#2F6FED" stroke="#123F9E" strokeWidth="1.8" />
      <circle cx="78" cy="72" r="11" fill="#E53935" stroke="#8C1C12" strokeWidth="1.8" />
      <path d="M50 40 L22 62 M50 40 L78 62 M22 62 L78 62" stroke="var(--text-2)" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),

  // ---- Cardiac Cycle drill-down ----
  ra: (active) => (
    <g>
      <path d="M20 25 Q25 12 40 12 L50 12 L50 55 L20 55 Q18 40 20 25 Z"
        fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <text x="35" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">RA</text>
    </g>
  ),
  la: (active) => (
    <g>
      <path d="M80 25 Q75 12 60 12 L50 12 L50 55 L80 55 Q82 40 80 25 Z"
        fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="65" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">LA</text>
    </g>
  ),
  rv: (active) => (
    <g>
      <path d="M20 50 Q22 82 42 88 L50 88 L50 45 L20 45 Z"
        fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <text x="35" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">RV</text>
    </g>
  ),
  lv: (active) => (
    <g>
      <path d="M80 50 Q78 82 58 88 L50 88 L50 45 L80 45 Z"
        fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="65" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">LV</text>
    </g>
  ),
  av: (active) => (
    <g>
      <line x1="25" y1="45" x2="50" y2="55" stroke="#2F6FED" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="45" x2="50" y2="55" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" />
      <text x="50" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>A-V</text>
    </g>
  ),
  sl: (active) => (
    <g>
      <line x1="25" y1="60" x2="50" y2="45" stroke="#2F6FED" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="60" x2="50" y2="45" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" />
      <text x="50" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>S-L</text>
    </g>
  ),
  svc: (active) => (
    <g>
      <path d="M35 10 L35 85" stroke="#2D7BFF" strokeWidth="12" strokeLinecap="round" />
      <path d="M35 10 L35 85" stroke="#B8D0FF" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(-2,0)" />
      <text x="68" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>SVC</text>
    </g>
  ),
  pa: (active) => (
    <g>
      <path d="M65 10 L65 85" stroke="#2D7BFF" strokeWidth="12" strokeLinecap="round" />
      <path d="M65 10 L65 85" stroke="#B8D0FF" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(-2,0)" />
      <text x="32" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>PA</text>
    </g>
  ),
  pveins: (active) => (
    <g>
      <path d="M65 10 L65 85" stroke="#E53935" strokeWidth="12" strokeLinecap="round" />
      <path d="M65 10 L65 85" stroke="#F5C7C0" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(-2,0)" />
      <text x="32" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>PV</text>
    </g>
  ),
  aorta: (active) => (
    <g>
      <path d="M35 10 L35 85" stroke="#E53935" strokeWidth="12" strokeLinecap="round" />
      <path d="M35 10 L35 85" stroke="#F5C7C0" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(-2,0)" />
      <text x="68" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>Ao</text>
    </g>
  ),

  // ---- Haematopoiesis ----
  hsc: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#E9DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="20" fill="url(#atlas-grad-nucleus)" />
      <circle cx="42" cy="44" r="6" fill="#5B21B6" opacity="0.55" />
      <circle cx="56" cy="53" r="5" fill="#5B21B6" opacity="0.5" />
      <circle cx="49" cy="59" r="4" fill="#5B21B6" opacity="0.45" />
      <circle cx="53" cy="42" r="3" fill="#E9DFFF" opacity="0.9" />
    </g>
  ),
  cmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#F8F4EE" stroke={active ? "#FFC93C" : "#F5B93F"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="16" fill="url(#atlas-grad-trunk)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  clp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#F8F4EE" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="16" fill="url(#atlas-grad-lymphoid)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  b: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  t: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  nk: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  "myeloid-leaf": (active) => (
    <g>
      <ellipse cx="30" cy="38" rx="16" ry="10" fill="#E53935" stroke="#8C1C12" strokeWidth="1" />
      <ellipse cx="30" cy="38" rx="8" ry="5" fill="#F5C7C0" opacity="0.75" />
      <circle cx="66" cy="38" r="12" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1" />
      <path d="M60 34 Q66 31 70 36 Q72 40 68 43 Q62 45 60 40 Q58 37 60 34 Z" fill="#8B5CF6" opacity="0.78" />
      <ellipse cx="50" cy="68" rx="8" ry="5.5" fill="#F5B93F" stroke="#8B6410" strokeWidth="0.8" />
    </g>
  ),
  gmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#F8F4EE" stroke={active ? "#FFC93C" : "#F5B93F"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="15" fill="url(#atlas-grad-trunk)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  mep: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#F8F4EE" stroke={active ? "#E53935" : "#C0392B"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="15" fill="url(#atlas-grad-erythroid)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  gran: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
      <circle cx="49" cy="50" r="3" fill="#F3F1FF" opacity="0.6" />
    </g>
  ),
  mono: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F8F4EE" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.6" />
      <path d="M40 46 Q48 40 58 46 Q62 52 56 58 Q48 62 42 56 Q38 50 40 46 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  mega: (active) => (
    <g>
      <circle cx="46" cy="50" r="24" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
      {[[40, 42], [52, 44], [44, 58], [54, 56]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#5B21B6" opacity="0.75" />
      ))}
      <ellipse cx="74" cy="42" rx="5" ry="3.5" fill="#F5B93F" stroke="#8B6410" strokeWidth="0.6" />
      <ellipse cx="78" cy="52" rx="5" ry="3.5" fill="#F5B93F" stroke="#8B6410" strokeWidth="0.6" />
    </g>
  ),
  liver: (active) => (
    <g>
      <path d="M18 38 Q22 20 42 22 Q62 18 78 32 Q86 44 76 56 Q64 68 42 64 Q22 62 18 48 Z" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
    </g>
  ),
  spleen: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="26" ry="20" fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" transform="rotate(-20 50 50)" />
    </g>
  ),

  // ---- Erythroid maturation ----
  s1: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#9AB4E8" stroke="#123F9E" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="18" fill="url(#atlas-grad-nucleus)" />
      <circle cx="45" cy="45" r="4" fill="#5B21B6" opacity="0.35" />
      <circle cx="55" cy="55" r="3.5" fill="#5B21B6" opacity="0.3" />
    </g>
  ),
  s2: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#B8C4DC" stroke="#123F9E" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="16" fill="url(#atlas-grad-nucleus)" />
      <circle cx="44" cy="44" r="4.5" fill="#5B21B6" opacity="0.4" />
      <circle cx="56" cy="54" r="4" fill="#5B21B6" opacity="0.35" />
    </g>
  ),
  s3: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#D8B4B8" stroke="#8C1C12" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="14" fill="url(#atlas-grad-nucleus)" />
      <circle cx="43" cy="44" r="5" fill="#5B21B6" opacity="0.6" />
      <circle cx="56" cy="54" r="4.5" fill="#5B21B6" opacity="0.55" />
    </g>
  ),
  s4: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#F0A8A0" stroke="#8C1C12" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="10" fill="url(#atlas-grad-nucleus)" opacity="0.9" />
      <circle cx="46" cy="47" r="3.5" fill="#5B21B6" opacity="0.7" />
      <circle cx="54" cy="53" r="3" fill="#5B21B6" opacity="0.65" />
    </g>
  ),
  s5: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="#F0B0A8" stroke="#8C1C12" strokeWidth="1.5" />
      <path d="M32 48 Q50 40 68 48" stroke="#5B21B6" strokeWidth="1.6" fill="none" opacity="0.65" strokeLinecap="round" />
      <path d="M34 58 Q50 52 66 58" stroke="#5B21B6" strokeWidth="1.4" fill="none" opacity="0.5" strokeLinecap="round" />
    </g>
  ),
  s6: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="30" ry="20" fill="#E53935" stroke="#8C1C12" strokeWidth="1.5" />
      <ellipse cx="50" cy="50" rx="15" ry="10" fill="#F5C7C0" opacity="0.75" />
    </g>
  ),
  epo: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1B1405">EPO</text>
    </g>
  ),

  // ---- Lymphatic System ----
  capillary: (active) => (
    <g>
      <path d="M14 50 Q50 38 86 50" fill="none" stroke={active ? "#E53935" : "#C0392B"} strokeWidth="10" strokeLinecap="round" />
      <circle cx="50" cy="66" r="3" fill="#FFE38A" />
      <circle cx="62" cy="70" r="3" fill="#FFE38A" />
    </g>
  ),
  interstitial: (active) => (
    <g>
      <circle cx="30" cy="40" r="6" fill="#FFE38A" opacity={active ? 1 : 0.85} />
      <circle cx="54" cy="56" r="6" fill="#FFE38A" opacity={active ? 1 : 0.85} />
      <circle cx="74" cy="34" r="6" fill="#FFE38A" opacity={active ? 1 : 0.85} />
      <circle cx="40" cy="70" r="6" fill="#FFE38A" opacity={active ? 1 : 0.85} />
      <circle cx="68" cy="68" r="6" fill="#FFE38A" opacity={active ? 1 : 0.85} />
    </g>
  ),
  lymphcap: (active) => (
    <g>
      <path d="M50 12 Q40 45 50 88" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="9" strokeLinecap="round" strokeDasharray="6 5" />
      <circle cx="50" cy="14" r="7" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="2" />
    </g>
  ),
  vessel: (active) => (
    <g>
      <path d="M50 10 Q34 50 50 90" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="9" strokeLinecap="round" strokeDasharray="6 5" />
      <line x1="38" y1="42" x2="50" y2="50" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="62" y1="42" x2="50" y2="50" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  node: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="30" ry="20" fill={active ? "#2D7BFF" : ATLAS_COLORS.lymphoid} opacity="0.75" />
      <ellipse cx="50" cy="50" rx="18" ry="11" fill="#0A0F1A" opacity="0.22" />
    </g>
  ),
  lymphocyte: (active) => (
    <g>
      <circle cx="34" cy="50" r="16" fill="#F3F1FF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.6" />
      <circle cx="34" cy="50" r="8" fill={ATLAS_COLORS.nucleus} opacity="0.75" />
      <circle cx="68" cy="50" r="16" fill="#F3F1FF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.6" />
      <circle cx="68" cy="50" r="8" fill={ATLAS_COLORS.nucleus} opacity="0.75" />
    </g>
  ),
  duct: (active) => (
    <g>
      <path d="M30 14 Q46 50 50 86" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="7" strokeLinecap="round" strokeDasharray="5 4" />
      <path d="M70 14 Q54 50 50 86" fill="none" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="7" strokeLinecap="round" strokeDasharray="5 4" />
      <rect x="30" y="80" width="40" height="14" rx="6" fill={ATLAS_COLORS.lymphoid} opacity="0.5" />
    </g>
  ),

  // ---- Respiratory Physiology ----
  airway: (active) => (
    <g>
      <rect x="42" y="10" width="16" height="40" rx="6" fill="#E8E2FF" stroke="#8B7CC7" strokeWidth="1.4" />
      {[16, 24, 32, 40].map((y, i) => (
        <line key={i} x1="42" y1={y} x2="58" y2={y} stroke="#8B7CC7" strokeWidth="0.7" opacity="0.7" />
      ))}
      <path d="M50,50 Q32,62 26,80" fill="none" stroke="#8B7CC7" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M50,50 Q68,62 74,80" fill="none" stroke="#8B7CC7" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  lungs: (active) => (
    <g>
      <path d="M46,20 Q34,22 28,40 Q22,60 30,82 Q38,92 46,86 Q50,70 50,50 Q50,32 46,20 Z" fill="#F5A8A0" stroke={active ? "#F5B93F" : "#B63B2E"} strokeWidth={active ? 2 : 1.3} />
      <path d="M54,20 Q66,22 72,40 Q78,60 70,82 Q62,92 54,86 Q50,70 50,50 Q50,32 54,20 Z" fill="#F5A8A0" stroke={active ? "#F5B93F" : "#B63B2E"} strokeWidth={active ? 2 : 1.3} />
      <path d="M46,34 Q50,40 54,34" fill="none" stroke="#B63B2E" strokeWidth="0.7" opacity="0.7" />
      <path d="M46,60 Q50,66 54,60" fill="none" stroke="#B63B2E" strokeWidth="0.7" opacity="0.7" />
    </g>
  ),
  alveolus: (active) => (
    <g>
      <circle cx="34" cy="48" r="16" fill="#F2EEFF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
      <circle cx="66" cy="46" r="16" fill="#F2EEFF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
      <circle cx="50" cy="28" r="16" fill="#F2EEFF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
      <path d="M12,72 Q32,76 50,72 Q68,68 88,72" fill="none" stroke="#E53935" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <path d="M12,72 Q32,76 50,72 Q68,68 88,72" fill="none" stroke="#8C1C12" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
    membrane: (active) => (
    <g>
      {/* A zoomed cross-section of the respiratory membrane: blue air
         side on top, a bold purple membrane in the middle (the actual
         barrier), red blood side below. Two-way arrows show O₂
         entering and CO₂ leaving — the whole point of the structure. */}
      <rect x="14" y="16" width="72" height="20" rx="4" fill="#DBE7FF" stroke="#2F6FED" strokeWidth="1.4" />
      <text x="50" y="30" textAnchor="middle" fontSize="8" fontWeight="800" fill="#123F9E">AIR</text>
      <rect x="14" y="38" width="72" height="6" rx="2" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} stroke="#5B21B6" strokeWidth="0.8" />
      <text x="50" y="58" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={active ? "#D89B14" : "#8B5CF6"}>membrane</text>
      <rect x="14" y="62" width="72" height="20" rx="4" fill="#FBDCDC" stroke="#C0392B" strokeWidth="1.4" />
      <text x="50" y="76" textAnchor="middle" fontSize="8" fontWeight="800" fill="#8C1C12">BLOOD</text>
      <path d="M30,20 L30,62" stroke="#2F6FED" strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
      <polygon points="30,62 27,58 33,58" fill="#2F6FED" />
      <path d="M70,60 L70,18" stroke="#C0392B" strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
      <polygon points="70,18 67,22 73,22" fill="#C0392B" />
    </g>
  ),
  o2: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="30" ry="18" fill="#E53935" stroke="#8C1C12" strokeWidth="1.4" />
      <ellipse cx="50" cy="50" rx="14" ry="8" fill="#F5C7C0" opacity="0.75" />
      <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8C1C12">O₂</text>
    </g>
  ),
  co2: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="30" ry="18" fill="#2D7BFF" stroke="#123F9E" strokeWidth="1.4" />
      <ellipse cx="50" cy="50" rx="14" ry="8" fill="#B8D0FF" opacity="0.75" />
      <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">CO₂</text>
    </g>
  ),
  control: (active) => (
    <g>
      {/* Brain (top) with two arrows fanning down to sensors — showing
         the two-way loop between the brainstem and the chemoreceptors
         that tell it what the blood actually needs. */}
      <ellipse cx="50" cy="26" rx="22" ry="14" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} stroke="#5B21B6" strokeWidth="1.6" />
      <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#0A0F1A" : "#fff"}>brain</text>
      <path d="M38,40 Q30,58 34,70" stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M62,40 Q70,58 66,70" stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="74" r="6" fill="#2F6FED" stroke="#123F9E" strokeWidth="1.4" />
      <circle cx="66" cy="74" r="6" fill="#C0392B" stroke="#8C1C12" strokeWidth="1.4" />
      <text x="34" y="90" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#2F6FED">O₂</text>
      <text x="66" y="90" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#C0392B">CO₂</text>
    </g>
  ),
  volumes: (active) => (
    <g>
      {/* Four lung-volume bars, each labelled with its abbreviation
         inside the bar, in a distinct colour. Bar widths match the
         relative magnitude of each volume so the shape alone conveys
         "which is biggest". A bold header identifies the concept. */}
      <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} letterSpacing="0.04em">VOLUMES</text>
      {[
        { y: 24, w: 20, c: "#2F6FED", label: "TV"  },
        { y: 40, w: 42, c: "#2D7BFF", label: "IRV" },
        { y: 56, w: 30, c: "#C0392B", label: "ERV" },
        { y: 72, w: 48, c: "#8C1C12", label: "RV"  },
      ].map((v, i) => (
        <g key={i}>
          <rect x="14" y={v.y} width={v.w} height="11" rx="4" fill={v.c} />
          <text x={14 + v.w + 6} y={v.y + 8.5} fontSize="8" fontWeight="700" fill="var(--text)">{v.label}</text>
        </g>
      ))}
    </g>
  ),
  pleura: (active) => (
    <g>
      <path d="M20,32 Q50,26 80,32" fill="none" stroke="#B63B2E" strokeWidth="2.5" />
      <path d="M20,40 Q50,34 80,40" fill="none" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth="2.5" />
      <path d="M20,58 Q50,52 80,58" fill="none" stroke="#B63B2E" strokeWidth="2.5" />
      <path d="M20,66 Q50,60 80,66" fill="none" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth="2.5" />
      <text x="50" y="90" textAnchor="middle" fontSize="8" fill="var(--text-2)">fluid between</text>
    </g>
  ),

  // ---- Immune System ----
  barrier: (active) => (
    <g>
      <path d="M12,44 Q30,38 50,44 Q70,50 88,44" fill="none" stroke="#B63B2E" strokeWidth="4" strokeLinecap="round" />
      <path d="M12,52 Q30,46 50,52 Q70,58 88,52" fill="none" stroke="#D89B14" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <text x="50" y="76" textAnchor="middle" fontSize="8" fill="var(--text-2)">skin · mucosa</text>
    </g>
  ),
  innate: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  inflammation: (active) => (
    <g>
      <path d="M12,54 Q50,44 88,54" fill="none" stroke="#E53935" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      {[30, 50, 70].map((x, i) => (
        <circle key={i} cx={x} cy={34 + (i % 2) * 6} r="5" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1" />
      ))}
      <text x="50" y="82" textAnchor="middle" fontSize="7.5" fill="var(--text-2)">red · warm · swollen</text>
    </g>
  ),
  apc: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M42 44 Q50 40 56 46 Q62 44 62 52 Q60 60 50 60 Q42 62 42 54 Q38 48 42 44 Z" fill="#8B5CF6" opacity="0.78" />
      <polygon points="42,30 48,30 45,24" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
      <polygon points="56,32 62,32 59,26" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),
  bcell: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M42 44 Q50 40 56 46 Q62 44 62 52 Q60 60 50 60 Q42 62 42 54 Q38 48 42 44 Z" fill="#8B5CF6" opacity="0.78" />
      <text x="50" y="86" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">B</text>
    </g>
  ),
  antibody: (active) => (
    <g>
      <path d="M50,66 L50,46 M50,46 L30,26 M50,46 L70,26" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="26" r="2.5" fill={active ? "#F5B93F" : "#5B21B6"} />
      <circle cx="70" cy="26" r="2.5" fill={active ? "#F5B93F" : "#5B21B6"} />
      <polygon points="25,20 33,20 29,13" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
      <polygon points="67,20 75,20 71,13" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),
  tcell: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M42 44 Q50 40 56 46 Q62 44 62 52 Q60 60 50 60 Q42 62 42 54 Q38 48 42 44 Z" fill="#8B5CF6" opacity="0.78" />
      <text x="50" y="86" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">T</text>
    </g>
  ),
  memory: (active) => (
    <g>
      <rect x="14" y="26" width="72" height="48" rx="10" fill="var(--bg-3)" stroke={active ? "#F5B93F" : ATLAS_COLORS.trunk} strokeWidth="1.6" strokeDasharray="5 4" />
      <circle cx="36" cy="50" r="9" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1" />
      <circle cx="64" cy="50" r="9" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1" />
    </g>
  ),
  lymphnode: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="30" ry="20" fill={active ? "#2D7BFF" : ATLAS_COLORS.lymphoid} opacity="0.75" />
      <ellipse cx="50" cy="50" rx="17" ry="11" fill="#0A0F1A" opacity="0.22" />
      {[[-14, -4], [-10, 4], [0, -8], [0, 8], [10, -4], [12, 6]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx} cy={50 + dy} r="1.6" fill="#0A1F6B" opacity="0.55" />
      ))}
    </g>
  ),

  // ---- Acute Inflammation ----
  trigger: (active) => (
    <g>
      <path d="M50,26 l6,-9 l5,9 l9,2 l-6,7 l2,9 l-9,-3 l-8,6 l0,-9 l-8,-6 l9,-4 z" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.2" />
    </g>
  ),
  vasodilation: (active) => (
    <g>
      <path d="M14,50 Q50,44 86,50" fill="none" stroke="#E53935" strokeWidth="18" strokeLinecap="round" />
      <path d="M14,50 Q50,44 86,50" fill="none" stroke="#F5C7C0" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M30,26 L30,38 M30,26 l-3,4 M30,26 l3,4" stroke="#C0392B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M70,74 L70,62 M70,74 l-3,-4 M70,74 l3,-4" stroke="#C0392B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  permeability: (active) => (
    <g>
      <path d="M14,40 Q50,34 86,40" fill="none" stroke="#E53935" strokeWidth="12" strokeLinecap="round" />
      {[[40, 60], [50, 70], [60, 60], [45, 80]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#FFE38A" stroke="#D89B14" strokeWidth="0.5" />
      ))}
    </g>
  ),
  recruitment: (active) => (
    <g>
      <path d="M14,42 Q50,36 86,42" fill="none" stroke="#E53935" strokeWidth="12" strokeLinecap="round" />
      <circle cx="30" cy="38" r="6" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
      <circle cx="50" cy="58" r="6" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
      <path d="M50,44 L50,58" stroke="#5B21B6" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />
    </g>
  ),
  phagocytosis: (active) => (
    <g>
      <circle cx="42" cy="50" r="18" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.4" />
      <path d="M34,46 Q40,42 46,48 Q50,54 44,56 Q36,54 34,46 Z" fill="#8B5CF6" opacity="0.78" />
      <path d="M64,50 Q70,42 76,50 Q70,58 64,50 Z" fill="none" stroke="#8B5CF6" strokeWidth="1.6" />
      <ellipse cx="72" cy="50" rx="4" ry="2.5" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),
  mediators: (active) => (
    <g>
      {/* Warm amber-tinted panel with a bold header and four clear
         mediator names at readable size. Distinct from the `signs`
         panel below by colour and by the header wording. */}
      <rect x="10" y="12" width="80" height="76" rx="12" fill={active ? "rgba(245,185,63,.18)" : "rgba(245,185,63,.08)"} stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="2" />
      <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#B8860B"} letterSpacing="0.05em">MEDIATORS</text>
      {["histamine", "prostaglandins", "cytokines", "complement"].map((m, i) => (
        <text key={i} x="50" y={46 + i * 10} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="var(--text)">{m}</text>
      ))}
    </g>
  ),
  signs: (active) => (
    <g>
      {/* Crimson-tinted panel with a bold header and four clear signs.
         Distinct colour from `mediators` above so the two panels don't
         read as identical grey boxes. */}
      <rect x="10" y="12" width="80" height="76" rx="12" fill={active ? "rgba(192,57,43,.18)" : "rgba(192,57,43,.08)"} stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="2" />
      <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#C0392B"} letterSpacing="0.05em">SIGNS</text>
      {["redness", "heat", "swelling", "pain"].map((s, i) => (
        <text key={i} x="50" y={46 + i * 10} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="var(--text)">{s}</text>
      ))}
    </g>
  ),
     resolution: (active) => (
    <g>
      {/* Healing tissue patch — pale mint fill, solid green ring,
         bold green tick. Reads as "healed and confirmed" even at
         tile size, in both light and dark themes. */}
      <circle cx="50" cy="50" r="30" fill="#E8F8EF" stroke={active ? ATLAS_COLORS.trunk : "#16A34A"} strokeWidth="3" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#16A34A" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.7" />
      <path d="M36,50 L46,60 L64,40" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
    types: (active) => (
    <g>
      {/* Acute vs chronic comparison — two clearly-coloured panels
         side by side with headers readable at tile size. Crimson for
         acute (fast, hot), purple for chronic (slow, smouldering). */}
      <rect x="6" y="16" width="42" height="68" rx="8" fill={active ? "rgba(192,57,43,.22)" : "rgba(192,57,43,.1)"} stroke="#C0392B" strokeWidth="1.8" />
      <text x="27" y="32" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#C0392B">ACUTE</text>
      <text x="27" y="48" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">hours</text>
      <text x="27" y="60" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">to days</text>
      <text x="27" y="76" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">neutrophils</text>
      <rect x="52" y="16" width="42" height="68" rx="8" fill={active ? "rgba(139,92,246,.22)" : "rgba(139,92,246,.1)"} stroke="#8B5CF6" strokeWidth="1.8" />
      <text x="73" y="32" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#8B5CF6">CHRONIC</text>
      <text x="73" y="48" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">weeks</text>
      <text x="73" y="60" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">to months</text>
      <text x="73" y="76" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">macrophages</text>
    </g>
  ),

  // ---- Wound Healing ----
  // Swatches for the wound-healing diagram. Each mirrors the structure
  // or concept its tile describes — a phagocytosing macrophage, pink
  // granulation tissue with new capillaries, capillary budding, a
  // fibroblast laying down collagen, skin cells closing the surface,
  // wound-edge arrows pulling inward, and a pale mature scar.
  macrophages: (active) => (
    <g>
      {/* Macrophage body with a lobed nucleus and a bacterium inside,
         showing the phagocytosing role that gives this phase its name. */}
      <circle cx="46" cy="50" r="22" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
      <path
        d="M38 44 Q46 40 52 46 Q58 44 58 52 Q56 60 48 60 Q40 62 38 54 Q34 48 38 44 Z"
        fill="#8B5CF6" opacity="0.78"
      />
      {/* Engulfed bacterium inside the macrophage */}
      <ellipse cx="46" cy="58" rx="5" ry="3" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
      {/* A second bacterium being engulfed at the edge */}
      <path d="M70,50 Q76,42 82,50 Q76,58 70,50 Z" fill="none" stroke="#8B5CF6" strokeWidth="1.6" />
      <ellipse cx="78" cy="50" rx="4" ry="2.5" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),
  granulation: (active) => (
    <g>
      {/* Pink granulation tissue patch with three new capillary loops
         budding into it — the "new pink tissue" that fills a healing
         wound from the edges. */}
      <ellipse cx="50" cy="50" rx="36" ry="26" fill={active ? "#F5A8A0" : "#F8B8B0"} stroke="#B63B2E" strokeWidth="1.6" opacity="0.85" />
      {[
        [36, 44], [50, 56], [64, 44]
      ].map(([px, py], i) => (
        <path
          key={i}
          d={`M${px - 7},${py + 5} Q${px},${py - 7} ${px + 7},${py + 5}`}
          fill="none" stroke="#E53935" strokeWidth="1.8" strokeLinecap="round"
        />
      ))}
    </g>
  ),
  angiogenesis: (active) => (
    <g>
      {/* A parent vessel with two new capillary branches budding off
         it — the "new blood supply" that keeps granulation tissue alive. */}
      <path d="M14,50 L86,50" stroke="#E53935" strokeWidth="6" strokeLinecap="round" />
      <path d="M14,50 L86,50" stroke="#F5C7C0" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <path d="M42,50 Q38,32 28,22" stroke="#E53935" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M42,50 Q38,32 28,22" stroke="#F5C7C0" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M58,50 Q62,32 72,22" stroke="#E53935" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M58,50 Q62,32 72,22" stroke="#F5C7C0" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.85" />
    </g>
  ),
  fibroblasts: (active) => (
    <g>
      {/* A spindle-shaped fibroblast with collagen threads laid down
         beneath it — the structural protein that gives the wound its
         strength. */}
      <ellipse cx="50" cy="38" rx="20" ry="9" fill={active ? "#C7B8E8" : "#D8C7F0"} stroke="#5B21B6" strokeWidth="1.6" transform="rotate(-15 50 38)" />
      <circle cx="50" cy="38" r="5" fill="#8B5CF6" opacity="0.85" />
      {/* Collagen threads below, laid down in a wavy pattern */}
      {[56, 66, 76].map((y, i) => (
        <path
          key={i}
          d={`M14,${y} Q32,${y - 4} 50,${y} Q68,${y + 4} 86,${y}`}
          fill="none" stroke="#B8A89E" strokeWidth="1.8" strokeLinecap="round"
        />
      ))}
    </g>
  ),
  epithelialisation: (active) => (
    <g>
      {/* A wound surface with two layers of skin cells sliding in from
         the edges, shown as rows of small keratinocyte-like cells
         meeting in the middle. */}
      <path d="M14,50 L86,50" stroke="#D89B14" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.7" />
      {[[24, 42], [34, 42], [44, 42]].map(([px, py], i) => (
        <circle key={`l${i}`} cx={px} cy={py} r="6" fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.2" />
      ))}
      {[[56, 42], [66, 42], [76, 42]].map(([px, py], i) => (
        <circle key={`r${i}`} cx={px} cy={py} r="6" fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.2" />
      ))}
      {/* Arrow showing the migration meeting in the middle */}
      <path d="M40,60 L60,60" stroke="#D89B14" strokeWidth="2" strokeLinecap="round" />
      <polygon points="60,60 53,56 53,64" fill="#D89B14" />
      <polygon points="40,60 47,56 47,64" fill="#D89B14" />
    </g>
  ),
  contraction: (active) => (
    <g>
      {/* A wound bed with arrows pulling inward from both edges —
         myofibroblasts shrinking the surface area that has to be
         covered. */}
      <rect x="30" y="30" width="40" height="40" rx="6" fill="#FBE9E7" stroke="#B63B2E" strokeWidth="1.6" strokeDasharray="4 3" />
      <path d="M6,50 L24,50" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="3.2" strokeLinecap="round" />
      <polygon points="24,50 17,46 17,54" fill={active ? "#F5B93F" : "#C0392B"} />
      <path d="M94,50 L76,50" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="3.2" strokeLinecap="round" />
      <polygon points="76,50 83,46 83,54" fill={active ? "#F5B93F" : "#C0392B"} />
    </g>
  ),
  scar: (active) => (
    <g>
      {/* A pale, elongated scar with fine collagen lines running mostly
         parallel to its surface — the mature endpoint of the healing
         process. */}
      <ellipse cx="50" cy="50" rx="34" ry="16" fill="#F5E8E0" stroke={active ? "#F5B93F" : "#B8A89E"} strokeWidth="1.8" />
      {[44, 50, 56].map((y, i) => (
        <path
          key={i}
          d={`M22,${y} Q50,${y - 2} 78,${y}`}
          fill="none" stroke="#B8A89E" strokeWidth="1.2" strokeLinecap="round" opacity="0.85"
        />
      ))}
    </g>
  ),

  // ---- Chronic Inflammation ----
  // Swatches for the chronic inflammation diagram. Each mirrors the
  // structure or concept its tile describes — the cell change from
  // neutrophils to macrophages, a cluster of lymphocytes, fibrotic
  // scar tissue, ongoing tissue destruction, a walled-off granuloma,
  // a stack of disease examples, and an acute-vs-chronic comparison.
  cells: (active) => (
    <g>
      {/* Two cells side by side: a neutrophil (left, lobed) and a
         macrophage (right, larger, kidney nucleus). Shows the "cell
         change" the tile names. */}
      <circle cx="30" cy="50" r="16" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.4" />
      <path d="M22 44 Q28 40 34 44 Q38 48 34 54 Q28 58 22 54 Q18 48 22 44 Z" fill="#8B5CF6" opacity="0.78" />
      <circle cx="70" cy="50" r="20" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
      <path d="M62 46 Q68 42 74 46 Q78 52 72 56 Q64 58 62 52 Q60 48 62 46 Z" fill="#8B5CF6" opacity="0.78" />
      <text x="50" y="86" textAnchor="middle" fontSize="8" fill="var(--text-2)">acute → chronic</text>
    </g>
  ),
  lymphocytes: (active) => (
    <g>
      {/* Three lymphocytes clustered — small round cells with large
         dark nuclei, the adaptive immune cells that accumulate in
         chronic inflammation. */}
      <circle cx="36" cy="42" r="14" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="36" cy="42" r="9" fill="#5B21B6" opacity="0.85" />
      <circle cx="66" cy="44" r="14" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="66" cy="44" r="9" fill="#5B21B6" opacity="0.85" />
      <circle cx="50" cy="70" r="14" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="50" cy="70" r="9" fill="#5B21B6" opacity="0.85" />
    </g>
  ),
  fibrosis: (active) => (
    <g>
      {/* A tissue patch with dense parallel collagen strands running
         through it — the scarring that replaces working tissue in
         chronic inflammation. */}
      <ellipse cx="50" cy="50" rx="34" ry="26" fill="#F5E8E0" stroke={active ? "#F5B93F" : "#B8A89E"} strokeWidth="1.6" />
      {[34, 44, 54, 64].map((y, i) => (
        <path
          key={i}
          d={`M20,${y} Q50,${y - 3} 80,${y}`}
          fill="none" stroke="#B8A89E" strokeWidth="1.6" strokeLinecap="round" opacity="0.9"
        />
      ))}
    </g>
  ),
  "tissue-damage": (active) => (
    <g>
      {/* A tissue patch with a jagged red break through the middle —
         the immune response's own enzymes destroying normal tissue. */}
      <ellipse cx="50" cy="50" rx="34" ry="26" fill="#FBE9E7" stroke="#B63B2E" strokeWidth="1.6" opacity="0.7" />
      <path
        d="M24,34 L38,42 L30,52 L44,58 L36,68 M76,34 L62,42 L70,52 L56,58 L64,68"
        fill="none" stroke="#C0392B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M44,58 L56,58" stroke="#8C1C12" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  granuloma: (active) => (
    <g>
      {/* A ring of macrophages (small pale cells with purple nuclei)
         surrounding a central trapped trigger — the walled-off lesion
         that contains but does not cure a persistent threat. */}
      <circle cx="50" cy="50" r="30" fill="none" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="2.4" strokeDasharray="6 4" opacity="0.85" />
      {[
        [50, 22], [78, 50], [50, 78], [22, 50]
      ].map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r="8" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="1.2" />
          <path d={`M${px - 3},${py - 2} Q${px},${py - 4} ${px + 3},${py - 2} Q${px + 4},${py + 2} ${px + 1},${py + 3} Q${px - 3},${py + 3} ${px - 3},${py - 2} Z`} fill="#8B5CF6" opacity="0.78" />
        </g>
      ))}
      <circle cx="50" cy="50" r="7" fill="#C0392B" stroke="#8C1C12" strokeWidth="1" />
    </g>
  ),
  examples: (active) => (
    <g>
      {/* A stack of small cards — one per common chronic-inflammatory
         condition. Suggests "a list of examples" without needing to
         spell them out at tile size. */}
      <rect x="14" y="22" width="72" height="14" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <rect x="14" y="42" width="72" height="14" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <rect x="14" y="62" width="72" height="14" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <text x="50" y="32" textAnchor="middle" fontSize="6" fill="var(--text-2)">arthritis</text>
      <text x="50" y="52" textAnchor="middle" fontSize="6" fill="var(--text-2)">atherosclerosis</text>
      <text x="50" y="72" textAnchor="middle" fontSize="6" fill="var(--text-2)">tuberculosis</text>
    </g>
  ),
  contrast: (active) => (
    <g>
      {/* Acute (crimson) vs chronic (purple) — a simple two-column
         comparison, matching the `types` swatch's layout but tuned for
         the acute/chronic distinction rather than acute/chronic types
         of inflammation. */}
      <rect x="6" y="22" width="40" height="58" rx="8" fill={active ? "rgba(192,57,43,.22)" : "rgba(192,57,43,.1)"} stroke="#C0392B" strokeWidth="1.6" />
      <text x="26" y="38" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#C0392B">ACUTE</text>
      <text x="26" y="54" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">days</text>
      <text x="26" y="68" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">neutrophils</text>
      <rect x="54" y="22" width="40" height="58" rx="8" fill={active ? "rgba(139,92,246,.22)" : "rgba(139,92,246,.1)"} stroke="#8B5CF6" strokeWidth="1.6" />
      <text x="74" y="38" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#8B5CF6">CHRONIC</text>
      <text x="74" y="54" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">months</text>
      <text x="74" y="68" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">macrophages</text>
    </g>
  ),

  // ---- Acquired Immune Response ----
  // Swatches for the adaptive-immune-response diagram. Each mirrors
  // the structure or concept its tile describes — the MHC display
  // molecule, a helper T cell, a B cell, a plasma cell, a cytotoxic
  // T cell, and a lymph node.
  mhc: (active) => (
    <g>
      {/* Y-shaped MHC molecule on a cell surface, holding an antigen
         fragment in its binding groove. */}
      <path
        d="M50,70 L50,50 M50,50 L36,34 M50,50 L64,34"
        stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="5"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <polygon points="30,28 42,28 36,16" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.8" />
      <polygon points="58,28 70,28 64,16" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.8" />
      <path d="M20,76 L80,76" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" />
    </g>
  ),
  "helper-t": (active) => (
    <g>
      {/* Helper T cell — a large white cell with a lobed nucleus and
         a small "Th" tag to distinguish it from the other T-cell
         types at a glance. */}
      <circle cx="50" cy="50" r="28" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
      <path
        d="M38 42 Q48 38 55 44 Q62 42 64 52 Q62 62 52 62 Q42 64 38 54 Q34 46 38 42 Z"
        fill="#8B5CF6" opacity="0.78"
      />
      <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>Th</text>
    </g>
  ),
  "b-cell": (active) => (
    <g>
      {/* B cell — white cell with a lobed nucleus and a small "B" tag,
         plus two small receptor Y-shapes on the surface (the B cell
         receptor) to distinguish it from the other white cells. */}
      <circle cx="50" cy="50" r="26" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
      <path
        d="M40 44 Q48 40 54 46 Q60 44 60 52 Q58 60 50 60 Q42 62 40 54 Q36 48 40 44 Z"
        fill="#8B5CF6" opacity="0.78"
      />
      <path d="M26 32 L26 24 M26 24 L22 20 M26 24 L30 20" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M74 32 L74 24 M74 24 L70 20 M74 24 L78 20" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>B</text>
    </g>
  ),
  "plasma-cell": (active) => (
    <g>
      {/* Plasma cell — a larger, rounder B cell with an eccentric
         nucleus and a stream of small Y-shaped antibodies being
         released to the right. */}
      <circle cx="40" cy="50" r="28" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
      <circle cx="40" cy="50" r="14" fill="#8B5CF6" opacity="0.78" />
      {[[74, 36], [82, 50], [74, 64]].map(([ax, ay], i) => (
        <path
          key={i}
          d={`M${ax - 8},${ay} L${ax},${ay} M${ax},${ay} L${ax + 4},${ay - 5} M${ax},${ay} L${ax + 4},${ay + 5}`}
          stroke="#8B5CF6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
      ))}
    </g>
  ),
  "cytotoxic-t": (active) => (
    <g>
      {/* Cytotoxic T cell — a white cell with a lobed nucleus, a small
         "Tc" tag, and a "killer" starburst effect to distinguish it
         from the helper T cell. */}
      <circle cx="50" cy="50" r="26" fill="#F3F1FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
      <path
        d="M40 44 Q48 40 54 46 Q60 44 60 52 Q58 60 50 60 Q42 62 40 54 Q36 48 40 44 Z"
        fill="#8B5CF6" opacity="0.78"
      />
      {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy], i) => (
        <line
          key={i}
          x1={50 + dx * 26}
          y1={50 + dy * 26}
          x2={50 + dx * 34}
          y2={50 + dy * 34}
          stroke="#C0392B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>Tc</text>
    </g>
  ),
  "lymph-node": (active) => (
    <g>
      {/* Lymph node — bean shape with internal follicles, afferent and
         efferent vessels. Same visual family as the `lymphnode` swatch
         from the immune system diagram, but scaled and detailed to
         show the vessels. */}
      <line x1="14" y1="34" x2="28" y2="42" stroke="#2D7BFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="50" x2="28" y2="50" stroke="#2D7BFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="66" x2="28" y2="58" stroke="#2D7BFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="72" y1="50" x2="86" y2="50" stroke="#2D7BFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="50" cy="50" rx="24" ry="16" fill={active ? "#2D7BFF" : ATLAS_COLORS.lymphoid} opacity="0.7" stroke="#123F9E" strokeWidth="1.2" />
      <ellipse cx="50" cy="50" rx="12" ry="7" fill="#0A0F1A" opacity="0.22" />
      {[[38, 44], [40, 50], [38, 56], [50, 42], [50, 58], [60, 44], [60, 56]].map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r="1.6" fill="#0A1F6B" opacity="0.55" />
      ))}
    </g>
  ),

  // ---- Haemodynamic Disorders ----
  // Swatches for the haemodynamic disorders diagram. Each mirrors the
  // structure or concept its tile describes — laminar flow, a wall-
  // anchored thrombus, Virchow's triad, a travelling embolus, an
  // infarct wedge, the two types of infarct, a vessel rupture, shock,
  // and clinical examples.
  normal: (active) => (
    <g>
      {/* Laminar flow — a smooth vessel with streamlined red cells
         travelling through in neat parallel lines. */}
      <path d="M10,42 L90,42" stroke="#E53935" strokeWidth="14" strokeLinecap="round" />
      <path d="M10,42 L90,42" stroke="#F5C7C0" strokeWidth="3" strokeLinecap="round" opacity="0.85" transform="translate(0,-3)" />
      {[20, 40, 60, 80].map((x, i) => (
        <ellipse key={i} cx={x} cy="42" rx="4" ry="2.5" fill="#8C1C12" opacity="0.7" />
      ))}
      <text x="50" y="68" textAnchor="middle" fontSize="7" fill="var(--text-2)">laminar flow</text>
    </g>
  ),
  thrombus: (active) => (
    <g>
      {/* A wall-anchored clot inside a vessel, with lines of Zahn. */}
      <path d="M10,50 L90,50" stroke="#E53935" strokeWidth="20" strokeLinecap="round" />
      <path d="M10,50 L90,50" stroke="#F5C7C0" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(0,-6)" />
      <path
        d="M28,60 Q42,32 58,40 Q74,44 76,58 Z"
        fill="#8C1C12" stroke={active ? "#F5B93F" : "#5A1810"} strokeWidth="1.6"
      />
      {[40, 52, 64].map((x, i) => (
        <path key={i} d={`M${x},56 Q${x + 2},48 ${x},42`} stroke="#F5C7C0" strokeWidth="1" fill="none" opacity="0.65" strokeLinecap="round" />
      ))}
      <line x1="40" y1="60" x2="40" y2="66" stroke="#5A1810" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="60" y1="58" x2="60" y2="64" stroke="#5A1810" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  virchow: (active) => (
    <g>
      {/* Three stacked labels representing Virchow's triad. */}
      <rect x="10" y="12" width="80" height="20" rx="4" fill={active ? "rgba(245,185,63,.22)" : "rgba(245,185,63,.1)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <text x="50" y="26" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--text)">1. Stasis</text>
      <rect x="10" y="40" width="80" height="20" rx="4" fill={active ? "rgba(245,185,63,.22)" : "rgba(245,185,63,.1)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <text x="50" y="54" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--text)">2. Injury</text>
      <rect x="10" y="68" width="80" height="20" rx="4" fill={active ? "rgba(245,185,63,.22)" : "rgba(245,185,63,.1)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.4" />
      <text x="50" y="82" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--text)">3. Hypercoagulable</text>
    </g>
  ),
  embolus: (active) => (
    <g>
      {/* A lumpy thrombus fragment travelling downstream, motion lines
         behind it. */}
      <path d="M10,52 L90,52" stroke="#E53935" strokeWidth="18" strokeLinecap="round" opacity="0.55" />
      <path
        d="M48,42 Q60,34 72,40 Q80,46 74,58 Q64,64 54,58 Q46,52 48,42 Z"
        fill="#8C1C12" stroke={active ? "#F5B93F" : "#5A1810"} strokeWidth="1.6"
      />
      <line x1="38" y1="46" x2="24" y2="46" stroke={active ? "#F5B93F" : "#5A1810"} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <line x1="36" y1="52" x2="18" y2="52" stroke={active ? "#F5B93F" : "#5A1810"} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <line x1="38" y1="58" x2="24" y2="58" stroke={active ? "#F5B93F" : "#5A1810"} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  infarction: (active) => (
    <g>
      {/* A wedge-shaped pale infarct at the end of a blocked vessel. */}
      <path d="M22,20 L22,80" stroke="#E53935" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
      <path d="M22,30 Q50,30 78,26 L70,74 Q50,70 22,74 Z" fill="#F5E8E0" stroke="#B63B2E" strokeWidth="1.6" />
      <text x="50" y="56" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#B63B2E">infarct</text>
    </g>
  ),
  "infarct-types": (active) => (
    <g>
      {/* White infarct (left) and red infarct (right), side by side. */}
      <path d="M14,30 L14,72" stroke="#E53935" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <path d="M14,36 Q32,36 44,32 L40,68 Q30,66 14,66 Z" fill="#F5E8E0" stroke="#B63B2E" strokeWidth="1.4" />
      <text x="30" y="82" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#B63B2E">white</text>
      <path d="M56,30 L56,72" stroke="#E53935" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <path d="M56,36 Q74,36 86,32 L82,68 Q72,66 56,66 Z" fill="#E53935" stroke="#8C1C12" strokeWidth="1.4" opacity="0.8" />
      <text x="72" y="82" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#C0392B">red</text>
    </g>
  ),
  haemorrhage: (active) => (
    <g>
      {/* A vessel with a break, blood escaping downward. */}
      <path d="M10,34 L90,34" stroke="#E53935" strokeWidth="12" strokeLinecap="round" />
      <path d="M50,40 L50,52" stroke="#8C1C12" strokeWidth="5" strokeLinecap="round" />
      {[[44, 62], [56, 70], [40, 78], [60, 84]].map(([dx, dy], i) => (
        <ellipse key={i} cx={dx} cy={dy} rx="5" ry="3.5" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
      ))}
    </g>
  ),
  shock: (active) => (
    <g>
      {/* A small body outline with faded/blue extremities — the visual
         shorthand for whole-body hypoperfusion. */}
      <circle cx="50" cy="24" r="10" fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.4" />
      <path d="M40,38 Q50,34 60,38 L58,72 Q50,76 42,72 Z" fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.4" />
      <circle cx="26" cy="50" r="6" fill="#2F6FED" opacity="0.6" />
      <circle cx="74" cy="50" r="6" fill="#2F6FED" opacity="0.6" />
      <text x="50" y="90" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#2F6FED">shock</text>
    </g>
  ),
  clinical: (active) => (
    <g>
      {/* Four labelled bars — the four big killers this topic covers. */}
      <rect x="14" y="14" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="25" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">MI</text>
      <rect x="14" y="34" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="45" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">stroke</text>
      <rect x="14" y="54" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="65" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">DVT</text>
      <rect x="14" y="74" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="85" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text)">PE</text>
    </g>
  ),

  // ---- Cell Injury ----
  stressors: (active) => (
    <g>
      {/* A cell (top-left) with arrows pushing in from several sides,
         showing the stressors that push it away from normal. */}
      <circle cx="40" cy="40" r="16" fill="#F8F4EE" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="40" cy="40" r="6" fill="url(#atlas-grad-nucleus)" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
        <line key={i} x1={40 + dx * 25} y1={40 + dy * 25} x2={40 + dx * 18} y2={40 + dy * 18} stroke="#C0392B" strokeWidth="2.2" strokeLinecap="round" />
      ))}
      <text x="50" y="82" textAnchor="middle" fontSize="7" fill="var(--text-2)">stressors</text>
    </g>
  ),
  adaptation: (active) => (
    <g>
      {/* Four small cells in a 2x2 grid: bigger, smaller, two nuclei,
         different shape — the four adaptations. */}
      <circle cx="28" cy="30" r="12" fill="#F8F4EE" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="28" cy="30" r="5" fill="url(#atlas-grad-nucleus)" />
      <circle cx="72" cy="30" r="7" fill="#F8F4EE" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="72" cy="30" r="3" fill="url(#atlas-grad-nucleus)" />
      <circle cx="28" cy="68" r="11" fill="#F8F4EE" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="24" cy="68" r="4" fill="url(#atlas-grad-nucleus)" />
      <circle cx="32" cy="68" r="4" fill="url(#atlas-grad-nucleus)" />
      <rect x="60" y="58" width="24" height="18" rx="4" fill="#F0F4FF" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="72" cy="67" r="4" fill="url(#atlas-grad-nucleus)" />
    </g>
  ),
  reversible: (active) => (
    <g>
      {/* Cell with swelling and blebs but membrane intact. */}
      <circle cx="50" cy="50" r="24" fill="#FBE9E7" stroke={active ? "#F5B93F" : "#E53935"} strokeWidth="1.6" />
      {[[-1, -0.4], [0.9, -0.5], [-0.7, 0.7], [0.75, 0.7], [0.1, -1.1]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx * 24} cy={50 + dy * 24} r="5" fill="#FBE9E7" stroke="#E53935" strokeWidth="1" />
      ))}
      <circle cx="50" cy="50" r="10" fill="url(#atlas-grad-nucleus)" opacity="0.85" />
      <text x="50" y="88" textAnchor="middle" fontSize="7" fontWeight="700" fill="#E53935">recoverable</text>
    </g>
  ),
  irreversible: (active) => (
    <g>
      {/* Cell with a visibly broken membrane, calcium specks, damaged
         nucleus. The point of no return. */}
      <path
        d="M26,50 A24,24 0 1 1 70,62"
        fill="none" stroke={active ? "#F5B93F" : "#8C1C12"} strokeWidth="2.4"
      />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#8C1C12" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="50" cy="50" r="9" fill="url(#atlas-grad-nucleus)" opacity="0.7" />
      {[[-12, -8], [10, -12], [-14, 10], [12, 12], [2, 16]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx} cy={50 + dy} r="1.6" fill="#5B21B6" opacity="0.9" />
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="7" fontWeight="700" fill="#8C1C12">committed to die</text>
    </g>
  ),
  necrosis: (active) => (
    <g>
      {/* A ruptured cell with contents spilling out and inflammatory
         cells around it — the messy death. */}
      <path
        d="M22,45 Q18,58 32,72 Q48,80 68,70 Q78,58 72,40 Q62,26 42,26 Q26,32 22,45 Z"
        fill="#F5C7C0" stroke={active ? "#F5B93F" : "#8C1C12"} strokeWidth="2"
      />
      {[[-28, -8], [28, 10], [20, -22], [-22, 20]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx} cy={50 + dy} r="4" fill="#FFE38A" stroke="#D89B14" strokeWidth="0.6" />
      ))}
      {[[-34, -22], [34, 20]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx} cy={50 + dy} r="3.5" fill="#F3F1FF" stroke="#8B5CF6" strokeWidth="0.8" />
      ))}
      <circle cx="46" cy="46" r="5" fill="url(#atlas-grad-nucleus)" opacity="0.7" />
      <circle cx="56" cy="54" r="4" fill="url(#atlas-grad-nucleus)" opacity="0.65" />
    </g>
  ),
  apoptosis: (active) => (
    <g>
      {/* A shrunken cell with a dark condensed nucleus, budding into
         apoptotic bodies. No inflammatory cells around. */}
      <path
        d="M26,50 Q24,38 34,32 Q46,28 58,34 Q68,40 66,52 Q64,64 54,68 Q40,72 32,64 Q26,58 26,50 Z"
        fill="#E8DFFF" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="2"
      />
      <circle cx="46" cy="50" r="7" fill="#5B21B6" />
      {[[78, 40], [76, 60], [22, 62]].map(([ax, ay], i) => (
        <g key={i}>
          <circle cx={ax} cy={ay} r="6" fill="#E8DFFF" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="1.2" />
          <circle cx={ax} cy={ay} r="2.5" fill="#5B21B6" opacity="0.7" />
        </g>
      ))}
    </g>
  ),
  "nec-vs-apop": (active) => (
    <g>
      {/* Side-by-side comparison: necrosis (left, crimson) and apoptosis
         (right, purple). Matches the panel in the diagram. */}
      <rect x="6" y="20" width="42" height="62" rx="8" fill={active ? "rgba(140,28,18,.22)" : "rgba(140,28,18,.1)"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="27" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#8C1C12">NECROSIS</text>
      <text x="27" y="52" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">bursts</text>
      <text x="27" y="64" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">inflames</text>
      <text x="27" y="76" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">pathological</text>
      <rect x="52" y="20" width="42" height="62" rx="8" fill={active ? "rgba(91,33,182,.22)" : "rgba(91,33,182,.1)"} stroke="#5B21B6" strokeWidth="1.6" />
      <text x="73" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#5B21B6">APOPTOSIS</text>
      <text x="73" y="52" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">shrinks</text>
      <text x="73" y="64" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">silent</text>
      <text x="73" y="76" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">can be normal</text>
    </g>
  ),

  // ---- Cell Cycle ----
  // Swatches for the cell-cycle diagram. Each mirrors the structure or
  // concept its tile describes — a phase ring, a resting cell, the
  // checkpoints, cyclins, cancer, and chemo drug targets.
  g1: (active) => (
    <g>
      {/* G1 phase — the growth phase. A cell enlarging, with a growing
         cytoplasmic area and a normal nucleus. */}
      <circle cx="50" cy="50" r="26" fill="#DBE7FF" stroke={active ? "#F5B93F" : "#2F6FED"} strokeWidth="2" />
      <circle cx="50" cy="50" r="11" fill="url(#atlas-grad-nucleus)" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#2F6FED"}>G1</text>
    </g>
  ),
  s: (active) => (
    <g>
      {/* S phase — DNA synthesis. A cell with a chromosome visible
         inside it, and a "copy" arrow. */}
      <circle cx="50" cy="50" r="26" fill="#EDE4FF" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="2" />
      {/* A chromosome inside, drawn as a small X */}
      <path d="M45,42 L55,58 M55,42 L45,58" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>S</text>
    </g>
  ),
  g2: (active) => (
    <g>
      {/* G2 phase — the check phase. A cell with two chromosomes ready
         to divide. */}
      <circle cx="50" cy="50" r="26" fill="#FBDCDC" stroke={active ? "#F5B93F" : "#E53935"} strokeWidth="2" />
      <path d="M38,42 L46,58 M46,42 L38,58" stroke="#8B5CF6" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M54,42 L62,58 M62,42 L54,58" stroke="#8B5CF6" strokeWidth="2.6" strokeLinecap="round" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#E53935"}>G2</text>
    </g>
  ),
  m: (active) => (
    <g>
      {/* M phase — mitosis. Two daughter cells separating, with a
         spindle line between them. */}
      <circle cx="30" cy="50" r="16" fill="#FFF0C7" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.8" />
      <circle cx="30" cy="50" r="6" fill="url(#atlas-grad-nucleus)" />
      <circle cx="70" cy="50" r="16" fill="#FFF0C7" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.8" />
      <circle cx="70" cy="50" r="6" fill="url(#atlas-grad-nucleus)" />
      <path d="M46,50 L54,50" stroke="#D89B14" strokeWidth="1.4" strokeDasharray="3 2" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#D89B14"}>M</text>
    </g>
  ),
  g0: (active) => (
    <g>
      {/* G0 — quiescent. A single cell sitting still, with a "z" to
         suggest dormancy. */}
      <circle cx="50" cy="50" r="22" fill="#E2E8F0" stroke={active ? "#F5B93F" : "#64748B"} strokeWidth="2" />
      <circle cx="50" cy="50" r="9" fill="url(#atlas-grad-nucleus)" opacity="0.7" />
      <text x="74" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#64748B">z</text>
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#64748B"}>G0</text>
    </g>
  ),
  checkpoints: (active) => (
    <g>
      {/* Three diamond markers along a short arc — the checkpoint
         concept drawn as gate points. */}
      <path d="M20,70 Q50,10 80,70" fill="none" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="3" opacity="0.85" />
      {[
        [35, 37], [50, 24], [65, 37]
      ].map(([px, py], i) => (
        <rect key={i} x={px - 6} y={py - 6} width="12" height="12" transform={`rotate(45 ${px} ${py})`} fill={active ? "#F5B93F" : "#D89B14"} stroke="#8B6410" strokeWidth="1" />
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--text-2)">3 gates</text>
    </g>
  ),
  cyclins: (active) => (
    <g>
      {/* A wave graph showing cyclin levels rising and falling through
         the cycle. */}
      <path
        d="M14,70 Q25,45 36,70 Q47,40 58,70 Q69,35 86,70"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text x="50" y="20" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>CYCLINS</text>
      <text x="50" y="88" textAnchor="middle" fontSize="7" fill="var(--text-2)">rise & fall</text>
    </g>
  ),
  cancer: (active) => (
    <g>
      {/* Cancer — a cluster of cells dividing out of control, with an
         overlaid "broken" symbol. */}
      {[[30, 40], [50, 32], [70, 40], [30, 60], [50, 68], [70, 60]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="9" fill="#FBDCDC" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="1.6" />
      ))}
      <text x="50" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="#C0392B">⚠</text>
      <text x="50" y="88" textAnchor="middle" fontSize="8" fontWeight="700" fill="#C0392B">no control</text>
    </g>
  ),
  drugs: (active) => (
    <g>
      {/* Chemo drugs — two pills/drug icons labelled by target phase. */}
      <rect x="18" y="24" width="26" height="14" rx="7" fill="#2F6FED" stroke="#123F9E" strokeWidth="1.4" />
      <line x1="31" y1="24" x2="31" y2="38" stroke="#fff" strokeWidth="1" />
      <text x="31" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="#2F6FED">S block</text>
      <rect x="56" y="24" width="26" height="14" rx="7" fill="#F5B93F" stroke="#8B6410" strokeWidth="1.4" />
      <line x1="69" y1="24" x2="69" y2="38" stroke="#fff" strokeWidth="1" />
      <text x="69" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="#8B6410">M block</text>
      <text x="50" y="58" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={active ? "#F5B93F" : "var(--text-2)"}>methotrexate</text>
      <text x="50" y="70" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={active ? "#F5B93F" : "var(--text-2)"}>vinca · taxanes</text>
    </g>
  ),

  // ---- Neoplasia ----
  // Swatches for the neoplasia diagram. Each mirrors the concept its
  // tile describes — a broken checkpoint gate, oncogenes as
  // accelerators, tumour suppressors as brakes, uncontrolled
  // proliferation, invasion, and staging.
  checkpoint: (active) => (
    <g>
      {/* A broken checkpoint gate — a diamond with a crack through it. */}
      <rect x="32" y="32" width="36" height="36" transform="rotate(45 50 50)" fill={active ? "rgba(245,185,63,.25)" : "rgba(192,57,43,.2)"} stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="2.2" />
      <path d="M42,42 L58,58 M58,42 L42,58" stroke="#8C1C12" strokeWidth="2.6" strokeLinecap="round" />
      <text x="50" y="90" textAnchor="middle" fontSize="8" fontWeight="700" fill="#8C1C12">failed</text>
    </g>
  ),
  oncogenes: (active) => (
    <g>
      {/* Oncogene — an accelerator pedal, pushed down. */}
      <rect x="24" y="34" width="52" height="34" rx="6" fill={active ? "rgba(192,57,43,.25)" : "rgba(192,57,43,.12)"} stroke="#C0392B" strokeWidth="1.8" />
      <path d="M30,62 L70,42" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" />
      <text x="50" y="82" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#C0392B">RAS · MYC</text>
      <text x="50" y="22" textAnchor="middle" fontSize="7" fill="var(--text-2)">accelerator</text>
    </g>
  ),
  tsg: (active) => (
    <g>
      {/* Tumour suppressor — a brake that's been cut. */}
      <circle cx="50" cy="50" r="22" fill="none" stroke={active ? "#F5B93F" : "#2F6FED"} strokeWidth="3" />
      <circle cx="50" cy="50" r="8" fill="#2F6FED" />
      <path d="M32,32 L68,68" stroke="#8C1C12" strokeWidth="2.4" strokeLinecap="round" />
      <text x="50" y="90" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#2F6FED">p53 · RB</text>
      <text x="50" y="16" textAnchor="middle" fontSize="7" fill="var(--text-2)">brakes cut</text>
    </g>
  ),
  proliferation: (active) => (
    <g>
      {/* Uncontrolled proliferation — many cells piled into a mass. */}
      {[[30, 40], [50, 30], [70, 40], [30, 60], [50, 68], [70, 60], [50, 49]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="9" fill="#FBDCDC" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="1.4" />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#C0392B">no stopping</text>
    </g>
  ),
  invasion: (active) => (
    <g>
      {/* Invasion — a cluster of cells breaking through a basement
         membrane line and moving down-right. */}
      <path d="M14,38 L86,38" stroke={active ? "#F5B93F" : "#B63B2E"} strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="30" cy="54" r="7" fill="#FBDCDC" stroke="#C0392B" strokeWidth="1.4" />
      <circle cx="50" cy="58" r="7" fill="#FBDCDC" stroke="#C0392B" strokeWidth="1.4" />
      <circle cx="70" cy="62" r="7" fill="#FBDCDC" stroke="#C0392B" strokeWidth="1.4" />
      <path d="M30,54 L50,58 L70,62" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity="0.6" />
      <text x="50" y="86" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#C0392B">through the wall</text>
    </g>
  ),
  staging: (active) => (
    <g>
      {/* Staging — a stack of four labelled bars, TNM. */}
      <rect x="14" y="14" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="25" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--text)">T — size</text>
      <rect x="14" y="34" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="45" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--text)">N — nodes</text>
      <rect x="14" y="54" width="72" height="16" rx="3" fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"} stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--text)">M — metastasis</text>
      <rect x="14" y="74" width="72" height="14" rx="3" fill={active ? "rgba(139,92,246,.25)" : "rgba(139,92,246,.12)"} stroke="#8B5CF6" strokeWidth="1.2" />
      <text x="50" y="84" textAnchor="middle" fontSize="7" fontWeight="700" fill="#8B5CF6">G — grade</text>
    </g>
  ),
};

/* ---------------------------------------------------------------- */
/* Narration helper - deliberately duplicated from App.js to avoid  */
/* a circular import, using the same localStorage key.               */
/* ---------------------------------------------------------------- */
const FEMALE_HINTS = ["female", "zira", "samantha", "victoria", "susan", "karen", "moira", "tessa", "fiona", "google us english", "google uk english female", "aria", "jenny", "sonia", "libby", "hazel", "salli", "joanna", "amy"];
const MALE_HINTS = ["male", "david", "mark", "daniel", "alex", "fred", "google uk english male", "guy", "ryan", "tom", "matthew", "brian", "arthur"];
let voicesCache = null;
function getVoices() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve([]); return; }
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length) { voicesCache = existing; resolve(existing); return; }
    if (voicesCache) { resolve(voicesCache); return; }
    const onChange = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        voicesCache = v;
        window.speechSynthesis.removeEventListener("voiceschanged", onChange);
        resolve(v);
      }
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1200);
  });
}
async function pickVoice() {
  let gender = "female";
  try { gender = localStorage.getItem("ascend_voice_gender") || "female"; } catch {}
  const voices = await getVoices();
  if (!voices.length) return null;
  const pool = voices.filter((v) => /^en/i.test(v.lang));
  const list = pool.length ? pool : voices;
  const hints = gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  const byName = list.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  if (byName) return byName;
  if (list.length > 1) return gender === "male" ? list[1] : list[0];
  return list[0] || null;
}

/* ---------------------------------------------------------------- */
/* Small shared bits                                                */
/* ---------------------------------------------------------------- */

function topLevelTopicOf(diagram) {
  let d = diagram;
  let guard = 0;
  while (d && !d.topic && d.parent && guard < 10) {
    d = DIAGRAMS[d.parent];
    guard++;
  }
  return d ? d.topic : null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const atlasStyles = `
@keyframes atlasShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes atlasShimmer {
    0%, 100% { background-position: 0 0; }
  }
}
@keyframes atlasPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
}
.atlas-pulse rect { animation: atlasPulse 1.1s ease-in-out infinite; }
@keyframes atlasShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.atlas-shake { animation: atlasShake 0.3s ease-in-out; border-color: var(--bad) !important; }
@keyframes atlasSnap {
  0% { transform: scale(0.85); opacity: .4; }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.atlas-snap { animation: atlasSnap 0.25s ease-out; }
.atlas-viewer-stage { touch-action: none; cursor: default; position: relative; }

/* Play bar - sits above everything, same role as the Listen bar on a
   topic note. */
.atlas-playbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; row-gap: 6px; }
@media (max-width: 420px) {
  .atlas-playbar { gap: 6px; padding: 10px 12px !important; }
  .atlas-playbar .btn { min-height: 34px; padding: 5px 10px; font-size: 12.5px; }
}
.atlas-dots { display: flex; gap: 5px; margin-top: 10px; }
.atlas-dot { flex: 1; height: 6px; border-radius: 3px; border: none; cursor: pointer; background: var(--line); }
.atlas-dot.on { background: var(--amber); }

/* Progress bar fill transition - only motion it has. */
@media (prefers-reduced-motion: reduce) {
  .atlas-progress-fill { transition: none !important; }
}

/* Diagram + summary row - side by side once there's room. */
.atlas-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.atlas-diagram-col { flex: 1 1 340px; min-width: 0; }
.atlas-summary-col { flex: 1 1 280px; min-width: 0; }
@media (max-width: 900px) {
  .atlas-row { flex-direction: column; }
  .atlas-diagram-col,
  .atlas-summary-col { flex: 1 1 auto; width: 100%; }
}

/* Zoom controls float on the diagram itself. */
.atlas-zoom-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; z-index: 10; }
.atlas-zoom-controls .btn { background: rgba(10,15,26,.65); backdrop-filter: blur(6px); box-shadow: 0 2px 8px rgba(0,0,0,.25); }
@media (max-width: 640px) {
  .atlas-zoom-controls { top: 6px; right: 6px; gap: 3px; }
  .atlas-zoom-controls .btn { min-height: 30px; min-width: 30px; padding: 0 6px; font-size: 12px; }
  .atlas-zoom-controls .mono { min-width: 38px !important; font-size: 11.5px; }
}

/* Step badge - floats top-LEFT of the stage. */
.atlas-step-badge {
  position: absolute; top: 8px; left: 8px; z-index: 10;
  background: rgba(10,15,26,.65); backdrop-filter: blur(6px);
  color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: .02em;
  padding: 5px 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.25);
  pointer-events: none; font-family: monospace;
}
@media (max-width: 640px) {
  .atlas-step-badge { top: 6px; left: 6px; font-size: 10.5px; padding: 4px 8px; }
}

/* Fullscreen - the stage detaches and fills the viewport. */
.atlas-stage-fullscreen {
  position: fixed !important; inset: 0 !important; z-index: 200 !important;
  height: 100dvh !important; width: 100vw !important; border-radius: 0 !important;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Legend - full width, below the diagram+summary row. */
.atlas-legend-full .atlas-legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px 16px;
  margin-top: 10px;
}
.atlas-legend-full .atlas-legend-grid .btn {
  white-space: normal;
  word-break: break-word;
  line-height: 1.35;
  padding: 8px 10px;
  min-height: 36px;
}

/* Respect reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .atlas-pulse rect { animation: none !important; opacity: 1 !important; }
  .atlas-shake { animation: none !important; }
  .atlas-snap { animation: none !important; }
}
`;

/* ---------------------------------------------------------------- */
/* Screen 1 - course picker                                         */
/* ---------------------------------------------------------------- */
function CoursePicker({ onPick }) {
  const courseIds = coursesWithDiagrams();
  if (courseIds.length === 0) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>No illustrated diagrams yet</div>
        <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>Check back soon - new visuals are added to Atlas regularly.</div>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 12, marginTop: 16 }}>
      {courseIds.map((cid) => {
        const list = diagramsForCourse(cid);
        return (
          <button key={cid} className="card hover" style={{ textAlign: "left" }} onClick={() => onPick(cid)}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{ATLAS_COURSE_NAMES[cid] || cid}</div>
            <div className="mono" style={{ color: "var(--amber-2)", fontSize: 12, marginTop: 6 }}>
              {list.length} visual{list.length === 1 ? "" : "s"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Screen 2 - visuals list                                          */
/* ---------------------------------------------------------------- */
function VisualsList({ courseId, onBack, onOpen }) {
  const list = diagramsForCourse(courseId);
  const [query, setQuery] = useState("");

  const searchIndex = useMemo(
    () => list.map((d) => ({
      diagram: d,
      haystack: [
        d.title,
        `topic ${(d.topic?.topicIndex ?? 0) + 1}`,
        ...(d.labels || []).map((l) => l.name),
        ...(d.labels || []).map((l) => l.desc || ""),
      ].join(" ").toLowerCase(),
    })),
    [list]
  );

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? searchIndex.filter((entry) => entry.haystack.includes(trimmed)).map((entry) => entry.diagram)
    : list;

  return (
    <div style={{ marginTop: 16 }}>
      <button className="back" onClick={onBack}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        {ATLAS_COURSE_NAMES[courseId] || courseId}
      </button>

      {list.length > 1 && (
        <div style={{ position: "relative", marginTop: 10 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this course's visuals…"
            aria-label="Search this course's visuals"
            style={{
              width: "100%",
              padding: "10px 36px 10px 12px",
              fontSize: 14,
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg-2)",
              color: "var(--text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              title="Clear search"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 26,
                height: 26,
                padding: 0,
                border: "none",
                background: "transparent",
                color: "var(--text-3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      )}

      {trimmed && filtered.length === 0 && (
        <div className="card" style={{ marginTop: 12, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>No visuals match "{query}"</div>
          <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>
            Try a shorter term, or clear the search to see all {list.length} visuals.
          </div>
          <button className="btn btn-g btn-sm" style={{ marginTop: 10 }} onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {filtered.map((d) => (
          <button key={d.id} className="card hover" style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }} onClick={() => onOpen(d.id)}>
            <div style={{ width: 64, height: 48, borderRadius: 8, overflow: "hidden", background: "var(--bg-3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {d.type === "diagram"
                ? d.render({ onLabelClick: () => {}, activeLabelId: null, activeStep: 0, preview: true })
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.title}</div>
              <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 2 }}>Topic {(d.topic?.topicIndex ?? 0) + 1}</div>
            </div>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--amber)", background: "var(--amber-dim)", padding: "3px 7px", borderRadius: 6, flexShrink: 0 }}>
              {d.type === "builder" ? "BUILDER" : "DIAGRAM"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Screen 3+4 - the diagram viewer                                  */
/* ---------------------------------------------------------------- */
function DiagramViewer({ diagramId, courseId, breadcrumb, onBreadcrumb, onDrill, onExit, onOpenDiagram, app }) {
  const diagram = DIAGRAMS[diagramId];
  const [activeLabelId, setActiveLabelId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const DEFAULT_ZOOM = 1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [painted, setPainted] = useState(false);

  const playTokenRef = useRef(0);
  const pinchRef = useRef(null);
  const stageRef = useRef(null);
  const legendRefs = useRef({});

  const applyZoom = useCallback((nextZoomRaw) => {
    setZoom((prev) => {
      const target = typeof nextZoomRaw === "function" ? nextZoomRaw(prev) : nextZoomRaw;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +Number(target).toFixed(2)));
      return next;
    });
  }, []);

  // Reset view state whenever the diagram changes, and restore the last
  // step for this diagram from sessionStorage.
  useEffect(() => {
    setActiveLabelId(null);
    setPlaying(false);
    setPaused(false);
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
    playTokenRef.current++;
    cachedVoiceRef.current = undefined;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}

    let restored = 0;
    try {
      const raw = sessionStorage.getItem(`ascend_atlas_step_${diagramId}`);
      const parsed = parseInt(raw, 10);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed < diagram.narration.length) {
        restored = parsed;
      }
    } catch {}
    setActiveStep(restored);
  }, [diagramId, diagram.narration.length]);

  // Flip painted false on diagram change, true on next frame.
  useEffect(() => {
    setPainted(false);
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (!cancelled) setPainted(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [diagramId]);

  // Legend auto-scroll during playback — but ONLY when the legend is
  // already in view. If the student is watching the diagram (legend
  // scrolled off screen), we don't want to yank the page down to the
  // legend on every step change — that would drag the diagram out of
  // view mid-animation. The legend still updates its "on" state
  // silently, so when the student glances down it's already showing
  // the right tile. We only auto-scroll when the legend is already
  // partly visible, to nudge the correct tile into full view.
  //
  // The check: is any part of the legend container within the
  // viewport? If yes, scroll the target tile into view (which is
  // harmless because the legend was already on screen). If no,
  // skip the scroll entirely.
  useEffect(() => {
    if (!playing) return;
    const focus = diagram.stepFocus[activeStep];
    if (!Array.isArray(focus) || focus.length === 0) return;

    const firstWithTile = focus.find((id) => legendRefs.current[id]);
    const node = firstWithTile ? legendRefs.current[firstWithTile] : null;
    if (!node || typeof node.scrollIntoView !== "function") return;

    // Is the legend (or this tile) anywhere near the viewport?
    // Use the tile's own bounding box — if the tile's top is well
    // below the fold, or well above it, we skip the scroll.
    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    // Tolerance band: we auto-scroll only if the tile is within
    // one viewport-height either side of the visible area. Beyond
    // that, the student has intentionally scrolled away from the
    // legend (e.g. to watch the diagram) and we leave them alone.
    const nearViewport = rect.top < viewportH * 1.5 && rect.bottom > -viewportH * 0.5;
    if (!nearViewport) return;

    node.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeStep, playing, diagram]);

  // Persist current step to sessionStorage.
  useEffect(() => {
    try {
      sessionStorage.setItem(`ascend_atlas_step_${diagramId}`, String(activeStep));
    } catch {}
  }, [activeStep, diagramId]);

  // Dev-time checks (rule book sections 4.1-4.3).
  useEffect(() => {
    if (diagram.narration.length !== diagram.stepFocus.length) {
      console.warn(
        `[Atlas] "${diagram.id}": narration has ${diagram.narration.length} steps but stepFocus has ${diagram.stepFocus.length} - highlighting will be out of sync.`
      );
    }
    diagram.narration.forEach((line, i) => {
      const words = line.trim().split(/\s+/).length;
      if (words > 50) {
        console.warn(`[Atlas] "${diagram.id}" step ${i + 1}: narration is ${words} words (limit 50).`);
      }
      if (line.includes("→")) {
        console.warn(`[Atlas] "${diagram.id}" step ${i + 1}: narration contains "→" - the speech engine reads this as "right arrow". Use "to" or a comma instead.`);
      }
    });
    const allFocusIds = new Set(diagram.stepFocus.flat());
    const labelIds = new Set(diagram.labels.map((l) => l.id));
    allFocusIds.forEach((id) => {
      if (!labelIds.has(id)) {
        console.warn(`[Atlas] "${diagram.id}": stepFocus references label id "${id}" which isn't in labels - it will silently do nothing.`);
      }
    });
    diagram.labels.forEach((l) => {
      if (!LEGEND_SWATCHES[l.id]) {
        console.warn(`[Atlas] "${diagram.id}": label "${l.id}" has no entry in LEGEND_SWATCHES - it will show a grey circle in the legend.`);
      }
    });
  }, [diagram]);

  useEffect(() => () => { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  const advanceAfterStep = useCallback((myToken) => {
    if (myToken !== playTokenRef.current) return;
    setPlaying((isPlaying) => {
      if (isPlaying) {
        setTimeout(() => {
          if (myToken !== playTokenRef.current) return;
          setActiveStep((s) => {
            const next = s + 1;
            if (next >= diagram.narration.length) {
              if (diagram.loop) {
                speakStepRef.current(0);
                return 0;
              }
              setPlaying(false);
              return s;
            }
            speakStepRef.current(next);
            return next;
          });
        }, 350);
      }
      return isPlaying;
    });
  }, [diagram]);

  const speakStepRef = useRef(() => {});
  const cachedVoiceRef = useRef(undefined);
  const speakStep = useCallback((stepIdx) => {
    const text = diagram.narration[stepIdx];
    if (!text) return;
    const myToken = playTokenRef.current;

    if (muted || !("speechSynthesis" in window)) {
      const words = text.trim().split(/\s+/).length;
      const ms = Math.max(1200, (words / 2.6) * 1000) / speed;
      setTimeout(() => advanceAfterStep(myToken), ms);
      return;
    }

    (async () => {
      if (cachedVoiceRef.current === undefined) {
        cachedVoiceRef.current = (await pickVoice()) || null;
      }
      const voice = cachedVoiceRef.current;
      if (myToken !== playTokenRef.current) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (voice) utter.voice = voice;
      utter.rate = speed;
      utter.onend = () => advanceAfterStep(myToken);
      utter.onerror = () => advanceAfterStep(myToken);
      window.speechSynthesis.speak(utter);
    })();
  }, [diagram, speed, muted, advanceAfterStep]);
  useEffect(() => { speakStepRef.current = speakStep; }, [speakStep]);

  const isFinished =
    !playing &&
    !paused &&
    !diagram.loop &&
    activeStep === diagram.narration.length - 1;

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      setPaused(true);
      playTokenRef.current++;
      try { window.speechSynthesis.cancel(); } catch {}
      return;
    }
    const startAt = isFinished ? 0 : activeStep;
    if (startAt !== activeStep) setActiveStep(startAt);
    setPlaying(true);
    setPaused(false);
    speakStep(startAt);
  };

  const jumpTo = (idx) => {
    playTokenRef.current++;
    try { window.speechSynthesis.cancel(); } catch {}
    setActiveStep(idx);
    if (playing) speakStep(idx);
    else setPaused(false);
  };

  const stepBy = (delta) => {
    const next = Math.max(0, Math.min(diagram.narration.length - 1, activeStep + delta));
    jumpTo(next);
  };

  const toggleMute = () => setMuted((m) => !m);
  const toggleFullscreen = () => setFullscreen((f) => !f);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepBy(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepBy(1);
      } else if (e.code === "Escape") {
        if (fullscreen) setFullscreen(false);
        else onExit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen, activeStep, playing, paused, diagramId]);

  const onWheelRef = useRef(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      applyZoom((z) => z + delta);
    };
    onWheelRef.current = handler;
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [applyZoom]);

  const pointers = useRef(new Map());
  const dragRef = useRef(null);
  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX, panY };
    }
    if (pointers.current.size === 2) {
      dragRef.current = null;
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { dist, zoom };
    }
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchRef.current) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / (pinchRef.current.dist || 1);
      applyZoom(pinchRef.current.zoom * ratio);
    } else if (pointers.current.size === 1 && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPanX(dragRef.current.panX + dx);
      setPanY(dragRef.current.panY + dy);
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };
  const activeLabel = diagram.labels?.find((l) => l.id === activeLabelId) || null;
  const topTopic = topLevelTopicOf(diagram);

  const courseDiagrams = courseId ? diagramsForCourse(courseId) : [];
  const myIndex = courseDiagrams.findIndex((d) => d.id === diagramId);
  const prevDiagram = myIndex > 0 ? courseDiagrams[myIndex - 1] : null;
  const nextDiagram = myIndex >= 0 && myIndex < courseDiagrams.length - 1
    ? courseDiagrams[myIndex + 1]
    : null;

  return (
    <div style={{ marginTop: 16 }}>
      <style>{atlasStyles}</style>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <button className="back" style={{ margin: 0 }} onClick={onExit}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          Back
        </button>
        {breadcrumb.map((id, i) => (
          <React.Fragment key={id}>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 12 }}>›</span>
            <button
              className="mono"
              style={{ background: "none", border: "none", cursor: i === breadcrumb.length - 1 ? "default" : "pointer", color: i === breadcrumb.length - 1 ? "var(--amber-2)" : "var(--text-2)", fontSize: 12, fontWeight: i === breadcrumb.length - 1 ? 700 : 500, padding: 0 }}
              onClick={() => i !== breadcrumb.length - 1 && onBreadcrumb(i)}
            >
              {DIAGRAMS[id].title.split(" — ")[0]}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="card atlas-playbar">
        <button
          className="btn btn-a btn-sm"
          onClick={handlePlay}
          title={playing ? "Pause" : paused ? "Resume" : isFinished ? "Restart" : "Play"}
          aria-label={playing ? "Pause walkthrough" : paused ? "Resume walkthrough" : isFinished ? "Restart walkthrough from the beginning" : "Play walkthrough"}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "6px 14px",
            minWidth: 56,
            lineHeight: 1,
          }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : isFinished ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em" }}>
            {playing ? "Pause" : paused ? "Resume" : isFinished ? "Restart" : "Play"}
          </span>
        </button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(-1)} disabled={activeStep === 0} aria-label="Previous step" title="Previous step">◀</button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(1)} disabled={!diagram.loop && activeStep === diagram.narration.length - 1} aria-label="Next step" title="Next step">▶</button>
        <button className="btn btn-g btn-sm mono" onClick={() => setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 0.85 : 1))} title="Playback speed" aria-label={"Playback speed " + speed + "x"}>{speed}×</button>
        <button
          className="btn btn-g btn-sm"
          onClick={toggleMute}
          title={muted ? "Unmute narration" : "Mute narration"}
          aria-label={muted ? "Unmute narration" : "Mute narration"}
          aria-pressed={muted}
          style={muted ? { color: "var(--amber-2)", borderColor: "rgba(245,185,63,.4)" } : undefined}
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
          )}
        </button>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", marginLeft: "auto" }} aria-live="polite" aria-atomic="true">Step {activeStep + 1} / {diagram.narration.length}</span>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "relative",
          height: 4,
          marginTop: 6,
          marginBottom: 2,
          borderRadius: 2,
          background: "var(--line)",
          overflow: "hidden",
        }}
      >
        <div
          className="atlas-progress-fill"
          style={{
            position: "absolute",
            inset: 0,
            width: `${((activeStep + 1) / diagram.narration.length) * 100}%`,
            background: "var(--amber)",
            borderRadius: 2,
            transition: "width 0.25s ease-out",
          }}
        />
      </div>

      <div className="atlas-dots">
        {diagram.narration.map((_, i) => (
          <button key={i} className={"atlas-dot" + (i <= activeStep ? " on" : "")} onClick={() => jumpTo(i)} title={`Step ${i + 1}`} />
        ))}
      </div>
      <div
        style={{
          color: "var(--text-2)",
          fontSize: "clamp(13px, 3.4vw, 15px)",
          lineHeight: 1.55,
          marginTop: 8,
          marginBottom: 14,
          minHeight: 40,
        }}
      >
        {diagram.narration[activeStep]}
      </div>
      <div className="atlas-row">
        <div className="atlas-diagram-col">
          <div
            ref={stageRef}
            className={"card atlas-viewer-stage" + (fullscreen ? " atlas-stage-fullscreen" : "")}
            style={{
              padding: 0,
              overflow: "hidden",
              height: fullscreen ? undefined : "clamp(240px, 48vh, 560px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="atlas-step-badge">Step {activeStep + 1} / {diagram.narration.length}</div>
            <div
              className="atlas-zoom-controls"
              style={{ pointerEvents: "auto", zIndex: 10 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="btn btn-sm" title="Zoom out" onClick={() => applyZoom((z) => z - 0.2)}>−</button>
              <button className="btn btn-sm mono" title="Reset view - re-centers and resets zoom" style={{ minWidth: 46 }} onClick={() => { applyZoom(DEFAULT_ZOOM); setPanX(0); setPanY(0); }}>{Math.round(zoom * 100)}%</button>
              <button className="btn btn-sm" title="Zoom in" onClick={() => applyZoom((z) => z + 0.2)}>+</button>
              <button className="btn btn-sm" title={fullscreen ? "Exit fullscreen" : "Fullscreen"} aria-label={fullscreen ? "Exit fullscreen" : "Expand to fullscreen"} onClick={toggleFullscreen}>
                {fullscreen ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" /></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" /></svg>
                )}
              </button>
            </div>
            {!painted && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "60%",
                    borderRadius: 16,
                    background: "linear-gradient(90deg, var(--bg-3) 0%, var(--bg-2) 50%, var(--bg-3) 100%)",
                    backgroundSize: "200% 100%",
                    animation: "atlasShimmer 1.4s ease-in-out infinite",
                  }}
                />
              </div>
            )}
            <div
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: dragRef.current ? "none" : "transform 0.15s ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // In fullscreen, force the wrapper to fill the whole
                // stage so its centring flex rules actually apply to
                // the full viewport. In normal (non-fullscreen) mode,
                // keep the wrapper sized to the SVG's own bounds.
                width: fullscreen ? "100%" : undefined,
                height: fullscreen ? "100%" : undefined,
                maxWidth: "100%",
                maxHeight: "100%",
                willChange: "transform",
                cursor: "grab",
                opacity: painted ? 1 : 0,
              }}
            >
              {diagram.render({
                onLabelClick: (labelId) => {
                  setActiveLabelId(labelId);
                  const stepIdx = diagram.stepFocus.findIndex(
                    (focusList) => Array.isArray(focusList) && focusList.includes(labelId)
                  );
                  if (stepIdx === -1) return;
                  playTokenRef.current++;
                  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
                  setActiveStep(stepIdx);
                  if (playing) {
                    speakStep(stepIdx);
                  } else {
                    setPaused(false);
                  }
                },
                activeLabelId,
                activeStep,
                onOpenDrill: () => {},
              })}
            </div>
          </div>
        </div>

        <div className="atlas-summary-col card">
          <div className="eyebrow" style={{ marginBottom: 6 }}>About this topic</div>
          <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.5 }}>
            {diagram.summary || diagram.title}
          </div>

          <div aria-live="polite" aria-atomic="true">
            {activeLabel && (
              <div className="card" style={{ marginTop: 12, borderColor: "rgba(245,185,63,.35)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--amber-2)" }}>{activeLabel.name}</div>
                <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>{activeLabel.desc}</div>
                {activeLabel.drillTo && (
                  <button className="btn btn-a btn-sm" style={{ marginTop: 8 }} onClick={() => onDrill(activeLabel.drillTo)}>
                    Open {activeLabel.name} <Ic_chevR />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card atlas-legend-full" style={{ marginTop: 12 }}>
        <div className="eyebrow">Legend — tap any part to highlight it</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))", gap: 10, marginTop: 12 }}>
          {(diagram.labels || []).map((l) => {
            const active = activeLabelId === l.id;
            return (
              <button
                key={l.id}
                ref={(node) => {
                  if (node) legendRefs.current[l.id] = node;
                  else delete legendRefs.current[l.id];
                }}
                onClick={() => setActiveLabelId(active ? null : l.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 8px",
                  textAlign: "center",
                  background: active ? "var(--amber-dim)" : "var(--bg-3)",
                  color: active ? "var(--amber-2)" : "var(--text)",
                  border: "1px solid " + (active ? ATLAS_COLORS.trunk : "var(--line)"),
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  height: "auto",
                  minHeight: 120,
                  transition: "border-color .15s, background .15s",
                }}
              >
                <span style={{
                  display: "inline-flex",
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-2)",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: active ? "1px solid " + ATLAS_COLORS.trunk : "1px solid var(--line)",
                }}>
                  <svg viewBox={LEGEND_VIEWBOXES[l.id] || "0 0 100 100"} width="56" height="56">
                    {LEGEND_SWATCHES[l.id] ? LEGEND_SWATCHES[l.id](active) : (
                      <circle cx="50" cy="50" r="20" fill={active ? ATLAS_COLORS.trunk : "var(--text-3)"} />
                    )}
                  </svg>
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.3, fontWeight: 700 }}>{l.name}</span>
                {active && l.desc && (
                  <span style={{
                    display: "block",
                    fontSize: 11.5,
                    color: "var(--text-2)",
                    fontWeight: 400,
                    lineHeight: 1.5,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}>
                    {l.desc}
                  </span>
                )}
                {active && l.drillTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrill(l.drillTo);
                    }}
                    style={{
                      marginTop: 4,
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "1px solid " + ATLAS_COLORS.trunk,
                      background: "var(--amber)",
                      color: "#1B1405",
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    Open {DIAGRAMS[l.drillTo]?.title?.split(" — ")[0] || l.name} →
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="divider" />
      {topTopic && (
        <button className="btn btn-g" style={{ width: "100%" }} onClick={() => app.go("topic", { courseId: topTopic.courseId, topicId: topTopic.topicIndex })}>
          Read the topic
        </button>
      )}

      {(prevDiagram || nextDiagram) && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {prevDiagram ? (
            <button
              className="btn btn-g"
              style={{ flex: 1, textAlign: "left", minWidth: 0 }}
              onClick={() => onOpenDiagram(prevDiagram.id)}
              aria-label={`Previous visual: ${prevDiagram.title}`}
            >
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>← Previous visual</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevDiagram.title.split(" — ")[0]}</span>
            </button>
          ) : <span style={{ flex: 1 }} />}
          {nextDiagram ? (
            <button
              className="btn btn-g"
              style={{ flex: 1, textAlign: "right", minWidth: 0 }}
              onClick={() => onOpenDiagram(nextDiagram.id)}
              aria-label={`Next visual: ${nextDiagram.title}`}
            >
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>Next visual →</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextDiagram.title.split(" — ")[0]}</span>
            </button>
          ) : <span style={{ flex: 1 }} />}
        </div>
      )}
    </div>
  );
}

function Ic_chevR() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, verticalAlign: "-2px" }}><path d="M9 6l6 6-6 6" /></svg>;
}

/* ---------------------------------------------------------------- */
/* Screen 5 - the pathway builder                                   */
/* ---------------------------------------------------------------- */
function PathwayBuilder({ diagramId, onExit, app }) {
  const diagram = DIAGRAMS[diagramId];
  const [pool, setPool] = useState(() => shuffle(diagram.steps));
  const [placed, setPlaced] = useState([]);
  const [shakeId, setShakeId] = useState(null);
  const [shareMsg, setShareMsg] = useState("");
  const done = placed.length === diagram.steps.length;

  const place = (blockId) => {
    if (done) return;
    const correctId = diagram.steps[placed.length].id;
    if (blockId === correctId) {
      setPlaced((p) => [...p, blockId]);
      setPool((p) => p.filter((b) => b.id !== blockId));
    } else {
      setShakeId(blockId);
      setTimeout(() => setShakeId(null), 320);
    }
  };

  const reset = () => {
    setPool(shuffle(diagram.steps));
    setPlaced([]);
  };

  const share = async () => {
    const text = `I just arranged ${diagram.title} on ASCEND!`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg("Copied to clipboard");
        setTimeout(() => setShareMsg(""), 2000);
      }
    } catch {}
  };

  const topTopic = diagram.topic;

  return (
    <div style={{ marginTop: 16 }}>
      <style>{atlasStyles}</style>
      <button className="back" onClick={onExit}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        Back
      </button>
      <div className="eyebrow" style={{ marginTop: 10 }}>{diagram.title}</div>
      <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>{diagram.intro}</div>

      <div className="mono" style={{ fontSize: 12.5, color: "var(--amber-2)", fontWeight: 700, marginTop: 14 }}>
        {placed.length} of {diagram.steps.length} placed
      </div>
      <div className="bar" style={{ marginTop: 6, marginBottom: 14 }}>
        <i style={{ width: (placed.length / diagram.steps.length) * 100 + "%" }} />
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 6 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) place(id); }}
      >
        {diagram.steps.map((s, i) => {
          const filled = i < placed.length;
          const block = filled ? diagram.steps.find((x) => x.id === placed[i]) : null;
          return (
            <div
              key={i}
              className={filled ? "card atlas-snap" : "card"}
              style={{
                padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
                borderStyle: filled ? "solid" : "dashed",
                borderColor: filled ? "var(--amber)" : "var(--line)",
                background: filled ? "var(--amber-dim)" : "transparent",
                minHeight: 20,
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", width: 18, flexShrink: 0 }}>{i + 1}</span>
              {block ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{block.label}</div>
                  {block.sub && <div style={{ color: "var(--text-2)", fontSize: 11.5 }}>{block.sub}</div>}
                </div>
              ) : (
                <span style={{ color: "var(--text-3)", fontSize: 13 }}>Empty</span>
              )}
            </div>
          );
        })}
      </div>

      {done ? (
        <div className="card" style={{ marginTop: 16, borderColor: "var(--good)", textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 15.5, color: "var(--good)" }}>Pathway complete!</div>
          <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>{diagram.steps.length} of {diagram.steps.length} correct, in order.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-a btn-sm" onClick={share}>Share this</button>
            <button className="btn btn-g btn-sm" onClick={reset}>Try again</button>
            {topTopic && <button className="btn btn-g btn-sm" onClick={() => app.go("topic", { courseId: topTopic.courseId, topicId: topTopic.topicIndex })}>Read the topic</button>}
          </div>
          {shareMsg && <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 8 }}>{shareMsg}</div>}
        </div>
      ) : (
        <>
          <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Tap the next block</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pool.map((b) => (
              <button
                key={b.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", b.id)}
                onClick={() => place(b.id)}
                className={"card hover" + (shakeId === b.id ? " atlas-shake" : "")}
                style={{ padding: "8px 12px", cursor: "grab" }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{b.label}</div>
                {b.sub && <div style={{ color: "var(--text-2)", fontSize: 11 }}>{b.sub}</div>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Root                                                              */
/* ---------------------------------------------------------------- */
export default function AtlasView({ app }) {
  const openedFromCourseId = app?.courseId;
  const openedFromTopicId = app?.topicId;

  const initial = useMemo(() => {
    if (openedFromCourseId != null && openedFromTopicId != null) {
      const d = diagramForTopic(openedFromCourseId, openedFromTopicId);
      if (d) return { screen: "viewer", courseId: openedFromCourseId, diagramId: d.id, breadcrumb: [d.id] };
    }
    return { screen: "courses", courseId: null, diagramId: null, breadcrumb: [] };
  }, []);

  const [screen, setScreen] = useState(initial.screen);
  const [courseId, setCourseId] = useState(initial.courseId);
  const [diagramId, setDiagramId] = useState(initial.diagramId);
  const [breadcrumb, setBreadcrumb] = useState(initial.breadcrumb);

  const openCourse = (cid) => { setCourseId(cid); setScreen("list"); };
  const openDiagram = (id) => { setDiagramId(id); setBreadcrumb([id]); setScreen("viewer"); };
  const drillInto = (id) => { setDiagramId(id); setBreadcrumb((b) => [...b, id]); };
  const goToBreadcrumb = (i) => { setDiagramId(breadcrumb[i]); setBreadcrumb((b) => b.slice(0, i + 1)); };
  const exitViewer = () => {
    if (breadcrumb.length > 1) {
      goToBreadcrumb(breadcrumb.length - 2);
      return;
    }
    if (openedFromCourseId != null && openedFromTopicId != null) {
      app.go("topic", { courseId: openedFromCourseId, topicId: openedFromTopicId });
      return;
    }
    setScreen(courseId ? "list" : "courses");
  };

  const diagram = diagramId ? DIAGRAMS[diagramId] : null;

  return (
    <div className="view">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        {atlasDefs()}
      </svg>
      <div className="eyebrow">Atlas</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>
        Illustrated diagrams, topic by topic
      </h1>
      {screen === "courses" && (
        <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "60ch" }}>
          Pick a course to see the topics with a hand-drawn, interactive diagram.
        </p>
      )}

      {screen === "courses" && <CoursePicker onPick={openCourse} />}

      {screen === "list" && (
        <VisualsList courseId={courseId} onBack={() => setScreen("courses")} onOpen={openDiagram} />
      )}

      {screen === "viewer" && diagram && diagram.type === "diagram" && (
        <DiagramViewer
          diagramId={diagramId}
          courseId={courseId}
          breadcrumb={breadcrumb}
          onBreadcrumb={goToBreadcrumb}
          onDrill={drillInto}
          onExit={exitViewer}
          onOpenDiagram={openDiagram}
          app={app}
        />
      )}

      {screen === "viewer" && diagram && diagram.type === "builder" && (
        <PathwayBuilder diagramId={diagramId} onExit={exitViewer} app={app} />
      )}
    </div>
  );
}
