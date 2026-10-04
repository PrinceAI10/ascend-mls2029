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
//
// Layout (per the latest pass): the play bar sits on top, the
// same way the Listen bar sits above a topic note's own text.
// Hitting Play drives the whole seven-ish-phase sequence on its
// own - no manual stepping required, though pause/resume/speed/
// step-by-step are all still there for someone who wants to slow
// down. Below the play bar: the diagram on the left, a fixed
// topic summary on the right (what the note actually says about
// this topic - tapping a part of the diagram adds that part's
// description under the summary without replacing it). The full
// legend sits below both, since it's reference material you
// glance at, not something that needs to compete for primary
// screen space.
//
// SCREENS:
//   1. Course picker   - which courses have visuals
//   2. Visuals list     - that course's visuals, syllabus order
//   3. Viewer           - the SVG, zoom/pan, tap-a-label, legend,
//                         breadcrumb, drill-downs, Play walkthrough
//
// Pathway builders (type: "builder") are deliberately not surfaced
// here - PathwayBuilder below is kept so the mechanic still works
// the moment a builder-type entry is registered, but nothing in
// diagrams.js is a builder right now; that format is being held
// for its own dedicated tab.
//
// Opened from a topic's amber "Open the illustrated diagram" card,
// this jumps straight to Screen 3 for that topic's diagram. Opened
// from the nav, it starts at Screen 1.
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

// Per-label mini-illustration for the legend. Each entry draws a tiny
// version of the actual structure it names, using the SAME primitives the
// diagram itself uses (atlasHeart, atlasLungs, atlasBloodCell, etc.). This
// way the legend is a real visual key, not just a list of terms.
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
      <circle cx="50" cy="30" r="12" fill="#8B5CF6" opacity="0.9" />
      <circle cx="22" cy="72" r="9" fill="#2F6FED" opacity="0.9" />
      <circle cx="78" cy="72" r="9" fill="#E53935" opacity="0.9" />
      <path d="M50 40 L22 62 M50 40 L78 62" stroke="var(--text-2)" strokeWidth="1.6" />
    </g>
  ),

  // ---- Cardiac Cycle drill-down ----
  // A simplified chamber: rounded rect filled blue (right) or red (left),
  // labeled. Same visual language as the main diagram, scaled to fit 56px.
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
  // Cells drawn as filled circles with a lighter nucleus, matching the
  // atlasCell primitive the main diagram uses.
  hsc: (active) => (
    <g>
      <circle cx="50" cy="50" r="28" fill={active ? "#A78BFA" : "#8B5CF6"} stroke="#5B21B6" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="12" fill="#E9DFFF" opacity="0.85" />
    </g>
  ),
  cmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="10" fill="#FFF0C7" opacity="0.85" />
    </g>
  ),
  clp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="10" fill="#C7D8FF" opacity="0.85" />
    </g>
  ),
  b: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">B</text>
    </g>
  ),
  t: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">T</text>
    </g>
  ),
  nk: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill={active ? "#2D7BFF" : "#2F6FED"} stroke="#123F9E" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">NK</text>
    </g>
  ),
  "myeloid-leaf": (active) => (
    <g>
      <ellipse cx="32" cy="40" rx="14" ry="9" fill="#E53935" stroke="#8C1C12" strokeWidth="1" />
      <circle cx="65" cy="38" r="9" fill="#F5B93F" stroke="#8B6410" strokeWidth="1" />
      <circle cx="55" cy="68" r="8" fill="#E53935" stroke="#8C1C12" strokeWidth="1" />
    </g>
  ),
  gmp: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1B1405">GMP</text>
    </g>
  ),
  mep: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">MEP</text>
    </g>
  ),
  gran: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
      <circle cx="44" cy="44" r="4" fill="#1B1405" opacity="0.55" />
      <circle cx="56" cy="44" r="4" fill="#1B1405" opacity="0.55" />
      <circle cx="50" cy="56" r="4" fill="#1B1405" opacity="0.55" />
    </g>
  ),
  mono: (active) => (
    <g>
      <circle cx="50" cy="50" r="22" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
      <path d="M40 50 Q50 40 60 50 Q50 60 40 50 Z" fill="#1B1405" opacity="0.55" />
    </g>
  ),
    mega: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill={active ? "#E53935" : "#C0392B"} stroke="#8C1C12" strokeWidth="1.6" />
      {[[40, 40], [58, 42], [44, 60], [60, 58]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#F5C7C0" opacity="0.85" />
      ))}
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
      <circle cx="50" cy="50" r="28" fill="#D8D0F0" stroke="#5B21B6" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="14" fill="#8B5CF6" />
    </g>
  ),
  s2: (active) => (
    <g>
      <circle cx="50" cy="50" r="27" fill="#B8B0E0" stroke="#5B21B6" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="12" fill="#8B5CF6" />
    </g>
  ),
  s3: (active) => (
    <g>
      <circle cx="50" cy="50" r="26" fill="#D0A0B0" stroke="#8C1C12" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="10" fill="#8B5CF6" />
    </g>
  ),
  s4: (active) => (
    <g>
      <circle cx="50" cy="50" r="25" fill="#F0A8A0" stroke="#8C1C12" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="8" fill="#5B21B6" />
    </g>
  ),
  s5: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill="#F0B0A0" stroke="#8C1C12" strokeWidth="1.5" />
      <path d="M40 50 Q50 44 60 50" stroke="#8B5CF6" strokeWidth="1.5" fill="none" opacity="0.65" />
      <path d="M42 56 Q50 62 58 56" stroke="#8B5CF6" strokeWidth="1.2" fill="none" opacity="0.5" />
    </g>
  ),
  s6: (active) => (
    <g>
      <ellipse cx="50" cy="50" rx="28" ry="18" fill="#E53935" stroke="#8C1C12" strokeWidth="1.5" />
      <ellipse cx="50" cy="50" rx="14" ry="8" fill="#F5C7C0" opacity="0.75" />
    </g>
  ),
  epo: (active) => (
    <g>
      <circle cx="50" cy="50" r="24" fill={active ? "#FFC93C" : "#F5B93F"} stroke="#8B6410" strokeWidth="1.6" />
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
};
/* ---------------------------------------------------------------- */
/* Narration - a small, self-contained speech helper. Deliberately  */
/* duplicated (not imported from App.js) to avoid a circular import */
/* between App.js and this file. Uses the exact same browser API,   */
/* the same voice-matching heuristic, and the same localStorage key */
/* ("ascend_voice_gender") as the existing Listen feature, so a     */
/* student's voice choice carries over automatically.               */
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

