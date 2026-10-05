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
  // Renal Physiology
  kidney: "0 0 100 100",
  nephron: "0 0 100 100",
  glomerulus: "0 0 100 100",
  pct: "0 0 100 100",
  loop: "0 0 100 100",
  dct: "0 0 100 100",
  collecting: "0 0 100 100",
  hormones: "0 0 100 100",
  gfr: "0 0 100 100",
  // Acid-Base Balance
  ph: "0 0 100 100",
  buffers: "0 0 100 100",
  bicarbonate: "0 0 100 100",
  hh: "0 0 100 100",
  "kidney-h": "0 0 100 100",
  "kidney-hco3": "0 0 100 100",
  "resp-disorders": "0 0 100 100",
  "met-disorders": "0 0 100 100",
  // Digestive System
  tube: "0 0 100 100",
  digestion: "0 0 100 100",
  stomach: "0 0 100 100",
  "small-intestine": "0 0 100 100",
  villi: "0 0 100 100",
  accessory: "0 0 100 100",
  "large-intestine": "0 0 100 100",
  portal: "0 0 100 100",
  "whole-end": "0 0 100 100",
  // Blood Anticoagulants
  cascade: "0 0 100 100",
  heparin: "0 0 100 100",
  warfarin: "0 0 100 100",
  edta: "0 0 100 100",
  citrate: "0 0 100 100",
  "lab-heparin": "0 0 100 100",
  oxalate: "0 0 100 100",
  // capillary types drill-down (child of an2:cardiovascular-system)
  continuous: "0 0 100 100",
  fenestrated: "0 0 100 100",
  sinusoidal: "0 0 100 100",
  // an2:cardiovascular-system labels
  artery: "0 0 100 100",
  vein: "0 0 100 100",
  microcirc: "0 0 100 100",
  lymphatics: "0 0 100 100",
   // pha:2 (pharmacology i) labels
  target: "0 0 100 100",
  receptor: "0 0 100 100",
  ionchannel: "0 0 100 100",
  enzyme: "0 0 100 100",
  transporter: "0 0 100 100",
  binding: "0 0 100 100",
  conform: "0 0 100 100",
  cascade: "0 0 100 100",
  clinical: "0 0 100 100",
  // pha:3 (GPCR signalling) labels — the ones not shared with pha:2
  ligand: "0 0 100 100",
  gprotein: "0 0 100 100",
  resting: "0 0 100 100",
  activation: "0 0 100 100",
  dissociation: "0 0 100 100",
  effector: "0 0 100 100",
  secondmessenger: "0 0 100 100",
  response: "0 0 100 100",
  termination: "0 0 100 100",
  // pha:4 (dose-response curve) labels
  curve: "0 0 100 100",
  shape: "0 0 100 100",
  ec50: "0 0 100 100",
  emax: "0 0 100 100",
  ceiling: "0 0 100 100",
  competitive: "0 0 100 100",
  noncompetitive: "0 0 100 100",
  selectivity: "0 0 100 100",
  ti: "0 0 100 100",
  tolerance: "0 0 100 100",
  // pha:5 (pharmacokinetics) labels
  absorption: "0 0 100 100",
  route: "0 0 100 100",
  membrane: "0 0 100 100",
  firstpass: "0 0 100 100",
  bioavail: "0 0 100 100",
  distribution: "0 0 100 100",
  metabolism: "0 0 100 100",
  excretion: "0 0 100 100",
  halflife: "0 0 100 100",
  // pha:6 (adrenergic) + pha:7 (cholinergic) labels
  synthesis: "0 0 100 100",
  storage: "0 0 100 100",
  release: "0 0 100 100",
  receptors: "0 0 100 100",
  alpha1: "0 0 100 100",
  alpha2: "0 0 100 100",
  beta1: "0 0 100 100",
  beta2: "0 0 100 100",
  reuptake: "0 0 100 100",
  nicotinic: "0 0 100 100",
  muscarinic: "0 0 100 100",
  m2: "0 0 100 100",
  m3: "0 0 100 100",
  ache: "0 0 100 100",
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
      <circle cx="62" cy="44" r="9" fill="#E4DFFF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.2" />
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
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Q78 62 50 84 Q22 62 20 30 Z" fill="#F5D0CC" stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="2" />
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Z" fill="#2D7BFF" opacity="0.9" />
      <path d="M20 30 Q22 52 50 84 Q78 62 80 30 Q70 44 50 44 Q30 44 20 30 Z" fill="#E53935" opacity="0.9" />
    </g>
  ),
  conduction: (active) => (
    <g>
      <path d="M20 30 Q22 12 36 12 Q50 8 50 26 Q50 8 64 12 Q78 12 80 30 Q78 62 50 84 Q22 62 20 30 Z" fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.5" />
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
      <circle cx="50" cy="50" r="28" fill="#D4C4FF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="20" fill="url(#atlas-grad-nucleus)" />
      <circle cx="42" cy="44" r="6" fill="#5B21B6" opacity="0.55" />
      <circle cx="56" cy="53" r="5" fill="#5B21B6" opacity="0.5" />
      <circle cx="49" cy="59" r="4" fill="#5B21B6" opacity="0.45" />
      <circle cx="53" cy="42" r="3" fill="#D4C4FF" opacity="0.9" />
    </g>
  ),
  cmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#EDE6DC" stroke={active ? "#FFC93C" : "#F5B93F"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="16" fill="url(#atlas-grad-trunk)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  clp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#EDE6DC" stroke={active ? "#2D7BFF" : "#2F6FED"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="16" fill="url(#atlas-grad-lymphoid)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  b: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  t: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  nk: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  "myeloid-leaf": (active) => (
    <g>
      <ellipse cx="30" cy="38" rx="16" ry="10" fill="#E53935" stroke="#8C1C12" strokeWidth="1" />
      <ellipse cx="30" cy="38" rx="8" ry="5" fill="#F5C7C0" opacity="0.75" />
      <circle cx="66" cy="38" r="12" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1" />
      <path d="M60 34 Q66 31 70 36 Q72 40 68 43 Q62 45 60 40 Q58 37 60 34 Z" fill="#8B5CF6" opacity="0.78" />
      <ellipse cx="50" cy="68" rx="8" ry="5.5" fill="#F5B93F" stroke="#8B6410" strokeWidth="0.8" />
    </g>
  ),
  gmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#EDE6DC" stroke={active ? "#FFC93C" : "#F5B93F"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="15" fill="url(#atlas-grad-trunk)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  mep: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#EDE6DC" stroke={active ? "#E53935" : "#C0392B"} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="15" fill="url(#atlas-grad-erythroid)" opacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#000" opacity="0.18" />
      <circle cx="54" cy="53" r="3" fill="#000" opacity="0.15" />
    </g>
  ),
  gran: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
      <circle cx="49" cy="50" r="3" fill="#E4DFFF" opacity="0.6" />
    </g>
  ),
  mono: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#EDE6DC" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.6" />
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
      <circle cx="34" cy="50" r="16" fill="#E4DFFF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.6" />
      <circle cx="34" cy="50" r="8" fill={ATLAS_COLORS.nucleus} opacity="0.75" />
      <circle cx="68" cy="50" r="16" fill="#E4DFFF" stroke={ATLAS_COLORS.nucleus} strokeWidth="1.6" />
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
      <circle cx="34" cy="48" r="16" fill="#DDD4FF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
      <circle cx="66" cy="46" r="16" fill="#DDD4FF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
      <circle cx="50" cy="28" r="16" fill="#DDD4FF" stroke={active ? "#F5B93F" : "#B0A8D8"} strokeWidth={active ? 2 : 1.2} />
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
      <rect x="14" y="16" width="72" height="20" rx="4" fill="#B8CFFF" stroke="#2F6FED" strokeWidth="1.4" />
      <text x="50" y="30" textAnchor="middle" fontSize="8" fontWeight="800" fill="#123F9E">AIR</text>
      <rect x="14" y="38" width="72" height="6" rx="2" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} stroke="#5B21B6" strokeWidth="0.8" />
      <text x="50" y="58" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={active ? "#D89B14" : "#8B5CF6"}>membrane</text>
      <rect x="14" y="62" width="72" height="20" rx="4" fill="#F5B0B0" stroke="#C0392B" strokeWidth="1.4" />
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
      <circle cx="50" cy="50" r="24" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M40 42 Q48 38 54 44 Q60 42 62 50 Q60 58 52 58 Q44 60 40 52 Q36 46 40 42 Z" fill="#8B5CF6" opacity="0.78" />
    </g>
  ),
  inflammation: (active) => (
    <g>
      <path d="M12,54 Q50,44 88,54" fill="none" stroke="#E53935" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      {[30, 50, 70].map((x, i) => (
        <circle key={i} cx={x} cy={34 + (i % 2) * 6} r="5" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1" />
      ))}
      <text x="50" y="82" textAnchor="middle" fontSize="7.5" fill="var(--text-2)">red · warm · swollen</text>
    </g>
  ),
  apc: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M42 44 Q50 40 56 46 Q62 44 62 52 Q60 60 50 60 Q42 62 42 54 Q38 48 42 44 Z" fill="#8B5CF6" opacity="0.78" />
      <polygon points="42,30 48,30 45,24" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
      <polygon points="56,32 62,32 59,26" fill="#C0392B" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),
  bcell: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
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
      <circle cx="50" cy="50" r="22" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <path d="M42 44 Q50 40 56 46 Q62 44 62 52 Q60 60 50 60 Q42 62 42 54 Q38 48 42 44 Z" fill="#8B5CF6" opacity="0.78" />
      <text x="50" y="86" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-2)">T</text>
    </g>
  ),
  memory: (active) => (
    <g>
      <rect x="14" y="26" width="72" height="48" rx="10" fill="var(--bg-3)" stroke={active ? "#F5B93F" : ATLAS_COLORS.trunk} strokeWidth="1.6" strokeDasharray="5 4" />
      <circle cx="36" cy="50" r="9" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1" />
      <circle cx="64" cy="50" r="9" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1" />
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
      <circle cx="30" cy="38" r="6" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1.2" />
      <circle cx="50" cy="58" r="6" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1.2" />
      <path d="M50,44 L50,58" stroke="#5B21B6" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />
    </g>
  ),
  phagocytosis: (active) => (
    <g>
      <circle cx="42" cy="50" r="18" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1.4" />
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
      <circle cx="46" cy="50" r="22" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
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
      <rect x="30" y="30" width="40" height="40" rx="6" fill="#F5D0CC" stroke="#B63B2E" strokeWidth="1.6" strokeDasharray="4 3" />
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
      <ellipse cx="50" cy="50" rx="34" ry="16" fill="#E8D0C4" stroke={active ? "#F5B93F" : "#B8A89E"} strokeWidth="1.8" />
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
      <circle cx="30" cy="50" r="16" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1.4" />
      <path d="M22 44 Q28 40 34 44 Q38 48 34 54 Q28 58 22 54 Q18 48 22 44 Z" fill="#8B5CF6" opacity="0.78" />
      <circle cx="70" cy="50" r="20" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.6" />
      <path d="M62 46 Q68 42 74 46 Q78 52 72 56 Q64 58 62 52 Q60 48 62 46 Z" fill="#8B5CF6" opacity="0.78" />
      <text x="50" y="86" textAnchor="middle" fontSize="8" fill="var(--text-2)">acute → chronic</text>
    </g>
  ),
  lymphocytes: (active) => (
    <g>
      {/* Three lymphocytes clustered — small round cells with large
         dark nuclei, the adaptive immune cells that accumulate in
         chronic inflammation. */}
      <circle cx="36" cy="42" r="14" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="36" cy="42" r="9" fill="#5B21B6" opacity="0.85" />
      <circle cx="66" cy="44" r="14" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="66" cy="44" r="9" fill="#5B21B6" opacity="0.85" />
      <circle cx="50" cy="70" r="14" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.4" />
      <circle cx="50" cy="70" r="9" fill="#5B21B6" opacity="0.85" />
    </g>
  ),
  fibrosis: (active) => (
    <g>
      {/* A tissue patch with dense parallel collagen strands running
         through it — the scarring that replaces working tissue in
         chronic inflammation. */}
      <ellipse cx="50" cy="50" rx="34" ry="26" fill="#E8D0C4" stroke={active ? "#F5B93F" : "#B8A89E"} strokeWidth="1.6" />
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
      <ellipse cx="50" cy="50" rx="34" ry="26" fill="#F5D0CC" stroke="#B63B2E" strokeWidth="1.6" opacity="0.7" />
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
          <circle cx={px} cy={py} r="8" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1.2" />
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
      <circle cx="50" cy="50" r="28" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
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
      <circle cx="50" cy="50" r="26" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
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
      <circle cx="40" cy="50" r="28" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
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
      <circle cx="50" cy="50" r="26" fill="#E4DFFF" stroke={active ? "#A78BFA" : "#8B5CF6"} strokeWidth="1.8" />
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
      <path d="M22,30 Q50,30 78,26 L70,74 Q50,70 22,74 Z" fill="#E8D0C4" stroke="#B63B2E" strokeWidth="1.6" />
      <text x="50" y="56" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#B63B2E">infarct</text>
    </g>
  ),
  "infarct-types": (active) => (
    <g>
      {/* White infarct (left) and red infarct (right), side by side. */}
      <path d="M14,30 L14,72" stroke="#E53935" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <path d="M14,36 Q32,36 44,32 L40,68 Q30,66 14,66 Z" fill="#E8D0C4" stroke="#B63B2E" strokeWidth="1.4" />
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
      <circle cx="40" cy="40" r="16" fill="#EDE6DC" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
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
      <circle cx="28" cy="30" r="12" fill="#EDE6DC" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="28" cy="30" r="5" fill="url(#atlas-grad-nucleus)" />
      <circle cx="72" cy="30" r="7" fill="#EDE6DC" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="72" cy="30" r="3" fill="url(#atlas-grad-nucleus)" />
      <circle cx="28" cy="68" r="11" fill="#EDE6DC" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="24" cy="68" r="4" fill="url(#atlas-grad-nucleus)" />
      <circle cx="32" cy="68" r="4" fill="url(#atlas-grad-nucleus)" />
      <rect x="60" y="58" width="24" height="18" rx="4" fill="#F0F4FF" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="1.6" />
      <circle cx="72" cy="67" r="4" fill="url(#atlas-grad-nucleus)" />
    </g>
  ),
  reversible: (active) => (
    <g>
      {/* Cell with swelling and blebs but membrane intact. */}
      <circle cx="50" cy="50" r="24" fill="#F5D0CC" stroke={active ? "#F5B93F" : "#E53935"} strokeWidth="1.6" />
      {[[-1, -0.4], [0.9, -0.5], [-0.7, 0.7], [0.75, 0.7], [0.1, -1.1]].map(([dx, dy], i) => (
        <circle key={i} cx={50 + dx * 24} cy={50 + dy * 24} r="5" fill="#F5D0CC" stroke="#E53935" strokeWidth="1" />
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
        <circle key={i} cx={50 + dx} cy={50 + dy} r="3.5" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="0.8" />
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
        fill="#D4C4FF" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="2"
      />
      <circle cx="46" cy="50" r="7" fill="#5B21B6" />
      {[[78, 40], [76, 60], [22, 62]].map(([ax, ay], i) => (
        <g key={i}>
          <circle cx={ax} cy={ay} r="6" fill="#D4C4FF" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="1.2" />
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
      <circle cx="50" cy="50" r="26" fill="#B8CFFF" stroke={active ? "#F5B93F" : "#2F6FED"} strokeWidth="2" />
      <circle cx="50" cy="50" r="11" fill="url(#atlas-grad-nucleus)" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#2F6FED"}>G1</text>
    </g>
  ),
  s: (active) => (
    <g>
      {/* S phase — DNA synthesis. A cell with a chromosome visible
         inside it, and a "copy" arrow. */}
      <circle cx="50" cy="50" r="26" fill="#DDD0FF" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="2" />
      {/* A chromosome inside, drawn as a small X */}
      <path d="M45,42 L55,58 M55,42 L45,58" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>S</text>
    </g>
  ),
  g2: (active) => (
    <g>
      {/* G2 phase — the check phase. A cell with two chromosomes ready
         to divide. */}
      <circle cx="50" cy="50" r="26" fill="#F5B0B0" stroke={active ? "#F5B93F" : "#E53935"} strokeWidth="2" />
      <path d="M38,42 L46,58 M46,42 L38,58" stroke="#8B5CF6" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M54,42 L62,58 M62,42 L54,58" stroke="#8B5CF6" strokeWidth="2.6" strokeLinecap="round" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#E53935"}>G2</text>
    </g>
  ),
  m: (active) => (
    <g>
      {/* M phase — mitosis. Two daughter cells separating, with a
         spindle line between them. */}
      <circle cx="30" cy="50" r="16" fill="#FFE38A" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.8" />
      <circle cx="30" cy="50" r="6" fill="url(#atlas-grad-nucleus)" />
      <circle cx="70" cy="50" r="16" fill="#FFE38A" stroke={active ? "#F5B93F" : "#D89B14"} strokeWidth="1.8" />
      <circle cx="70" cy="50" r="6" fill="url(#atlas-grad-nucleus)" />
      <path d="M46,50 L54,50" stroke="#D89B14" strokeWidth="1.4" strokeDasharray="3 2" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#D89B14"}>M</text>
    </g>
  ),
  g0: (active) => (
    <g>
      {/* G0 — quiescent. A single cell sitting still, with a "z" to
         suggest dormancy. */}
      <circle cx="50" cy="50" r="22" fill="#C7D0DC" stroke={active ? "#F5B93F" : "#64748B"} strokeWidth="2" />
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
        <circle key={i} cx={px} cy={py} r="9" fill="#F5B0B0" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="1.6" />
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
        <circle key={i} cx={px} cy={py} r="9" fill="#F5B0B0" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="1.4" />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#C0392B">no stopping</text>
    </g>
  ),
  invasion: (active) => (
    <g>
      {/* Invasion — a cluster of cells breaking through a basement
         membrane line and moving down-right. */}
      <path d="M14,38 L86,38" stroke={active ? "#F5B93F" : "#B63B2E"} strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="30" cy="54" r="7" fill="#F5B0B0" stroke="#C0392B" strokeWidth="1.4" />
      <circle cx="50" cy="58" r="7" fill="#F5B0B0" stroke="#C0392B" strokeWidth="1.4" />
      <circle cx="70" cy="62" r="7" fill="#F5B0B0" stroke="#C0392B" strokeWidth="1.4" />
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

  // ---- Renal Physiology ----
  // Swatches for the renal diagram. Each mirrors the structure or
  // concept its tile describes — the whole kidney, a nephron, a
  // glomerulus, each tubule segment, hormonal control, and GFR.
  kidney: (active) => (
    <g>
      {/* A bean-shaped kidney. */}
      <path
        d="M28,20 Q14,38 22,62 Q32,84 54,86 Q74,86 80,72 Q84,60 74,50 Q64,40 68,30 Q70,20 58,16 Q42,14 28,20 Z"
        fill="#F5D0CC"
        stroke={active ? "#F5B93F" : "#B63B2E"}
        strokeWidth="2"
      />
      {/* Renal artery + vein at the hilum */}
      <line x1="18" y1="52" x2="34" y2="52" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
      <line x1="34" y1="62" x2="20" y2="62" stroke="#2D7BFF" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  nephron: (active) => (
    <g>
      {/* A stylised nephron — small glomerulus + short coiled tubule. */}
      <circle cx="32" cy="24" r="8" fill="#EDD4E2" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="1.4" />
      <circle cx="32" cy="24" r="5" fill="#E53935" opacity="0.75" />
      <path
        d="M36,28 Q44,36 36,44 Q28,52 38,60 Q48,68 42,78"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M42,78 L42,92"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  ),
  glomerulus: (active) => (
    <g>
      {/* A tangled capillary tuft inside a cup-shaped capsule. */}
      <path
        d="M24,22 Q44,12 68,26 Q82,40 68,60 Q44,74 24,60"
        fill="#EDD4E2"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M30,42 Q44,22 58,42 Q72,56 54,62 Q40,68 32,54 Q28,48 30,42 Z"
        fill="#E53935"
        stroke="#8C1C12"
        strokeWidth="1.4"
        opacity="0.75"
      />
      {/* Afferent + efferent arterioles */}
      <line x1="6" y1="34" x2="28" y2="34" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="52" x2="8" y2="52" stroke="#8C1C12" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  pct: (active) => (
    <g>
      {/* A squiggly proximal tubule segment. */}
      <path
        d="M14,30 Q28,20 34,34 Q40,48 30,58 Q20,68 34,76 Q48,82 60,74 Q72,62 84,68"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <text x="50" y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>PCT</text>
    </g>
  ),
  loop: (active) => (
    <g>
      {/* A hairpin — descending limb down, hairpin turn, ascending
         limb up. */}
      <path
        d="M30,14 L30,72 Q30,86 50,86 Q70,86 70,72 L70,14"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  dct: (active) => (
    <g>
      {/* Another small coil, DCT. */}
      <path
        d="M20,60 Q14,44 30,38 Q46,34 54,48 Q60,60 50,70 Q40,80 28,74"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <text x="50" y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "#8B5CF6"}>DCT</text>
    </g>
  ),
  collecting: (active) => (
    <g>
      {/* A straight collecting duct with several nephrons feeding
         into it at the top. */}
      <line x1="50" y1="14" x2="50" y2="86" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="6" strokeLinecap="round" />
      <line x1="20" y1="14" x2="50" y2="34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="80" y1="14" x2="50" y2="34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="35" y1="20" x2="50" y2="34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="65" y1="20" x2="50" y2="34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  hormones: (active) => (
    <g>
      {/* Three small pills arranged in a row — ADH, ALD, RAAS. */}
      <rect x="10" y="34" width="24" height="14" rx="7" fill="#2F6FED" stroke="#123F9E" strokeWidth="1.2" />
      <text x="22" y="44" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff">ADH</text>
      <rect x="38" y="34" width="24" height="14" rx="7" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.2" />
      <text x="50" y="44" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff">ALD</text>
      <rect x="66" y="34" width="24" height="14" rx="7" fill="#C0392B" stroke="#8C1C12" strokeWidth="1.2" />
      <text x="78" y="44" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff">RAA</text>
      <text x="50" y="66" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--text-2)">hormones</text>
    </g>
  ),
  gfr: (active) => (
    <g>
      {/* A flow meter — a dial with 125 on it. */}
      <circle cx="50" cy="42" r="26" fill="var(--bg-3)" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="2" />
      <path d="M50,42 L64,26" stroke={active ? "#F5B93F" : "#8B5CF6"} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="50" cy="42" r="3" fill={active ? "#F5B93F" : "#5B21B6"} />
      <text x="50" y="82" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={active ? "#F5B93F" : "var(--text-2)"}>125 mL/min</text>
    </g>
  ),

  // ---- Acid-Base Balance ----
  // Swatches for the acid-base diagram. Each mirrors the concept or
  // structure its tile describes — the pH scale, buffers, the
  // bicarbonate equation, Henderson-Hasselbalch, kidney H⁺ and HCO₃⁻
  // handling, and the two families of acid-base disorders.
  ph: (active) => (
    <g>
      {/* The pH strip — a gradient bar with a marker at 7.4. */}
      <rect x="14" y="40" width="72" height="14" rx="7" fill="url(#atlas-pH-gradient)" stroke={active ? "#F5B93F" : "#5B21B6"} strokeWidth="1.4" />
      <text x="14" y="70" fontSize="7" fill="var(--text-2)">acidic</text>
      <text x="86" y="70" textAnchor="end" fontSize="7" fill="var(--text-2)">alkaline</text>
      <line x1="50" y1="36" x2="50" y2="58" stroke={active ? "#F5B93F" : ATLAS_COLORS.trunk} strokeWidth="2.4" strokeLinecap="round" />
      <text x="50" y="32" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : ATLAS_COLORS.trunk}>7.4</text>
    </g>
  ),
  buffers: (active) => (
    <g>
      {/* Three small labelled pills representing the three main
         buffers: protein, phosphate, bicarbonate. */}
      <rect x="10" y="26" width="22" height="14" rx="7" fill="#2F6FED" stroke="#123F9E" strokeWidth="1.2" />
      <text x="21" y="36" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#fff">H+</text>
      <rect x="38" y="26" width="22" height="14" rx="7" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.2" />
      <text x="49" y="36" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#fff">P</text>
      <rect x="66" y="26" width="24" height="14" rx="7" fill="#2D7BFF" stroke="#123F9E" strokeWidth="1.2" />
      <text x="78" y="36" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#fff">HCO₃</text>
      <text x="50" y="60" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? "#F5B93F" : "var(--text-2)"}>mop up acid</text>
      <text x="50" y="74" textAnchor="middle" fontSize="7" fill="var(--text-2)">in seconds</text>
    </g>
  ),
  bicarbonate: (active) => (
    <g>
      {/* The bicarbonate equation, miniaturised. */}
      <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "var(--text)"}>CO₂ + H₂O</text>
      <text x="50" y="44" textAnchor="middle" fontSize="7" fill="var(--text-2)">⇌ H₂CO₃ ⇌</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fontWeight="800" fill={active ? "#F5B93F" : "var(--text)"}>H⁺ + HCO₃⁻</text>
      <text x="50" y="80" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">main blood buffer</text>
    </g>
  ),
  hh: (active) => (
    <g>
      {/* Henderson-Hasselbalch equation, boxed. */}
      <rect x="10" y="26" width="80" height="48" rx="8" fill={active ? "rgba(245,185,63,.18)" : "var(--bg-3)"} stroke={active ? "#F5B93F" : ATLAS_COLORS.trunk} strokeWidth="1.6" />
      <text x="50" y="46" textAnchor="middle" fontSize="7" fontWeight="800" fill="var(--text)">pH = 6.1 +</text>
      <text x="50" y="60" textAnchor="middle" fontSize="7" fontWeight="800" fill="var(--text)">log([HCO₃]/CO₂)</text>
      <text x="50" y="82" textAnchor="middle" fontSize="6.5" fill="var(--text-2)">reads the blood gas</text>
    </g>
  ),
  "kidney-h": (active) => (
    <g>
      {/* A tubule segment with H+ ions being secreted into it. */}
      <path d="M14,50 Q35,44 55,50 Q75,56 86,50" fill="none" stroke="#8B5CF6" strokeWidth="9" strokeLinecap="round" />
      {[28, 50, 72].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="30" x2={x} y2="44" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
          <polygon points={`${x},48 ${x - 3},42 ${x + 3},42`} fill="#C0392B" />
        </g>
      ))}
      <text x="50" y="76" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? "#F5B93F" : "#C0392B"}>H⁺ secreted</text>
    </g>
  ),
  "kidney-hco3": (active) => (
    <g>
      {/* A tubule with bicarbonate being reabsorbed. */}
      <path d="M14,50 Q35,44 55,50 Q75,56 86,50" fill="none" stroke="#8B5CF6" strokeWidth="9" strokeLinecap="round" />
      {[28, 50, 72].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="70" x2={x} y2="56" stroke="#2F6FED" strokeWidth="2" strokeLinecap="round" />
          <polygon points={`${x},52 ${x - 3},58 ${x + 3},58`} fill="#2F6FED" />
        </g>
      ))}
      <text x="50" y="86" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? "#F5B93F" : "#2F6FED"}>HCO₃⁻ reclaimed</text>
    </g>
  ),
  "resp-disorders": (active) => (
    <g>
      {/* Two-column comparison: respiratory acidosis and alkalosis. */}
      <rect x="6" y="20" width="42" height="62" rx="8" fill={active ? "rgba(192,57,43,.22)" : "rgba(192,57,43,.1)"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="27" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#8C1C12">ACIDOSIS</text>
      <text x="27" y="52" textAnchor="middle" fontSize="6" fill="var(--text-2)">↑ CO₂</text>
      <text x="27" y="66" textAnchor="middle" fontSize="5.5" fill="var(--text-2)">hypoventilation</text>
      <rect x="52" y="20" width="42" height="62" rx="8" fill={active ? "rgba(47,111,237,.22)" : "rgba(47,111,237,.1)"} stroke="#2F6FED" strokeWidth="1.6" />
      <text x="73" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#2F6FED">ALKALOSIS</text>
      <text x="73" y="52" textAnchor="middle" fontSize="6" fill="var(--text-2)">↓ CO₂</text>
      <text x="73" y="66" textAnchor="middle" fontSize="5.5" fill="var(--text-2)">hyperventilation</text>
    </g>
  ),
  "met-disorders": (active) => (
    <g>
      {/* Two-column comparison: metabolic acidosis and alkalosis. */}
      <rect x="6" y="20" width="42" height="62" rx="8" fill={active ? "rgba(192,57,43,.22)" : "rgba(192,57,43,.1)"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="27" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#8C1C12">ACIDOSIS</text>
      <text x="27" y="52" textAnchor="middle" fontSize="6" fill="var(--text-2)">↓ HCO₃⁻</text>
      <text x="27" y="66" textAnchor="middle" fontSize="5.5" fill="var(--text-2)">DKA · lactic</text>
      <rect x="52" y="20" width="42" height="62" rx="8" fill={active ? "rgba(47,111,237,.22)" : "rgba(47,111,237,.1)"} stroke="#2F6FED" strokeWidth="1.6" />
      <text x="73" y="36" textAnchor="middle" fontSize="7" fontWeight="800" fill="#2F6FED">ALKALOSIS</text>
      <text x="73" y="52" textAnchor="middle" fontSize="6" fill="var(--text-2)">↑ HCO₃⁻</text>
      <text x="73" y="66" textAnchor="middle" fontSize="5.5" fill="var(--text-2)">vomiting · diuretics</text>
    </g>
  ),

  // ---- Digestive System ----
  // Swatches for the digestive-system diagram. Each mirrors the
  // structure or concept its tile describes — the whole tube, the
  // two kinds of digestion, the stomach, the small and large
  // intestines, villi, the accessory organs, and the portal
  // circulation.
  tube: (active) => (
    <g>
      {/* A simplified vertical tube with named segments as small
         marks along the way. */}
      <path d="M50,12 L50,88" stroke={active ? "#F5B93F" : "#C0392B"} strokeWidth="8" strokeLinecap="round" opacity="0.75" />
      <circle cx="50" cy="20" r="5" fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.2" />
      <ellipse cx="44" cy="42" rx="9" ry="7" fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.2" />
      <path d="M50,58 Q46,72 50,82" fill="none" stroke="#F5D0CC" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  digestion: (active) => (
    <g>
      {/* Two small panels: mechanical (piece breaking apart) and
         chemical (molecule splitting into two). */}
      <rect x="6" y="22" width="40" height="56" rx="6" fill={active ? "rgba(47,111,237,.2)" : "rgba(47,111,237,.08)"} stroke="#2F6FED" strokeWidth="1.4" />
      <path d="M20,42 L30,42 M30,50 L36,50 M22,58 L32,58" stroke="#2F6FED" strokeWidth="2" strokeLinecap="round" />
      <text x="26" y="72" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#2F6FED">mech</text>
      <rect x="54" y="22" width="40" height="56" rx="6" fill={active ? "rgba(192,57,43,.2)" : "rgba(192,57,43,.08)"} stroke="#C0392B" strokeWidth="1.4" />
      <path d="M60,50 L70,50 M78,50 L88,50" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="65" cy="50" r="3" fill="#C0392B" />
      <circle cx="83" cy="50" r="3" fill="#C0392B" />
      <text x="74" y="72" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#C0392B">chem</text>
    </g>
  ),
  stomach: (active) => (
    <g>
      {/* A J-shaped stomach. */}
      <path
        d="M40,20 Q30,22 24,40 Q18,58 34,72 Q52,82 68,72 Q82,60 74,44 Q68,30 58,26 Q48,22 40,20 Z"
        fill={active ? "rgba(245,185,63,.25)" : "#F5D0CC"}
        stroke={active ? "#F5B93F" : "#C0392B"}
        strokeWidth="2"
      />
      {/* A few churn arrows */}
      <path d="M40,48 Q50,42 60,48 M40,58 Q50,64 60,58" fill="none" stroke="#C0392B" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
    </g>
  ),
  "small-intestine": (active) => (
    <g>
      {/* A coiled small intestine, drawn as a long wavy line. */}
      <path
        d="M14,26 Q30,20 38,32 Q46,44 30,50 Q14,56 26,68 Q38,80 56,74 Q74,68 84,54"
        fill="none"
        stroke={active ? "#F5B93F" : "#8B5CF6"}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </g>
  ),
  villi: (active) => (
    <g>
      {/* Four finger-like villi standing on a base — the surface
         amplification. */}
      <path d="M14,80 L86,80" stroke="#B63B2E" strokeWidth="3" strokeLinecap="round" />
      {[24, 42, 60, 76].map((vx, i) => (
        <g key={i}>
          <path d={`M${vx},80 Q${vx - 4},56 ${vx},40 Q${vx + 4},56 ${vx},80 Z`} fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.4" />
          <path d={`M${vx},74 Q${vx - 2},58 ${vx},48 Q${vx + 2},58 ${vx},74`} fill="none" stroke="#E53935" strokeWidth="1" />
        </g>
      ))}
    </g>
  ),
  accessory: (active) => (
    <g>
      {/* Three labelled shapes: liver (red), gallbladder (green),
         pancreas (amber). */}
      <path d="M8,34 Q18,22 34,26 Q48,22 60,34 Q64,46 50,54 Q30,58 12,50 Q6,44 8,34 Z" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.4" />
      <ellipse cx="72" cy="52" rx="10" ry="6" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2" />
      <path d="M20,66 Q40,72 60,68 Q76,64 84,70" fill="none" stroke={active ? "#FFC93C" : "#F5B93F"} strokeWidth="7" strokeLinecap="round" />
      <path d="M20,66 Q40,72 60,68 Q76,64 84,70" fill="none" stroke="#8B6410" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  "large-intestine": (active) => (
    <g>
      {/* An arch — up right, across top, down left. */}
      <path
        d="M28,82 L28,52 Q28,24 50,24 Q72,24 72,52 L72,82"
        fill="none"
        stroke={active ? "#F5B93F" : "#C0392B"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  portal: (active) => (
    <g>
      {/* Gut → Liver → Heart, drawn as three small nodes with arrows. */}
      <circle cx="16" cy="50" r="8" fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.2" />
      <line x1="24" y1="50" x2="38" y2="50" stroke="#2F6FED" strokeWidth="2" />
      <polygon points="38,50 32,46 32,54" fill="#2F6FED" />
      <circle cx="50" cy="50" r="10" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.4" />
      <line x1="60" y1="50" x2="76" y2="50" stroke="#2F6FED" strokeWidth="2" />
      <polygon points="76,50 70,46 70,54" fill="#2F6FED" />
      <circle cx="84" cy="50" r="8" fill="#F5D0CC" stroke="#C0392B" strokeWidth="1.2" />
      <text x="50" y="88" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--text-2)">gut → liver → heart</text>
    </g>
  ),
  "whole-end": (active) => (
    <g>
      {/* A compact six-step timeline down the tile. */}
      {[
        { y: 14, label: "chew" },
        { y: 26, label: "acid" },
        { y: 38, label: "bile + enzymes" },
        { y: 50, label: "absorb" },
        { y: 62, label: "liver" },
        { y: 74, label: "colon" },
      ].map((s, i) => (
        <g key={i}>
          <circle cx="18" cy={s.y} r="4" fill={active ? "#F5B93F" : ATLAS_COLORS.trunk} />
          <text x="28" y={s.y + 3} fontSize="7" fontWeight="600" fill="var(--text-2)">{s.label}</text>
        </g>
      ))}
    </g>
  ),

  // ---- Blood Anticoagulants ----
  // Seven swatches for the hem:6 diagram. Each mirrors the structure
  // or concept its tile describes — the clotting cascade, the two
  // therapeutic drugs, and the four laboratory tubes.

  cascade: (active) => (
    <g>
      {/* Three columns of small factor boxes, converging: the visual
         shorthand for a cascade with intrinsic and extrinsic routes
         merging into one common pathway. */}
      {/* Intrinsic (left) */}
      <rect x="6" y="22" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      <rect x="6" y="40" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      <rect x="6" y="58" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      {/* Extrinsic (right) */}
      <rect x="72" y="22" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      <rect x="72" y="40" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      <rect x="72" y="58" width="22" height="10" rx="2" fill="#F8F4EE" stroke="#64748B" strokeWidth="1" />
      {/* Convergence on the common pathway */}
      <path d="M28,27 L44,50 M28,45 L44,50 M28,63 L44,50" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path d="M72,27 L56,50 M72,45 L56,50 M72,63 L56,50" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      {/* Common pathway node — highlighted when active */}
      <rect x="36" y="45" width="28" height="12" rx="3" fill={active ? ATLAS_COLORS.trunk : "#F5B0B0"} stroke="#8C1C12" strokeWidth="1" />
      <path d="M50,57 L50,72" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <polygon points="50,76 46,70 54,70" fill="#8C1C12" />
      <text x="50" y="90" textAnchor="middle" fontSize="7" fontWeight="700" fill="#8C1C12">FIBRIN</text>
    </g>
  ),
  heparin: (active) => (
    <g>
      {/* A syringe — heparin's defining form is that it must be given
         by injection. Amber outline when active. */}
      <rect x="18" y="40" width="46" height="14" rx="2" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="1.4" />
      <rect x="24" y="42" width="34" height="10" rx="1" fill={active ? ATLAS_COLORS.trunk : "#94A3B8"} opacity="0.5" />
      <line x1="64" y1="47" x2="80" y2="47" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="47" x2="18" y2="47" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="2.4" strokeLinecap="round" />
      {/* Plunger */}
      <line x1="18" y1="42" x2="18" y2="52" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="1.4" strokeLinecap="round" />
      <text x="50" y="80" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>IV / SC</text>
    </g>
  ),
  warfarin: (active) => (
    <g>
      {/* A tablet — warfarin's defining form is that it's taken orally. */}
      <circle cx="50" cy="46" r="22" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="1.6" />
      <line x1="34" y1="46" x2="66" y2="46" stroke={active ? ATLAS_COLORS.trunk : "#64748B"} strokeWidth="1.4" strokeLinecap="round" />
      <text x="50" y="42" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>vit K</text>
      <text x="50" y="54" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--text-2)">antagonist</text>
      <text x="50" y="86" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>oral</text>
    </g>
  ),
  edta: (active) => (
    <g>
      {/* A test tube with a purple cap — the signature visual of the
         purple-topped EDTA tube. */}
      <rect x="36" y="22" width="28" height="58" rx="4" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1.4" />
      <rect x="36" y="34" width="28" height="46" rx="4" fill="#DDD0FF" opacity="0.55" />
      <rect x="33" y="18" width="34" height="10" rx="2" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} stroke="#5B21B6" strokeWidth="1" />
      <text x="50" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#5B21B6"}>PURPLE</text>
    </g>
  ),
  citrate: (active) => (
    <g>
      {/* A test tube with a blue cap — the blue-topped citrate tube. */}
      <rect x="36" y="22" width="28" height="58" rx="4" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1.4" />
      <rect x="36" y="34" width="28" height="46" rx="4" fill="#B8CFFF" opacity="0.6" />
      <rect x="33" y="18" width="34" height="10" rx="2" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} stroke="#123F9E" strokeWidth="1" />
      <text x="50" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#123F9E"}>BLUE</text>
    </g>
  ),
  "lab-heparin": (active) => (
    <g>
      {/* A test tube with a green cap — the green-topped heparin tube. */}
      <rect x="36" y="22" width="28" height="58" rx="4" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1.4" />
      <rect x="36" y="34" width="28" height="46" rx="4" fill="#B8F0D0" opacity="0.6" />
      <rect x="33" y="18" width="34" height="10" rx="2" fill={active ? ATLAS_COLORS.trunk : "#16A34A"} stroke="#0F7A36" strokeWidth="1" />
      <text x="50" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#0F7A36"}>GREEN</text>
    </g>
  ),
  oxalate: (active) => (
    <g>
      {/* A test tube with a grey cap — the grey-topped oxalate tube. */}
      <rect x="36" y="22" width="28" height="58" rx="4" fill="#F4F2EE" stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1.4" />
      <rect x="36" y="34" width="28" height="46" rx="4" fill="#C7D0DC" opacity="0.55" />
      <rect x="33" y="18" width="34" height="10" rx="2" fill={active ? ATLAS_COLORS.trunk : "#64748B"} stroke="#334155" strokeWidth="1" />
      <text x="50" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#334155"}>GREY</text>
    </g>
  ),

  // ---- Capillary types drill-down ----
  // Three swatches mirroring the capillaryCrossSection helper inside
  // the an2:capillary-types diagram. Each is a cross-section of a
  // capillary wall: pale lumen inside, one red cell, a thin basement
  // membrane outside, and the endothelial ring drawn to match the
  // type — solid for continuous, dotted for fenestrated, broken for
  // sinusoidal. The ring is the only thing that changes between them,
  // which is the whole point of the diagram.
  continuous: (active) => (
    <g>
      {/* Basement membrane — thin outer ring */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="#B8A89E" strokeWidth="1.4" opacity="0.7" />
      {/* Endothelial cell ring — solid for continuous */}
      <circle cx="50" cy="50" r="30" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="4" />
      {/* Lumen — pale interior */}
      <circle cx="50" cy="50" r="26" fill="#F4F2EE" opacity="0.9" />
      {/* One red cell inside the lumen */}
      <ellipse cx="50" cy="50" rx="11" ry="7" fill="#E53935" stroke="#8C1C12" strokeWidth="0.7" />
    </g>
  ),
  fenestrated: (active) => (
    <g>
      {/* Basement membrane — thin outer ring */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="#B8A89E" strokeWidth="1.4" opacity="0.7" />
      {/* Endothelial cell ring — dashed for fenestrated */}
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="4"
        strokeDasharray="8 4"
      />
      {/* Lumen — pale interior */}
      <circle cx="50" cy="50" r="26" fill="#F4F2EE" opacity="0.9" />
      {/* One red cell inside the lumen */}
      <ellipse cx="50" cy="50" rx="11" ry="7" fill="#E53935" stroke="#8C1C12" strokeWidth="0.7" />
    </g>
  ),
  sinusoidal: (active) => (
    <g>
      {/* Basement membrane — thin outer ring */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="#B8A89E" strokeWidth="1.4" opacity="0.7" />
      {/* Endothelial cell ring — broken arcs with large gaps */}
      <path
        d="M29,29 A30,30 0 0 1 71,29"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M71,71 A30,30 0 0 1 29,71"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Lumen — pale interior */}
      <circle cx="50" cy="50" r="26" fill="#F4F2EE" opacity="0.9" />
      {/* One red cell inside the lumen */}
      <ellipse cx="50" cy="50" rx="11" ry="7" fill="#E53935" stroke="#8C1C12" strokeWidth="0.7" />
      {/* A whole cell outside — the defining feature of a sinusoidal
         capillary is that whole cells can pass through it */}
      <circle cx="86" cy="50" r="4" fill="#E4DFFF" stroke="#8B5CF6" strokeWidth="1" />
    </g>
  ),

  // ---- an2:cardiovascular-system labels ----
  // Four swatches for the label ids that were introduced by
  // an2:cardiovascular-system but never given swatches (the rule
  // book requires every new label id to ship with one). Each is
  // drawn to match the shape it points at inside that diagram, in
  // the same visual language as the primitives used there.

  // Arteries — a cross-section with a thick muscular wall. The
  // star feature is wall thickness: arteries have a lot more of it
  // than veins or capillaries, and that difference is the point.
  artery: (active) => (
    <g>
      {/* Outer wall — thick muscular ring, crimson */}
      <circle cx="50" cy="50" r="34" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="12" />
      {/* Endothelial lining — a thin darker line inside the wall */}
      <circle cx="50" cy="50" r="27" fill="none" stroke="#8C1C12" strokeWidth="1" opacity="0.5" />
      {/* Lumen — pale interior */}
      <circle cx="50" cy="50" r="25" fill="#F4F2EE" opacity="0.95" />
      {/* Two red cells inside the lumen, showing the vessel is a conduit */}
      <ellipse cx="44" cy="50" rx="7" ry="4.5" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
      <ellipse cx="60" cy="50" rx="7" ry="4.5" fill="#E53935" stroke="#8C1C12" strokeWidth="0.6" />
    </g>
  ),

  // Veins — same cross-section language but thin-walled, blue, with
  // a one-way valve glyph below. The valve is what defines a vein:
  // arteries don't need one, veins can't function without one.
  vein: (active) => (
    <g>
      {/* Outer wall — thin blue ring */}
      <circle cx="50" cy="42" r="26" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="5" />
      {/* Lumen — pale interior */}
      <circle cx="50" cy="42" r="23" fill="#F4F2EE" opacity="0.95" />
      {/* One red cell inside, plus one blue cell showing return flow */}
      <ellipse cx="42" cy="42" rx="6" ry="4" fill="#2D7BFF" stroke="#123F9E" strokeWidth="0.6" />
      <ellipse cx="58" cy="42" rx="6" ry="4" fill="#2D7BFF" stroke="#123F9E" strokeWidth="0.6" />
      {/* One-way valve — two leaflets meeting in a V, the visual
         signature of a vein. Below the cross-section, small. */}
      <line x1="36" y1="82" x2="50" y2="72" stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="82" x2="50" y2="72" stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),

  // Microcirculation — a capillary with two opposing forces drawn
  // explicitly. Push-out arrow at the arterial end (hydrostatic),
  // pull-in arrow at the venous end (osmotic). Matches the
  // step-7 Starling-forces inset in the parent diagram.
  microcirc: (active) => (
    <g>
      {/* Capillary tube — a single thin red stroke */}
      <line x1="14" y1="50" x2="86" y2="50" stroke="#E53935" strokeWidth="8" strokeLinecap="round" />
      <line x1="14" y1="50" x2="86" y2="50" stroke="#8C1C12" strokeWidth="1" strokeLinecap="round" opacity="0.4" transform="translate(0,-2)" />
      {/* Push-out arrow at the left (arterial) end */}
      <line x1="28" y1="50" x2="28" y2="30" stroke="#2F6FED" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="28,26 24,33 32,33" fill="#2F6FED" />
      {/* Pull-in arrow at the right (venous) end */}
      <line x1="72" y1="30" x2="72" y2="50" stroke="#8B5CF6" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="72,54 68,47 76,47" fill="#8B5CF6" />
    </g>
  ),

  // Lymphatic drainage — a dashed blue lymph vessel feeding into a
  // small lymph node. Matches the atlasVessel(dashed) + atlasLymphNode
  // pairing used inside the an2:cardiovascular-system diagram itself.
  lymphatics: (active) => (
    <g>
      {/* Lymph vessel — dashed blue, entering from the left */}
      <path d="M10,50 Q26,44 40,50" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="5" strokeDasharray="5 4" strokeLinecap="round" />
      {/* Lymph node — bean shape with internal follicles, matching the
         atlasLymphNode primitive's visual language */}
      <ellipse cx="60" cy="50" rx="22" ry="15" fill={active ? ATLAS_COLORS.trunk : ATLAS_COLORS.lymphoid} opacity="0.75" stroke="#123F9E" strokeWidth="1.2" />
      <ellipse cx="60" cy="50" rx="11" ry="7" fill="#0A0F1A" opacity="0.22" />
      {[[52, 45], [54, 50], [52, 55], [63, 44], [63, 56], [70, 47], [70, 53]].map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r="1.4" fill="#0A1F6B" opacity="0.55" />
      ))}
      {/* Efferent vessel — a short dash leaving on the right */}
      <path d="M82,50 Q88,50 92,50" fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="4" strokeDasharray="4 3" strokeLinecap="round" opacity="0.8" />
    </g>
  ),

  // ---- pha:2 (Pharmacology I) labels ----
  // Nine swatches mirroring the tiles and hero in the pha:2 diagram.
  // Each is drawn in the same visual language the student saw on the
  // canvas: receptors as seven-transmembrane proteins, channels as a
  // pore, enzymes as a Pac-Man shape, transporters as a hairpin, plus
  // a binding-mechanics tile, a conformational-change tile, a
  // cascade tile, and a clinical tile.

  // The whole picture — a drug meeting a target
  target: (active) => (
    <g>
      {/* Drug hexagon on the left */}
      <polygon points="26,44 30,38 36,38 40,44 36,50 30,50" fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"} stroke="#0A0F1A" strokeWidth="0.8" />
      {/* Arrow to target */}
      <path d="M42,44 L56,44" stroke={ATLAS_COLORS.trunk} strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
      <polygon points="60,44 54,41 54,47" fill={ATLAS_COLORS.trunk} />
      {/* Target circle */}
      <circle cx="72" cy="44" r="14" fill="var(--bg-3)" stroke="#5B21B6" strokeWidth="1.6" />
      <text x="72" y="48" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5B21B6">T</text>
    </g>
  ),

  // Receptors — the seven-transmembrane serpentine in a membrane band,
  // matching atlasReceptor's visual signature
  receptor: (active) => (
    <g>
      {/* Membrane band */}
      <rect x="12" y="38" width="76" height="24" fill="#F5E8E0" opacity="0.4" />
      <line x1="12" y1="38" x2="88" y2="38" stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      <line x1="12" y1="62" x2="88" y2="62" stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      {/* Serpentine */}
      <path
        d="M22,62 L22,38 Q26,32 30,38 L30,62 Q34,68 38,62 L38,38 Q42,32 46,38 L46,62 Q50,68 54,62 L54,38 Q58,32 62,38 L62,62 Q66,68 70,62 L70,38 Q74,32 78,38 L78,62"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"}
        strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {/* A small drug shape in the ligand-binding pocket */}
      <circle cx="50" cy="30" r="4" fill="#2F8F4E" stroke="#0A0F1A" strokeWidth="0.6" />
    </g>
  ),

  // Ion channel — a pore between two walls with an ion travelling
  ionchannel: (active) => (
    <g>
      {/* Two walls forming the channel */}
      <rect x="32" y="24" width="10" height="52" rx="3"
        fill={active ? ATLAS_COLORS.trunk : "#C0392B"} opacity="0.85" />
      <rect x="58" y="24" width="10" height="52" rx="3"
        fill={active ? ATLAS_COLORS.trunk : "#C0392B"} opacity="0.85" />
      {/* Pore label */}
      <text x="50" y="52" textAnchor="middle" fontSize="7"
        fontWeight="700" fill="var(--text-3)">pore</text>
      {/* Two ions travelling through */}
      <circle cx="50" cy="32" r="4" fill="#2F6FED" opacity="0.9" />
      <circle cx="50" cy="46" r="4" fill="#2F6FED" opacity="0.75" />
      {/* A blocker drug plugging the top of the pore (active state) */}
      {active && (
        <circle cx="50" cy="22" r="5" fill="#C0392B" stroke="#0A0F1A" strokeWidth="0.6" />
      )}
    </g>
  ),

  // Enzyme — a Pac-Man shape with a substrate slot
  enzyme: (active) => (
    <g>
      <path
        d="M50,50 m-24,0 a24,24 0 1,0 48,0 a24,24 0 1,0 -48,0 Z M48,48 L66,38 L66,58 Z"
        fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} opacity="0.85"
        stroke="#8B6410" strokeWidth="1" />
      {/* Substrate about to enter the active site */}
      <circle cx="74" cy="48" r="5" fill="#C0392B"
        stroke="#0A0F1A" strokeWidth="0.6" />
    </g>
  ),

  // Transporter — a hairpin flipping a circle from outside to inside
  transporter: (active) => (
    <g>
      <path d="M34,22 L34,78 L66,78 L66,38" fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Ion on the outside (above), then inside (below) */}
      <circle cx="34" cy="16" r="5" fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} stroke="#0A0F1A" strokeWidth="0.6" />
      <circle cx="66" cy="60" r="5" fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} stroke="#0A0F1A" strokeWidth="0.6" />
    </g>
  ),

  // Binding — a panel listing the four weak-bond types
  binding: (active) => (
    <g>
      <rect x="14" y="18" width="72" height="64" rx="10"
        fill={active ? "rgba(245,185,63,.18)" : "rgba(245,185,63,.08)"}
        stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="2" />
      <text x="50" y="34" textAnchor="middle" fontSize="9" fontWeight="800"
        fill={active ? ATLAS_COLORS.trunk : "#B8860B"} letterSpacing="0.04em">BINDING</text>
      {["ionic", "hydrogen", "hydrophobic", "van der Waals"].map((m, i) => (
        <text key={i} x="50" y={48 + i * 10} textAnchor="middle" fontSize="7"
          fontWeight="600" fill="var(--text)">{m}</text>
      ))}
    </g>
  ),

  // Conformational change — a receptor shown in two states with arrows
  conform: (active) => (
    <g>
      {/* Inactive receptor (left) */}
      <path d="M14,30 Q18,22 24,30 L24,70 Q18,78 14,70 Z"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="3" strokeLinejoin="round" />
      {/* Arrow */}
      <path d="M30,50 L44,50" stroke={ATLAS_COLORS.trunk}
        strokeWidth="2" strokeLinecap="round" />
      <polygon points="48,50 42,47 42,53" fill={ATLAS_COLORS.trunk} />
      {/* Active receptor (right) — wider, opened shape */}
      <path d="M56,20 Q68,28 70,50 Q68,72 56,80"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        strokeWidth="3" strokeLinecap="round" />
      <path d="M56,20 Q46,28 44,50 Q46,72 56,80"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        strokeWidth="3" strokeLinecap="round" />
      {/* Drug at the active state (green dot) */}
      <circle cx="56" cy="50" r="4" fill="#2F8F4E" stroke="#0A0F1A" strokeWidth="0.6" />
    </g>
  ),

  // Cascade — three stacked nodes with arrows, matching the diagram's
  // step-9 G → cAMP → response chain
  cascade: (active) => (
    <g>
      {/* G-protein node */}
      <circle cx="50" cy="22" r="9" fill="#2F8F4E" opacity="0.85" stroke="#0A0F1A" strokeWidth="0.6" />
      <text x="50" y="25" textAnchor="middle" fontSize="7" fontWeight="800" fill="#0A0F1A">G</text>
      <path d="M50,32 L50,40" stroke="#2F8F4E" strokeWidth="2" strokeLinecap="round" />
      <polygon points="50,44 46,38 54,38" fill="#2F8F4E" />
      {/* Second messenger */}
      <circle cx="50" cy="54" r="12" fill="var(--bg-3)" stroke="#8B5CF6" strokeWidth="1.6" />
      <text x="50" y="58" textAnchor="middle" fontSize="7" fontWeight="800" fill="#8B5CF6">cAMP</text>
      <path d="M50,66 L50,74" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <polygon points="50,78 46,72 54,72" fill="#8B5CF6" />
      {/* Response */}
      <rect x="28" y="80" width="44" height="14" rx="5"
        fill="var(--bg-2)" stroke="#8B5CF6" strokeWidth="1.4" />
      <text x="50" y="90" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="#8B5CF6">response</text>
    </g>
  ),

  // Clinical — a small stack of three worked-example cards
  clinical: (active) => (
    <g>
      <rect x="14" y="18" width="72" height="16" rx="4"
        fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"}
        stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="29" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text)">beta-blocker</text>
      <rect x="14" y="40" width="72" height="16" rx="4"
        fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"}
        stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="51" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text)">SGLT2 inhibitor</text>
      <rect x="14" y="62" width="72" height="16" rx="4"
        fill={active ? "rgba(245,185,63,.25)" : "rgba(245,185,63,.12)"}
        stroke={active ? ATLAS_COLORS.trunk : "#D89B14"} strokeWidth="1.2" />
      <text x="50" y="73" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text)">digoxin</text>
    </g>
  ),

  // ---- pha:3 (GPCR signalling) labels ----
  // Ten swatches mirroring the components of the GPCR signalling
  // cycle diagram. Each is drawn in the same visual language the
  // student sees on the canvas: the receptor as a serpentine in a
  // membrane, the G-protein as alpha + beta/gamma subunits, the
  // second messenger as a coloured box, and so on.

  // The receptor - seven-transmembrane serpentine in a membrane band
  receptor: (active) => (
    <g>
      <rect x="12" y="38" width="76" height="24" fill="#F5E8E0" opacity="0.4" />
      <line x1="12" y1="38" x2="88" y2="38" stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      <line x1="12" y1="62" x2="88" y2="62" stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      <path
        d="M22,62 L22,38 Q26,32 30,38 L30,62 Q34,68 38,62 L38,38 Q42,32 46,38 L46,62 Q50,68 54,62 L54,38 Q58,32 62,38 L62,62 Q66,68 70,62 L70,38 Q74,32 78,38 L78,62"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"}
        strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="50" cy="30" r="4" fill="#2F8F4E" stroke="#0A0F1A" strokeWidth="0.6" />
    </g>
  ),

  // The ligand - a small hexagonal molecule approaching the pocket
  ligand: (active) => (
    <g>
      <polygon points="42,44 46,38 54,38 58,44 54,50 46,50"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <path d="M62,44 L74,44" stroke={ATLAS_COLORS.trunk}
        strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
      <polygon points="78,44 72,41 72,47" fill={ATLAS_COLORS.trunk} />
    </g>
  ),

  // The G-protein - alpha and beta/gamma subunits beneath a receptor stub
  gprotein: (active) => (
    <g>
      <ellipse cx="36" cy="38" rx="14" ry="10"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="36" y="42" textAnchor="middle" fontSize="9"
        fontWeight="800" fill="#0A0F1A">a</text>
      <text x="36" y="56" textAnchor="middle" fontSize="7"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}>GDP</text>
      <ellipse cx="66" cy="38" rx="15" ry="10"
        fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="66" y="42" textAnchor="middle" fontSize="9"
        fontWeight="800" fill="#fff">bg</text>
    </g>
  ),

  // Resting state - intact G-protein with GDP still in place
  resting: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="2" strokeDasharray="5 4" />
      <ellipse cx="42" cy="48" rx="12" ry="8"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke="#0A0F1A" strokeWidth="0.8" opacity="0.9" />
      <text x="42" y="51" textAnchor="middle" fontSize="8"
        fontWeight="800" fill="#0A0F1A">a</text>
      <ellipse cx="62" cy="48" rx="10" ry="8"
        fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        stroke="#0A0F1A" strokeWidth="0.8" opacity="0.9" />
      <text x="50" y="76" textAnchor="middle" fontSize="8"
        fontWeight="700" fill="var(--text-2)">GDP</text>
    </g>
  ),

  // Activation - GDP out, GTP in
  activation: (active) => (
    <g>
      <ellipse cx="34" cy="44" rx="16" ry="11"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="34" y="48" textAnchor="middle" fontSize="10"
        fontWeight="800" fill="#0A0F1A">a</text>
      <text x="34" y="62" textAnchor="middle" fontSize="8"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}>GTP</text>
      <path d="M56,44 L70,44" stroke={ATLAS_COLORS.trunk}
        strokeWidth="2" strokeLinecap="round" />
      <polygon points="76,44 68,40 68,48" fill={ATLAS_COLORS.trunk} />
    </g>
  ),

  // Dissociation - alpha splits from beta/gamma
  dissociation: (active) => (
    <g>
      <ellipse cx="28" cy="50" rx="14" ry="9"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="28" y="53" textAnchor="middle" fontSize="9"
        fontWeight="800" fill="#0A0F1A">a</text>
      <ellipse cx="74" cy="50" rx="14" ry="9"
        fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="74" y="53" textAnchor="middle" fontSize="9"
        fontWeight="800" fill="#fff">bg</text>
      <path d="M46,50 L56,50" stroke="var(--text-3)"
        strokeWidth="1.4" strokeDasharray="3 2" />
    </g>
  ),

  // Effector enzyme - a labelled enzyme box the alpha subunit activates
  effector: (active) => (
    <g>
      <rect x="16" y="34" width="68" height="34" rx="8"
        fill="var(--bg-3)"
        stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"}
        strokeWidth="2" />
      <text x="50" y="52" textAnchor="middle" fontSize="9"
        fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#5B21B6"}>EFFECTOR</text>
      <text x="50" y="64" textAnchor="middle" fontSize="7"
        fill="var(--text-2)">adenylate cyclase</text>
    </g>
  ),

  // Second messenger - a coloured rounded box with a nucleotide label
  secondmessenger: (active) => (
    <g>
      <rect x="16" y="30" width="68" height="40" rx="10"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"}
        strokeWidth="2" opacity="0.92" />
      <text x="50" y="52" textAnchor="middle" fontSize="14"
        fontWeight="800" fill="#fff">cAMP</text>
      <text x="50" y="66" textAnchor="middle" fontSize="7"
        fontWeight="700" fill="#fff" opacity="0.9">IP3 · DAG</text>
    </g>
  ),

  // Cellular response - the end-effect box
  response: (active) => (
    <g>
      <rect x="10" y="32" width="80" height="36" rx="10"
        fill="var(--bg-2)"
        stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"}
        strokeWidth="2" />
      <text x="50" y="50" textAnchor="middle" fontSize="9"
        fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#5B21B6"}>RESPONSE</text>
      <text x="50" y="62" textAnchor="middle" fontSize="7"
        fill="var(--text-2)">enzyme · channels · genes</text>
    </g>
  ),

  // Termination - GTP returning to GDP, with an arrow showing the reset
  termination: (active) => (
    <g>
      <ellipse cx="50" cy="44" rx="20" ry="13"
        fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        stroke="#0A0F1A" strokeWidth="0.8" />
      <text x="50" y="48" textAnchor="middle" fontSize="11"
        fontWeight="800" fill="#0A0F1A">a</text>
      <text x="50" y="70" textAnchor="middle" fontSize="8"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#5B21B6"}>GTP → GDP</text>
    </g>
  ),

  // ============================================================
  // pha:6 (Adrenergic Pharmacology) + pha:7 (Cholinergic) swatches
  // ============================================================
  // Every swatch below mirrors the shape the student sees on the
  // canvas for that label. The rule book requires each label id to
  // ship with its own swatch, and these follow the same visual
  // language as the corresponding panel or anatomy inside the
  // diagram itself - so recognising the swatch teaches the diagram.

  // Synthesis - the four-step noradrenaline pathway, drawn as a
  // labelled arrow chain. Matches the synthesis callout in pha:6.
  synthesis: (active) => (
    <g>
      <text x="50" y="16" textAnchor="middle" fontSize="7"
        fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>SYNTHESIS</text>
      {["tyr", "DOPA", "DA", "NA"].map((label, i) => (
        <g key={i}>
          <rect x={3 + i * 24} y={34} width="20" height="16" rx="4"
            fill={active ? "rgba(245,185,63,.25)" : "var(--bg-3)"}
            stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1" />
          <text x={13 + i * 24} y={45} textAnchor="middle" fontSize="6.5"
            fontWeight="700" fill="var(--text)">{label}</text>
          {i < 3 && (
            <path d={`M${23 + i * 24},42 L${27 + i * 24},42`}
              stroke={active ? ATLAS_COLORS.trunk : "#94A3B8"} strokeWidth="1.2" />
          )}
        </g>
      ))}
      <text x="50" y="68" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">4 enzymes in order</text>
      <text x="50" y="82" textAnchor="middle" fontSize="6"
        fontStyle="italic" fill="var(--text-3)">rate-limited at step 1</text>
    </g>
  ),

  // Storage - vesicles packed inside the presynaptic terminal.
  // Matches the storage callout in pha:6.
  storage: (active) => (
    <g>
      <path d="M18,22 L82,22 L82,72 L18,72 Z"
        fill="#F2EEFF" stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"} strokeWidth="1.6" />
      {[[34, 40], [50, 34], [66, 40], [42, 56], [58, 56]].map(([vx, vy], i) => (
        <circle key={i} cx={vx} cy={vy} r="6"
          fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} stroke="#8B6410" strokeWidth="0.8" />
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">vesicles in the terminal</text>
    </g>
  ),

  // Release - a vesicle fusing with the membrane, transmitter
  // spilling into the cleft. Matches pha:6's release callout.
  release: (active) => (
    <g>
      <line x1="14" y1="42" x2="86" y2="42"
        stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"} strokeWidth="3" strokeLinecap="round" />
      <path d="M40,42 Q40,30 50,30 Q60,30 60,42"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#F5B93F"} strokeWidth="2.4" strokeLinecap="round" />
      {[[30, 62], [42, 68], [56, 64], [70, 70], [48, 78]].map(([tx, ty], i) => (
        <circle key={i} cx={tx} cy={ty} r="3"
          fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} stroke="#8B6410" strokeWidth="0.5" />
      ))}
      <text x="50" y="90" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">exocytosis into the cleft</text>
    </g>
  ),

  // Receptors - a five-subtype overview drawn as small receptor
  // glyphs on a membrane line. Matches pha:6's receptor overview.
  receptors: (active) => (
    <g>
      <line x1="14" y1="58" x2="86" y2="58"
        stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"} strokeWidth="2" strokeLinecap="round" />
      {["α1", "α2", "β1", "β2", "β3"].map((label, i) => (
        <g key={i}>
          <path d={`M${20 + i * 15},56 L${20 + i * 15},46 M${20 + i * 15},46 L${17 + i * 15},40 M${20 + i * 15},46 L${23 + i * 15},40`}
            stroke={active ? ATLAS_COLORS.trunk : "#5B21B6"} strokeWidth="1.4" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <text x={20 + i * 15} y="30" textAnchor="middle" fontSize="7"
            fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>{label}</text>
        </g>
      ))}
      <text x="50" y="80" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">five adrenoceptor subtypes</text>
    </g>
  ),

  // Alpha-1 - Gq-coupled receptor on a vessel, contraction.
  alpha1: (active) => (
    <g>
      <path d="M36,56 L36,40 M36,40 L30,32 M36,40 L42,32"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="24" r="4" fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} stroke="#0A0F1A" strokeWidth="0.6" />
      <text x="66" y="38" fontSize="10" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#C0392B"}>α1</text>
      <text x="66" y="50" fontSize="6.5" fill="var(--text-2)">Gq · vasoconstriction</text>
      <text x="66" y="62" fontSize="6" fill="var(--text-3)">prazosin blocks</text>
    </g>
  ),

  // Alpha-2 - Gi-coupled presynaptic autoreceptor, self-brake.
  alpha2: (active) => (
    <g>
      <path d="M36,56 L36,40 M36,40 L30,32 M36,40 L42,32"
        stroke={active ? ATLAS_COLORS.trunk : "#8B5CF6"} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* A "no-release" symbol above the receptor to show the autoreceptor self-brake */}
      <circle cx="36" cy="18" r="7" fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#8B5CF6"} strokeWidth="1.6" strokeDasharray="3 2" />
      <text x="66" y="38" fontSize="10" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}>α2</text>
      <text x="66" y="50" fontSize="6.5" fill="var(--text-2)">Gi · autoreceptor</text>
      <text x="66" y="62" fontSize="6" fill="var(--text-3)">clonidine · methyldopa</text>
    </g>
  ),

  // Beta-1 - Gs-coupled cardiac receptor, drawn with a heart.
  beta1: (active) => (
    <g>
      <path d="M36,56 L36,40 M36,40 L30,32 M36,40 L42,32"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30,22 Q36,14 42,22 Q36,26 30,22 Z"
        fill={active ? ATLAS_COLORS.trunk : "#E53935"} opacity="0.85" />
      <text x="66" y="38" fontSize="10" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}>β1</text>
      <text x="66" y="50" fontSize="6.5" fill="var(--text-2)">Gs · cardiac</text>
      <text x="66" y="62" fontSize="6" fill="var(--text-3)">metoprolol · atenolol</text>
    </g>
  ),

  // Beta-2 - Gs-coupled receptor, drawn with lung tissue to show
  // the bronchial target.
  beta2: (active) => (
    <g>
      <path d="M36,56 L36,40 M36,40 L30,32 M36,40 L42,32"
        stroke={active ? ATLAS_COLORS.trunk : "#2F8F4E"} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Two lung-shape lobes to show the bronchial target */}
      <path d="M26,20 Q30,14 34,20 Q34,26 30,26 Q26,26 26,20 Z"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"} opacity="0.8" />
      <path d="M38,20 Q42,14 46,20 Q46,26 42,26 Q38,26 38,20 Z"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"} opacity="0.8" />
      <text x="66" y="38" fontSize="10" fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}>β2</text>
      <text x="66" y="50" fontSize="6.5" fill="var(--text-2)">Gs · bronchial</text>
      <text x="66" y="62" fontSize="6" fill="var(--text-3)">salbutamol · salmeterol</text>
    </g>
  ),

  // Reuptake - NET with an arrow pulling NA back into the terminal.
  reuptake: (active) => (
    <g>
      <path d="M30,66 Q36,54 42,66" fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"} strokeWidth="3" strokeLinecap="round" />
      <path d="M36,58 L36,30"
        stroke={active ? ATLAS_COLORS.trunk : "#F5B93F"}
        strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
      <polygon points="36,26 32,33 40,33" fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} />
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill="var(--text-2)">uptake 1 · NET</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6"
        fontStyle="italic" fill="var(--text-3)">tricyclics · cocaine</text>
    </g>
  ),

  // Nicotinic - a ligand-gated ion channel in cross-section, with
  // ions passing through the pore. Matches pha:7's nicotinic panel.
  nicotinic: (active) => (
    <g>
      <rect x="26" y="22" width="8" height="52" rx="2"
        fill={active ? ATLAS_COLORS.trunk : "#C0392B"} opacity="0.85" />
      <rect x="66" y="22" width="8" height="52" rx="2"
        fill={active ? ATLAS_COLORS.trunk : "#C0392B"} opacity="0.85" />
      <text x="50" y="50" textAnchor="middle" fontSize="6"
        fontWeight="700" fill="var(--text-3)">pore</text>
      <circle cx="50" cy="32" r="4" fill="#2F6FED" opacity="0.9" />
      <circle cx="50" cy="46" r="4" fill="#2F6FED" opacity="0.75" />
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#C0392B"}>nicotinic · ion channel</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">fast · milliseconds</text>
    </g>
  ),

  // Muscarinic - a GPCR serpentine in a membrane, with a small
  // signalling arrow pointing down into the cell. Matches pha:7's
  // muscarinic panel.
  muscarinic: (active) => (
    <g>
      {/* Membrane band */}
      <rect x="10" y="38" width="80" height="22" fill="#F5E8E0" opacity="0.4" />
      <line x1="10" y1="38" x2="90" y2="38"
        stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      <line x1="10" y1="60" x2="90" y2="60"
        stroke="#B8A89E" strokeWidth="0.8" opacity="0.55" />
      {/* Seven-transmembrane serpentine - simplified version */}
      <path
        d="M20,60 L20,38 Q24,32 28,38 L28,60 Q32,66 36,60 L36,38 Q40,32 44,38 L44,60 Q48,66 52,60 L52,38 Q56,32 60,38 L60,60 Q64,66 68,60 L68,38 Q72,32 76,38 L76,60"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Downstream arrow to show second-messenger signalling */}
      <path d="M48,62 L48,72"
        stroke={active ? ATLAS_COLORS.trunk : "#8B5CF6"} strokeWidth="2" strokeLinecap="round" />
      <polygon points="48,76 44,70 52,70" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"} />
      <text x="50" y="90" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}>muscarinic · GPCR</text>
      <text x="50" y="99" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">slower · seconds</text>
    </g>
  ),

  // M2 - cardiac muscarinic. A heart shape labelled M2, with the
  // "vagal brake" caption the note uses.
  m2: (active) => (
    <g>
      <path d="M50,44 Q36,44 36,56 Q36,70 50,70 Q64,70 64,56 Q64,44 50,44 Z"
        fill={active ? ATLAS_COLORS.trunk : "#E53935"} opacity="0.85" />
      <text x="50" y="62" textAnchor="middle" fontSize="11"
        fontWeight="800" fill="#fff">M2</text>
      <text x="50" y="86" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}>cardiac · Gi</text>
      <text x="50" y="97" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">vagal brake · atropine</text>
    </g>
  ),

  // M3 - glandular and smooth-muscle muscarinic. Drawn as a
  // glandular/smooth-muscle wave to show the target tissue.
  m3: (active) => (
    <g>
      <path
        d="M20,54 Q28,42 36,54 Q44,66 52,54 Q60,42 68,54 Q76,66 84,54"
        fill="none" stroke={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        strokeWidth="3" strokeLinecap="round" />
      <text x="50" y="30" textAnchor="middle" fontSize="11"
        fontWeight="800" fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}>M3</text>
      <text x="50" y="80" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill="var(--text-2)">smooth muscle · glands</text>
      <text x="50" y="92" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">Gq · atropine blocks</text>
    </g>
  ),

  // AChE - an enzyme breaking ACh into two fragments. Drawn with
  // a Pac-Man-style enzyme body and two small product dots, matching
  // the way the note describes hydrolysis into choline + acetate.
  ache: (active) => (
    <g>
      {/* Enzyme Pac-Man body */}
      <path
        d="M50,40 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0 Z M48,38 L62,30 L62,50 Z"
        fill={active ? ATLAS_COLORS.trunk : "#F5B93F"} opacity="0.85"
        stroke="#8B6410" strokeWidth="1" />
      {/* Products of hydrolysis floating out to the right */}
      <circle cx="76" cy="34" r="3" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} stroke="#0A0F1A" strokeWidth="0.5" />
      <circle cx="82" cy="48" r="3" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} stroke="#0A0F1A" strokeWidth="0.5" />
      <text x="50" y="72" textAnchor="middle" fontSize="6.5"
        fontWeight="700" fill={active ? ATLAS_COLORS.trunk : "var(--text-2)"}>acetylcholinesterase</text>
      <text x="50" y="84" textAnchor="middle" fontSize="6"
        fill="var(--text-2)">ACh → choline + acetate</text>
      <text x="50" y="96" textAnchor="middle" fontSize="6"
        fontStyle="italic" fill="var(--text-3)">milliseconds · fastest enzyme</text>
    </g>
  ),

  // ============================================================
  // pha:4 (Dose-response curve) swatches
  // ============================================================
  // Every swatch below draws a mini version of the sigmoid curve
  // the student sees on the canvas, so the tile teaches the shape
  // at the same time as the label. They use the same red/blue/amber
  // palette as atlasDoseResponseCurve itself, so a student clicking
  // back and forth between the tile and the plot sees one visual
  // language, not two.

  // The curve itself — one clean sigmoid, amber, no overlays.
  curve: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="60" r="3" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} />
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">the sigmoid</text>
    </g>
  ),

  // The sigmoid shape, with the three phases annotated. Flat-steep-flat
  // is the message of this tile.
  shape: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text x="22" y="82" fontSize="6" fontWeight="700" fill="var(--text-3)">flat</text>
      <text x="50" y="56" fontSize="6" fontWeight="700" fill="#8B5CF6">steep</text>
      <text x="80" y="22" fontSize="6" fontWeight="700" fill="var(--text-3)">flat</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">S-shape</text>
    </g>
  ),

  // EC50 — the same curve, with the 50% line drawn in and the crossing
  // marked with a dot.
  ec50: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line x1="14" y1="60" x2="86" y2="60"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="0.9" strokeDasharray="3 3" opacity="0.75" />
      <line x1="50" y1="60" x2="50" y2="86"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="0.9" strokeDasharray="3 3" opacity="0.75" />
      <circle cx="50" cy="60" r="3" fill={active ? ATLAS_COLORS.trunk : "#2F6FED"} />
      <text x="56" y="56" fontSize="7" fontWeight="800"
        fill={active ? ATLAS_COLORS.trunk : "#2F6FED"}>EC50</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">potency</text>
    </g>
  ),

  // Emax — the same curve reaching full height, with the ceiling
  // labelled. Uses the green accent atlasDoseResponseCurve uses for
  // "this is the maximum".
  emax: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#16A34A"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line x1="14" y1="16" x2="86" y2="16"
        stroke={active ? ATLAS_COLORS.trunk : "#16A34A"}
        strokeWidth="0.9" strokeDasharray="3 3" opacity="0.75" />
      <text x="80" y="12" fontSize="7" fontWeight="800"
        fill={active ? ATLAS_COLORS.trunk : "#16A34A"}>Emax</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">efficacy</text>
    </g>
  ),

  // Ceiling effect — the top portion of the curve shaded, showing
  // "no additional benefit past here". Crimson, matching the render.
  ceiling: (active) => (
    <g>
      <rect x="14" y="14" width="72" height="12" rx="2"
        fill={active ? ATLAS_COLORS.trunk : "#C0392B"} opacity="0.18" />
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text x="50" y="22" textAnchor="middle" fontSize="6"
        fontWeight="700" fill="#C0392B">no benefit</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">the ceiling</text>
    </g>
  ),

  // Competitive antagonism — the base curve in amber, plus a dashed
  // copy shifted right (same height). The rightward shift is the whole
  // message of this swatch.
  competitive: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M24,86 Q34,86 42,84 Q52,80 60,60 Q68,40 78,26 Q84,20 86,18"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#2F6FED"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="5 3"
      />
      <text x="66" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">shifts right</text>
    </g>
  ),

  // Non-competitive antagonism — the base curve plus a dashed copy at
  // the same position but reduced height. The drop is the message.
  noncompetitive: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 30,84 Q42,80 50,60 Q58,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M14,86 Q20,86 30,84 Q42,82 50,70 Q58,56 70,48 Q80,44 86,42"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="5 3"
      />
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">drops Emax</text>
    </g>
  ),

  // Selectivity — the on-target curve (amber) plus a second curve
  // far to the right (crimson), with the gap between them labelled.
  selectivity: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 26,84 Q34,80 40,60 Q46,40 54,26 Q64,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : ATLAS_COLORS.trunk}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M44,86 Q54,86 62,84 Q72,80 78,60 Q82,44 86,32"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path d="M46,50 L74,50" stroke="var(--text-3)"
        strokeWidth="1" strokeDasharray="3 3" />
      <text x="60" y="46" textAnchor="middle" fontSize="6" fontWeight="700"
        fill="var(--text-2)">selectivity</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">on-target vs off-target</text>
    </g>
  ),

  // Therapeutic index — two curves side by side, the gap between their
  // midpoints labelled. Amber is effect, crimson is toxicity.
  ti: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 26,84 Q34,80 40,60 Q46,40 56,26 Q66,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#16A34A"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14,86 Q20,86 30,84 Q42,80 52,60 Q60,40 70,26 Q80,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#C0392B"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path d="M40,62 L52,62" stroke={ATLAS_COLORS.trunk}
        strokeWidth="2.4" strokeLinecap="round" />
      <text x="46" y="58" textAnchor="middle" fontSize="6" fontWeight="700"
        fill={ATLAS_COLORS.trunk}>TI</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">TD50 / ED50</text>
    </g>
  ),

  // Tolerance — three curves: first dose, after weeks, after months.
  // Each one shifted right and lower than the last.
  tolerance: (active) => (
    <g>
      <path
        d="M14,86 Q20,86 24,84 Q30,80 36,60 Q44,40 54,26 Q66,18 86,16"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M14,86 Q20,86 26,84 Q34,80 42,60 Q50,44 60,34 Q72,28 86,26"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#64748B"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="4 3"
        opacity="0.7"
      />
      <path
        d="M14,86 Q22,86 30,84 Q40,80 50,68 Q60,58 70,50 Q80,46 86,44"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : ATLAS_COLORS.trunk}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">curve drifts</text>
    </g>
  ),

  // ============================================================
  // pha:5 (Pharmacokinetics) swatches
  // ============================================================
  // Every swatch below mirrors a stage of the ADME diagram: a
  // tablet (route), a gut wall with villi (absorption), a capillary
  // lumen with a membrane (membrane), a liver with a portal arrow
  // (first-pass), an F label (bioavailability), a spreading Vd
  // (distribution), a liver with phase I/II (metabolism), a
  // glomerulus (excretion), and a decay curve (half-life).

  // Route — a small tablet with a few route names below it. The tablet
  // is the same shape used everywhere else in the pharmacology family.
  route: (active) => (
    <g>
      <ellipse cx="50" cy="34" rx="22" ry="12"
        fill={active ? ATLAS_COLORS.trunk : "#F5A8A0"}
        stroke="#8C1C12" strokeWidth="1.4" />
      <line x1="34" y1="34" x2="66" y2="34"
        stroke="#8C1C12" strokeWidth="0.9" opacity="0.6" />
      <text x="50" y="58" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text-2)">oral · IV · IM</text>
      <text x="50" y="70" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text-2)">SC · SL · inh</text>
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">how the drug gets in</text>
    </g>
  ),

  // Absorption — a gut wall with villi, and a drug molecule crossing
  // from the lumen above into the blood below.
  absorption: (active) => (
    <g>
      <rect x="10" y="24" width="80" height="34" rx="4"
        fill="var(--bg-3)" stroke="#C0392B" strokeWidth="1.2" />
      <text x="50" y="44" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="#C0392B">gut lumen</text>
      {[22, 34, 46, 58, 70].map((vx, i) => (
        <path key={i}
          d={`M${vx},58 Q${vx + 2},66 ${vx + 4},58`}
          fill="none" stroke="#C0392B" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {/* A drug molecule crossing the wall */}
      <polygon points="44,60 50,56 56,60 56,68 50,72 44,68"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        stroke="#0A0F1A" strokeWidth="0.6" />
      <path d="M50,78 L50,84" stroke={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        strokeWidth="1.4" strokeDasharray="2 2" strokeLinecap="round" />
      <polygon points="50,88 47,83 53,83"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"} />
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">into the blood</text>
    </g>
  ),

  // Membrane — a lipid bilayer with a small drug crossing. The two
  // rows of circles are the phospholipid heads; the drug is drawn as
  // the same hexagon used everywhere else.
  membrane: (active) => (
    <g>
      {[18, 28, 38, 48, 58, 68, 78].map((hx, i) => (
        <circle key={`top${i}`} cx={hx} cy="34" r="4"
          fill="#F5B93F" stroke="#8B6410" strokeWidth="0.6" opacity="0.7" />
      ))}
      {[18, 28, 38, 48, 58, 68, 78].map((hx, i) => (
        <circle key={`bot${i}`} cx={hx} cy="52" r="4"
          fill="#F5B93F" stroke="#8B6410" strokeWidth="0.6" opacity="0.7" />
      ))}
      <line x1="10" y1="43" x2="90" y2="43"
        stroke="#B8A89E" strokeWidth="0.6" opacity="0.6" />
      <polygon points="44,32 50,28 56,32 56,40 50,44 44,40"
        fill={active ? ATLAS_COLORS.trunk : "#2F8F4E"}
        stroke="#0A0F1A" strokeWidth="0.6"
        transform="translate(0,14)" />
      <text x="50" y="74" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text-2)">lipid bilayer</text>
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">lipophilic drugs cross</text>
    </g>
  ),

  // First-pass — the liver with a portal-vein arrow going in and a
  // smaller systemic arrow coming out. The "gut → liver → heart"
  // three-stage beat, drawn in one tile.
  firstpass: (active) => (
    <g>
      <ellipse cx="50" cy="42" rx="26" ry="16"
        fill={active ? "#E53935" : "#C0392B"}
        stroke="#8C1C12" strokeWidth="1.4" />
      <text x="50" y="46" textAnchor="middle" fontSize="8" fontWeight="700"
        fill="#fff">liver</text>
      <path d="M14,30 L28,32" stroke="#2F6FED" strokeWidth="2"
        strokeLinecap="round" />
      <polygon points="28,32 22,28 22,36" fill="#2F6FED" />
      <text x="14" y="26" fontSize="5.5" fill="#2F6FED" textAnchor="middle">portal</text>
      <path d="M72,52 L86,52" stroke="#2F6FED" strokeWidth="2"
        strokeLinecap="round" />
      <polygon points="86,52 80,48 80,56" fill="#2F6FED" />
      <text x="86" y="64" fontSize="5.5" fill="#2F6FED" textAnchor="middle">systemic</text>
      <text x="50" y="82" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="var(--text-2)">liver first</text>
    </g>
  ),

  // Bioavailability — a big F, with "fraction reaching systemic
  // circulation" as the caption. One-letter-and-a-caption is the
  // clearest way to draw a numberless pharmacokinetic parameter.
  bioavail: (active) => (
    <g>
      <text x="50" y="58" textAnchor="middle" fontSize="40"
        fontWeight="800"
        fill={active ? ATLAS_COLORS.trunk : "#F5B93F"}>F</text>
      <text x="50" y="76" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">fraction reaching systemic</text>
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">circulation unchanged</text>
    </g>
  ),

  // Distribution — a body outline with the drug spreading from a
  // central blood vessel out into the tissues. Vd is drawn as a
  // hatched region suggesting "volume".
  distribution: (active) => (
    <g>
      <circle cx="50" cy="24" r="9" fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.2" />
      <path d="M40,38 Q50,34 60,38 L58,74 Q50,78 42,74 Z"
        fill="#F5C7C0" stroke="#B63B2E" strokeWidth="1.2" />
      {[[26, 50], [74, 50], [30, 68], [70, 68]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3.5"
          fill={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
          opacity="0.75" />
      ))}
      <text x="50" y="94" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">Vd · into tissues</text>
    </g>
  ),

  // Metabolism — the liver with Phase I and Phase II labels, and a
  // drug molecule going in and a conjugated metabolite coming out.
  metabolism: (active) => (
    <g>
      <ellipse cx="50" cy="44" rx="26" ry="16"
        fill={active ? "#E53935" : "#C0392B"}
        stroke="#8C1C12" strokeWidth="1.4" />
      <text x="50" y="48" textAnchor="middle" fontSize="8" fontWeight="700"
        fill="#fff">liver</text>
      <text x="50" y="70" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="#8C1C12">Phase I → Phase II</text>
      <text x="50" y="84" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">CYP450 · conjugation</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">metabolite → excretable</text>
    </g>
  ),

  // Excretion — a stylised glomerulus with filtration arrows. Same
  // visual as the atlasGlomerulus primitive at reduced scale.
  excretion: (active) => (
    <g>
      <path
        d="M26,32 Q50,20 74,32 Q82,44 74,58 Q50,70 26,58 Q18,44 26,32 Z"
        fill="#EDD4E2" stroke={active ? ATLAS_COLORS.trunk : "#8B5CF6"}
        strokeWidth="1.8" opacity="0.65"
      />
      <path
        d="M32,48 Q42,32 56,48 Q66,58 52,62 Q42,64 34,58 Q30,54 32,48 Z"
        fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12"
        strokeWidth="1.2" opacity="0.75"
      />
      {[[16, 30], [84, 30], [16, 58], [84, 58]].map(([px, py], i) => (
        <path key={i}
          d={`M${px},${py} L${px + (px < 50 ? 8 : -8)},${py}`}
          stroke={ATLAS_COLORS.trunk} strokeWidth="1.6"
          strokeLinecap="round" />
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">filter · secrete · reabsorb</text>
    </g>
  ),

  // Half-life — the exponential decay curve with the 50% line drawn
  // in. Same shape as the mini plot the render draws at pha:5.
  halflife: (active) => (
    <g>
      <line x1="14" y1="86" x2="86" y2="86"
        stroke="#64748B" strokeWidth="0.8" />
      <line x1="14" y1="14" x2="14" y2="86"
        stroke="#64748B" strokeWidth="0.8" />
      <path
        d="M14,18 Q24,20 30,40 Q40,62 52,76 Q66,84 86,86"
        fill="none"
        stroke={active ? ATLAS_COLORS.trunk : "#F5B93F"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line x1="14" y1="52" x2="32" y2="52"
        stroke={active ? ATLAS_COLORS.trunk : "#F5B93F"}
        strokeWidth="0.8" strokeDasharray="3 2" opacity="0.75" />
      <text x="32" y="48" fontSize="6" fontWeight="700"
        fill={active ? ATLAS_COLORS.trunk : "#F5B93F"}>50%</text>
      <text x="50" y="98" textAnchor="middle" fontSize="6.5"
        fill="var(--text-2)">t½ · elimination</text>
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

  // Mirror of `playing` readable synchronously from callbacks that
  // would otherwise see a stale render's value. Kept in sync by the
  // effect further down.
  const playingRef = useRef(false);

  // Watchdog handle. Armed when a step begins speaking; cleared when
  // the speech event fires or the step advances. On mobile, where
  // speechSynthesis.onend is unreliable, this is what actually drives
  // the highlight forward.
  const watchdogRef = useRef(null);

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
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    setActiveLabelId(null);
    setPlaying(false);
    setPaused(false);
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
    playTokenRef.current++;
    cachedVoiceRef.current = undefined;
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
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

  // Legend highlight is handled purely by the amber ring around the tile
  // in the legend grid below — no auto-scroll at all. the diagram stage
  // above the legend is what the student is watching during playback,
  // and yanking the page (especially on mobile, where the legend sits
  // below the fold) makes the diagram jump out of view. if the legend
  // scrolls into view, the student can scroll it themselves. this effect
  // is intentionally a no-op now, kept only so the label refs stay
  // registered and future per-tile behaviour has a natural home.
  useEffect(() => {
    // Intentionally does nothing. See comment above.
  }, [activeStep, playing, diagram]);

  // Persist current step to sessionStorage.
  useEffect(() => {
    try {
      sessionStorage.setItem(`ascend_atlas_step_${diagramId}`, String(activeStep));
    } catch {}
  }, [activeStep, diagramId]);

  // Dev-time checks (rule book sections 4.1-4.3). Unchanged from the
  // original file — kept here so the file stays self-consistent.
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
        console.warn(`[Atlas] "${diagram.id}" step ${i + 1}: narration contains an arrow character - the speech engine reads this as "right arrow". Use "to" or a comma instead.`);
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
      const hasSwatch = !!LEGEND_SWATCHES[l.id];
      const hasViewBox = !!LEGEND_VIEWBOXES[l.id];
      if (!hasSwatch || !hasViewBox) {
        const missing = [];
        if (!hasSwatch) missing.push("LEGEND_SWATCHES");
        if (!hasViewBox) missing.push("LEGEND_VIEWBOXES");
        console.warn(
          `[Atlas] "${diagram.id}": label "${l.id}" (${l.name}) missing from ${missing.join(
            " and "
          )} — legend tile will show a placeholder.`
        );
      }
    });

    const overlapTimer = setTimeout(() => {
      const wrapper = document.querySelector(`[data-atlas-diagram="${diagram.id}"]`);
      if (!wrapper) return;
      const texts = Array.from(wrapper.querySelectorAll("text"));
      if (texts.length < 2) return;

      const boxes = [];
      texts.forEach((t) => {
        try {
          const b = t.getBBox();
          if (b.width > 0 && b.height > 0) {
            boxes.push({
              el: t,
              label: (t.textContent || "").trim().slice(0, 30),
              x: b.x, y: b.y, w: b.width, h: b.height,
            });
          }
        } catch {}
      });

      const reported = new Set();
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const overlapX = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
          const overlapY = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
          const overlapArea = overlapX * overlapY;
          const smallerArea = Math.min(a.w * a.h, b.w * b.h);
          if (smallerArea > 0 && overlapArea / smallerArea > 0.3) {
            const key = a.label + "::" + b.label;
            if (!reported.has(key)) {
              reported.add(key);
              console.warn(`[Atlas] "${diagram.id}": text overlap between "${a.label}" and "${b.label}"`);
            }
          }
        }
      }
    }, 500);

    return () => clearTimeout(overlapTimer);
  }, [diagram]);

  useEffect(() => () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  // advanceAfterStep — reads playingRef.current synchronously (instead
  // of reaching into setPlaying's reducer), and clears the watchdog so
  // the timer can't double-fire the same step after the speech event
  // has already done so.
    // Tracks the last step index that has already been advanced past, so
    // that the speech engine's onend event and the watchdog timer cannot
    // BOTH advance the same step. Without this, a slow voice could fire
    // the watchdog early, advance once, and then fire onend on the same
    // utterance — advancing a second time and putting the diagram one
    // step ahead of the narration for the rest of the run.
    const advancedStepRef = useRef(-1);

    const advanceAfterStep = useCallback((myToken, finishedStepIdx) => {
    // Stale run — a new play/jump/speak cycle has started.
    if (myToken !== playTokenRef.current) return;

    // Speech has been paused, stopped, or the diagram was left.
    if (!playingRef.current) return;

    // Already advanced past this exact step. This is the single line
    // that stops the double-advance race. Whichever of onend or the
    // watchdog fires first wins; the second is a no-op.
    if (finishedStepIdx === advancedStepRef.current) return;
    advancedStepRef.current = finishedStepIdx;

    // Clear the watchdog — its job for this step is done either way.
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    setTimeout(() => {
      if (myToken !== playTokenRef.current) return;
      if (!playingRef.current) return;
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
    }, 250);
  }, [diagram]);

  const speakStepRef = useRef(() => {});
  const cachedVoiceRef = useRef(undefined);
  const speakStep = useCallback((stepIdx) => {
    const text = diagram.narration[stepIdx];
    if (!text) return;

    // Capture the current token AND the step index this utterance is
    // responsible for. Both are carried through to advanceAfterStep so
    // it can refuse to advance twice for the same step.
    const myToken = playTokenRef.current;
    const finishedStepIdx = stepIdx;

    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    const words = text.trim().split(/\s+/).length;
    const baseMs = Math.max(1200, (words / 2.6) * 1000);
    const estimatedMs = baseMs / speed;

    // Armed when a step begins speaking but speech never actually
    // starts (mobile Safari sometimes silently drops a speak() call
    // that arrives while another is still finishing). Disarmed the
    // moment onstart fires, so after that ONLY onend can advance the
    // step. This is what stops the watchdog from stealing the advance
    // on slow voices.
    const armStartupWatchdog = (ms) => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null;
        // Speech never started — advance so the diagram doesn't freeze.
        advanceAfterStep(myToken, finishedStepIdx);
      }, ms);
    };

    // When the diagram is muted (or there's no speech engine at all),
    // there's no onend to listen for — the estimated duration IS the
    // step duration. Use a fixed generous multiplier so the diagram
    // and the on-screen narration text at least stay in lockstep.
    if (muted || !("speechSynthesis" in window)) {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null;
        advanceAfterStep(myToken, finishedStepIdx);
      }, estimatedMs * 1.15 + 400);
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

      // The moment speech actually starts, the watchdog is no longer
      // needed — onend will fire when the utterance finishes, and it
      // will fire with the correct step index because we captured it
      // above. Disarming the watchdog here is the whole fix.
      utter.onstart = () => {
        if (watchdogRef.current) {
          clearTimeout(watchdogRef.current);
          watchdogRef.current = null;
        }
      };
      utter.onend = () => advanceAfterStep(myToken, finishedStepIdx);
      utter.onerror = () => advanceAfterStep(myToken, finishedStepIdx);

      window.speechSynthesis.speak(utter);

      // Arm the startup watchdog — only fires if onstart never fires,
      // which happens on some Android Chrome builds when the speech
      // queue is stuck. If onstart does fire, this timer is cleared
      // and the step advances only when the utterance actually ends.
      armStartupWatchdog(2200);
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
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      try { window.speechSynthesis.cancel(); } catch {}
      return;
    }
    const startAt = isFinished ? 0 : activeStep;
    if (startAt !== activeStep) setActiveStep(startAt);
    setPlaying(true);
    setPaused(false);
    // speakStep is called from the effect below once playing flips
    // true and playingRef has been updated.
  };

  // Kick the first speech line as soon as `playing` flips true, so
  // playingRef.current is guaranteed to be in sync before speakStep
  // reads it inside advanceAfterStep.
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (playing && !wasPlayingRef.current) {
      wasPlayingRef.current = true;
      speakStep(activeStep);
    } else if (!playing && wasPlayingRef.current) {
      wasPlayingRef.current = false;
    }
  }, [playing, activeStep, speakStep]);

  const jumpTo = (idx) => {
    playTokenRef.current++;
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
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
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 12 }}>&rsaquo;</span>
            <button
              className="mono"
              style={{ background: "none", border: "none", cursor: i === breadcrumb.length - 1 ? "default" : "pointer", color: i === breadcrumb.length - 1 ? "var(--amber-2)" : "var(--text-2)", fontSize: 12, fontWeight: i === breadcrumb.length - 1 ? 700 : 500, padding: 0 }}
              onClick={() => i !== breadcrumb.length - 1 && onBreadcrumb(i)}
            >
              {DIAGRAMS[id].title.split(" \u2014 ")[0]}
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
        <button className="btn btn-g btn-sm" onClick={() => stepBy(-1)} disabled={activeStep === 0} aria-label="Previous step" title="Previous step">&#9664;</button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(1)} disabled={!diagram.loop && activeStep === diagram.narration.length - 1} aria-label="Next step" title="Next step">&#9654;</button>
        <button className="btn btn-g btn-sm mono" onClick={() => setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 0.85 : 1))} title="Playback speed" aria-label={"Playback speed " + speed + "x"}>{speed}&times;</button>
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
              // Explicit, non-collapsing height. Previously `clamp(240px,
              // 48vh, 560px)` could resolve to 0 on some iOS Safari and
              // Android Chrome builds when the parent card had no definite
              // height — the SVG then had nothing to size itself against,
              // and every diagram "disappeared" at once. `minHeight` here
              // guarantees the stage is always at least 240px tall, and
              // `height` uses a plain vh unit as the primary value (with
              // a clamp as the enhanced value only when the browser
              // supports it, via the second declaration).
              height: fullscreen ? undefined : "48vh",
              minHeight: fullscreen ? undefined : 240,
              maxHeight: fullscreen ? undefined : 560,
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
              <button className="btn btn-sm" title="Zoom out" onClick={() => applyZoom((z) => z - 0.2)}>&minus;</button>
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
            {/*
              Wrapper fix: this div now has width:100% and height:100%
              in BOTH fullscreen and non-fullscreen modes. On mobile,
              the previous version left both undefined in normal mode,
              which collapsed the SVG to zero height on iOS Safari and
              some Android Chrome builds. Setting them explicitly here
              means the SVG's own width="100%" height="100%" resolves
              against a definite parent box.
            */}
            <div
              data-atlas-diagram={diagram.id}
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: dragRef.current ? "none" : "transform 0.15s ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // position:absolute + inset:0 guarantees this wrapper has a
                // definite, non-collapsing box to sit inside, no matter how
                // the flex parent resolves its own height. Combined with the
                // stage's explicit minHeight above, the SVG always has a
                // real box to scale against, on every browser we've tested.
                position: "absolute",
                inset: 0,
                // minWidth/minHeight of 0 lets the SVG shrink inside a flex
                // container without the browser falling back to the SVG's
                // intrinsic size — this is what caused the "diagram too big
                // on mobile / nothing renders at all" seesaw.
                minWidth: 0,
                minHeight: 0,
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
                  if (watchdogRef.current) {
                    clearTimeout(watchdogRef.current);
                    watchdogRef.current = null;
                  }
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
        <div className="eyebrow">Legend &mdash; tap any part to highlight it</div>
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
                  background: "#FAF8F5",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: active ? "1px solid " + ATLAS_COLORS.trunk : "1px solid var(--line)",
                }}>
                  <svg
                    viewBox={LEGEND_VIEWBOXES[l.id] || "0 0 100 100"}
                    width="56"
                    height="56"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {LEGEND_SWATCHES[l.id]
                      ? LEGEND_SWATCHES[l.id](active)
                      : (
                        // Fallback swatch: a neutral, unmistakably-deliberate
                        // placeholder — a soft grey tile with the label's
                        // initials, not a red X on pink. The red X read as
                        // "broken / error" to a student, which was itself a
                        // UX bug. The grey tile reads as "still being drawn",
                        // which is honest and quiet.
                        <g>
                          <rect
                            x="10" y="10" width="80" height="80" rx="14"
                            fill="var(--bg-3)"
                            stroke="var(--line)"
                            strokeWidth="1.6"
                            strokeDasharray="5 4"
                          />
                          <text
                            x="50" y="55"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="28"
                            fontWeight="800"
                            fill="var(--text-3)"
                          >
                            {(() => {
                              // Two-letter initials from the label name,
                              // e.g. "Alpha-1 Receptors" → "AR".
                              const words = (l.name || l.id || "?")
                                .split(/[\s\-_]+/)
                                .filter(Boolean);
                              if (words.length === 0) return "?";
                              if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
                              return (words[0][0] + words[1][0]).toUpperCase();
                            })()}
                          </text>
                        </g>
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
                    Open {DIAGRAMS[l.drillTo]?.title?.split(" \u2014 ")[0] || l.name} &rarr;
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
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>&larr; Previous visual</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevDiagram.title.split(" \u2014 ")[0]}</span>
            </button>
          ) : <span style={{ flex: 1 }} />}
          {nextDiagram ? (
            <button
              className="btn btn-g"
              style={{ flex: 1, textAlign: "right", minWidth: 0 }}
              onClick={() => onOpenDiagram(nextDiagram.id)}
              aria-label={`Next visual: ${nextDiagram.title}`}
            >
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>Next visual &rarr;</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextDiagram.title.split(" \u2014 ")[0]}</span>
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