/* Diagram + summary row - side by side once there's room, stacked on a
   narrow phone screen; same markup, flex-wrap handles both layouts. */
.atlas-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.atlas-diagram-col { flex: 1 1 340px; min-width: 0; }
.atlas-summary-col { flex: 1 1 280px; min-width: 0; }
/* Below 900px, the summary panel stacks UNDER the diagram instead of trying
   to fit beside it and squeezing the drawing. */
@media (max-width: 900px) {
  .atlas-row { flex-direction: column; }
  .atlas-diagram-col,
  .atlas-summary-col { flex: 1 1 auto; width: 100%; }
}
/* On phones the two columns stack full-width; min-width:0 above stops the
   flex basis from forcing a phantom horizontal scrollbar on 320px screens. */

/* Zoom controls float on the diagram itself now, instead of taking a
   separate full-width row - the row is busy enough with the summary
   panel beside it. */
.atlas-zoom-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; z-index: 10; }
.atlas-zoom-controls .btn { background: rgba(10,15,26,.65); backdrop-filter: blur(6px); box-shadow: 0 2px 8px rgba(0,0,0,.25); }
@media (max-width: 640px) {
  .atlas-zoom-controls { top: 6px; right: 6px; gap: 3px; }
  .atlas-zoom-controls .btn { min-height: 30px; min-width: 30px; padding: 0 6px; font-size: 12px; }
  .atlas-zoom-controls .mono { min-width: 38px !important; font-size: 11.5px; }
}

/* Step badge - floats top-LEFT of the stage (zoom controls own top-right),
   visible while watching without needing to look down at the dots row. */
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

/* Fullscreen - the stage detaches from the row layout and fills the
   viewport. Everything inside it (zoom controls, step badge, the diagram
   itself) is unchanged; only the container's own position/size changes. */
.atlas-stage-fullscreen {
  position: fixed !important; inset: 0 !important; z-index: 200 !important;
  height: 100dvh !important; width: 100vw !important; border-radius: 0 !important;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}


/* Legend - full width, below the diagram+summary row, since it's
   reference material to glance at rather than primary content. */
.atlas-legend-full .atlas-legend-grid {
  display: grid;
  /* 200px minimum so a longer label like "Atrioventricular (AV) node" fits
     on one line without colliding with its neighbour. Drops to a single
     full-width column automatically on phones. */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  /* 8px between rows, 16px between columns - the tighter 6px gap was
     letting wrapped labels visibly touch the item below them. */
  gap: 8px 16px;
  margin-top: 10px;
}
/* Long labels wrap inside their own cell rather than pushing the cell wider
   and shoving the row out of alignment. */
.atlas-legend-full .atlas-legend-grid .btn {
  white-space: normal;
  word-break: break-word;
  line-height: 1.35;
  padding: 8px 10px;
  min-height: 36px;
}

/* Respect the OS/browser "reduce motion" setting - the pulse/shake/snap
   animations above are convenience feedback, not load-bearing, so turning
   them off here never breaks anything, it just stops moving. */
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
  return (
    <div style={{ marginTop: 16 }}>
      <button className="back" onClick={onBack}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        {ATLAS_COURSE_NAMES[courseId] || courseId}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {list.map((d) => (
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
/* Screen 3+4 - the diagram viewer: play bar on top, diagram+summary */
/* row below, legend below that. Zoom/pan live on the diagram panel. */
/* ---------------------------------------------------------------- */
function DiagramViewer({ diagramId, breadcrumb, onBreadcrumb, onDrill, onExit, app }) {
  const diagram = DIAGRAMS[diagramId];
  const [activeLabelId, setActiveLabelId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  // Default zoom sits slightly under 1 so the whole diagram fits comfortably
  // on first open without the drawing touching the stage edges. The user can
  // still pinch/wheel/+/− to change it.
  const DEFAULT_ZOOM = 1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  // Muted still advances through the sequence on a timer (roughly how long
  // the narration would have taken to speak), it just doesn't speak -
  // Play always starting narration with no silent option was the gap here.
  const [muted, setMuted] = useState(false);

  const playTokenRef = useRef(0);
  const pinchRef = useRef(null);
  const stageRef = useRef(null);

  // Reset local view state whenever a new diagram is opened (drill-down or back)
    // Zoom helper used by the +/- buttons, the wheel, and pinch. Clamps to
  // MIN_ZOOM..MAX_ZOOM and rounds to 2 decimals so the label stays clean.
  const applyZoom = useCallback((nextZoomRaw) => {
    setZoom((prev) => {
      const target = typeof nextZoomRaw === "function" ? nextZoomRaw(prev) : nextZoomRaw;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +Number(target).toFixed(2)));
      return next;
    });
  }, []);

    useEffect(() => {
    setActiveLabelId(null);
    setActiveStep(0);
    setPlaying(false);
    setPaused(false);
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
        playTokenRef.current++;
    cachedVoiceRef.current = undefined;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
  }, [diagramId]);

  // Dev-time checks from the rule book (sections 4.1-4.3) - these were
  // written into the rule book but never actually wired into code. None of
  // this runs for students; it only warns in the console, so a mismatch is
  // caught the moment you build the next diagram instead of shipping silently
  // broken highlighting or grey legend circles.
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
            // A cyclic process (diagram.loop === true, e.g. the cardiac
            // cycle - a heartbeat has no "end") wraps back to step 0 and
            // keeps going. A one-shot process (the default) stops on its
            // final step, same as before.
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
  // Resolved once per diagram session (on the first spoken step) instead of
  // re-scanning window.speechSynthesis.getVoices() and re-picking on every
  // single narration step - the result never changes mid-playback, so
  // there's no reason to redo that work nine times for a nine-step diagram.
  const cachedVoiceRef = useRef(undefined); // undefined = not resolved yet, null = resolved to "no voice"
  const speakStep = useCallback((stepIdx) => {
    const text = diagram.narration[stepIdx];
    if (!text) return;
    const myToken = playTokenRef.current;

    if (muted || !("speechSynthesis" in window)) {
      // No voice - hold roughly as long as the narration would have taken
      // to speak (a rough words-per-minute estimate), then advance anyway,
      // so a muted walkthrough still moves through every step on its own.
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

    const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      setPaused(true);
      playTokenRef.current++;
      try { window.speechSynthesis.cancel(); } catch {}
      return;
    }
    const startAt = (!diagram.loop && !paused && activeStep === diagram.narration.length - 1) ? 0 : activeStep;
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

  // Keyboard controls - space play/pause, left/right step, Esc exits
  // fullscreen (or leaves the viewer if not fullscreen). Guarded against
  // firing while focus is in a text field elsewhere on the page.
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

  


    // Zoom / pointer handling. Panning is deliberately disabled - the figure
  // is locked to the center of the stage at all times. Only ZOOM is
  // interactive: mouse wheel on desktop, two-finger pinch on touch, and
  // the +/- buttons. A single-finger drag does nothing.
        // Wheel listeners are passive by default, so e.preventDefault() inside a
  // React onWheel prop silently fails (that's the console spam you saw) -
  // it has to be attached manually with { passive: false } to actually
  // stop page scroll while zooming.
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
  const dragRef = useRef(null); // { startX, startY, panX, panY } for single-pointer drag
  const onPointerDown = (e) => {
    // Deliberately NOT capturing the pointer for a single touch/click.
    // setPointerCapture routes the eventual `click` event to the stage div
    // instead of the actual target - which is why the +/- zoom buttons
    // never received their click. Capture only once a SECOND finger
    // arrives, which is the only time we actually need it (pinch).
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX, panY };
    }
    if (pointers.current.size === 2) {
      dragRef.current = null; // a second finger arriving cancels any single-finger drag in progress
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
      // Single-finger/mouse drag - pans the diagram. Up/down/left/right
      // movement, same gesture as any map or image viewer.
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

  return (
    <div style={{ marginTop: 16 }}>
      <style>{atlasStyles}</style>

      {/* breadcrumb + back - navigation stays at the very top */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 12, rowGap: 4 }}></div>
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

      {/* ---- Play bar - on top, like the note's own Listen bar ---- */}
                        <div className="card atlas-playbar">
        <button
          className="btn btn-a btn-sm"
          onClick={handlePlay}
          title={playing ? "Pause" : paused ? "Resume" : "Play"}
          aria-label={playing ? "Pause walkthrough" : paused ? "Resume walkthrough" : "Play walkthrough"}
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
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em" }}>
            {playing ? "Pause" : paused ? "Resume" : "Play"}
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
                <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", marginLeft: "auto" }}>Step {activeStep + 1} / {diagram.narration.length}</span>
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
      {/* ---- Diagram (left) + topic summary (right) ---- */}
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
            onWheel={onWheel}
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
                                    <div
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: dragRef.current ? "none" : "transform 0.15s ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "100%",
                maxHeight: "100%",
                willChange: "transform",
                cursor: "grab",
              }}
            >
              {diagram.render({ onLabelClick: setActiveLabelId, activeLabelId, activeStep, onOpenDrill: () => {} })}
            </div>
          </div>
        </div>

        <div className="atlas-summary-col card">
          <div className="eyebrow" style={{ marginBottom: 6 }}>About this topic</div>
          {/* Fixed, topic-level summary - stays constant while the animation
              plays. Pull this from the topic's actual note text (diagram.summary
              in diagrams.js); falls back to the title if a diagram hasn't had
              one written yet. */}
          <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.5 }}>
            {diagram.summary || diagram.title}
          </div>

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

                        {/* ---- Legend - full width, below the row ---- */}
      <div className="card atlas-legend-full" style={{ marginTop: 12 }}>
        <div className="eyebrow">Legend — tap any part to highlight it</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))", gap: 10, marginTop: 12 }}>
          {(diagram.labels || []).map((l) => {
            const active = activeLabelId === l.id;
            return (
              <button
                key={l.id}
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
      {/* actions */}
      <div className="divider" />
      {topTopic && (
        <button className="btn btn-g" style={{ width: "100%" }} onClick={() => app.go("topic", { courseId: topTopic.courseId, topicId: topTopic.topicIndex })}>
          Read the topic
        </button>
      )}
    </div>
  );
}

function Ic_chevR() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, verticalAlign: "-2px" }}><path d="M9 6l6 6-6 6" /></svg>;
}

/* ---------------------------------------------------------------- */
/* Screen 5 - the pathway builder. Not surfaced by any registered   */
/* diagram right now (see the file header) - kept intact so the     */
/* mechanic still works the moment a "type: builder" entry returns. */
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

      {/* sequence slots */}
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
    // If we're drilled into a child diagram, Back steps UP the breadcrumb
    // one level at a time instead of bouncing straight out to the list or
    // topic. Only when we're on the root diagram (breadcrumb length <= 1)
    // do we actually leave the viewer.
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
      {/* One shared <defs> block for every diagram, rendered once here
          instead of inside each diagram's own <svg>. Previously every
          diagram defined the SAME gradient/filter ids (atlas-glow,
          atlas-grad-trunk, etc.) independently, and VisualsList renders
          several diagrams' thumbnails on screen simultaneously - since
          SVG element ids are resolved against the whole HTML document,
          not scoped per-<svg>, that meant N duplicate definitions of the
          same ids coexisting at once. Harmless today only because every
          diagram's defs happen to be byte-identical; a single shared
          copy removes the duplication (and the risk) outright. */}
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
          breadcrumb={breadcrumb}
          onBreadcrumb={goToBreadcrumb}
          onDrill={drillInto}
          onExit={exitViewer}
          app={app}
        />
      )}

      {screen === "viewer" && diagram && diagram.type === "builder" && (
        <PathwayBuilder diagramId={diagramId} onExit={exitViewer} app={app} />
      )}
    </div>
  );
}
