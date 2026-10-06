// VitroView.jsx
// ------------------------------------------------------------
// ASCEND VITRO — the virtual laboratory.
//
// This tab is where the practical half of each practical topic
// gets done. A student reads the theory in a topic note, tests
// it with the tutor and MCQs, and then comes here to run the
// practical itself — pick the tube, load the sample, read the
// analyser, interpret the result, get scored.
//
// Nothing here calls the AI at runtime, nothing fetches, there
// are no new npm packages. Every visual will be plain SVG drawn
// by React, matching the same discipline as Atlas: one shared
// palette, one set of primitives, no ad-hoc hex codes.
//
// ------------------------------------------------------------------
// SCOPE OF THIS FILE, RIGHT NOW
//
// This is the shell. It renders the VITRO home screen (a list of
// the four bench families) and, when a practical is opened from a
// topic card, a placeholder card for that practical.
//
// The benches themselves — donning, tube-and-sample, instrument,
// slide-and-stain, interpretation — get built on top of this
// shell, one at a time, the same way Atlas grew.
//
// ------------------------------------------------------------------
// DESIGN DECISIONS LOCKED IN
//
// 1. VITRO is embedded in each practical course, not a separate
//    top-level tab. A student taps "Practise in VITRO" on a
//    topic card and lands here, with the practical preselected.
//
// 2. Four shared benches. Each practical is a script on top of
//    one bench, not a bespoke simulator. Thirty-seven practicals,
//    four benches.
//
// 3. Donning is a gating check, not a tutorial. Pass once per
//    session, then skip.
//    ("Donning" is the process; the garment is a lab coat, not a
//    hospital gown. The word matters — an MLS student wears a
//    reusable lab coat at the bench, not a disposable isolation
//    gown.)
//
// 4. Competency scoring, not points. Pass / not-yet-pass per
//    named competency.
//
// 5. Every wrong action produces a specific explanation — never
//    a generic "incorrect".
//
// 6. Every completed practical links back to the theory that
//    covers the errors the student made.
// ------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";

// ------------------------------------------------------------------
// The four bench families. Each is a distinct interaction model,
// shared by several practicals. Every entry here will eventually
// become a selectable card on the VITRO home screen.
//
// id           — used as the room key when navigating into it
// name         — display name on the home card
// tagline      — one line describing what happens on this bench
// practicals   — how many practicals across the curriculum use it
// ready        — has the bench been built yet?
//
// These counts are pulled from the six practical courses in the
// L100 S2 and L200 S1 sets and are not arbitrary:
//   tube            — 12 practicals (hemp, bc2p, ph2p)
//   instrument      — 7 practicals  (ph2p)
//   slide           — 14 practicals (micp, hemp)
//   interpretation  — 4 practicals  (phyp)
// ------------------------------------------------------------------
const BENCHES = [
  {
    id: "tube",
    name: "Tube & Sample Bench",
    tagline: "Pick the tube, draw the sample, load the analyser.",
    practicals: 12,
    ready: false,
  },
  {
    id: "instrument",
    name: "Instrument Bench",
    tagline: "Operate the device, read the value, compare to reference.",
    practicals: 7,
    ready: false,
  },
  {
    id: "slide",
    name: "Slide & Stain Bench",
    tagline: "Prepare the slide, stain it, examine it under the scope.",
    practicals: 14,
    ready: false,
  },
  {
    id: "interpretation",
    name: "Interpretation Bench",
    tagline: "Read the case, read the results, make the call.",
    practicals: 4,
    ready: false,
  },
];

// ------------------------------------------------------------------
// VitroHome — the VITRO landing screen, shown when VITRO is
// opened without a specific practical preselected.
//
// For now this just lists the four bench families and shows how
// many practicals each will hold. Once the first bench is built,
// its card becomes interactive and the others stay dimmed.
// ------------------------------------------------------------------
function VitroHome() {
  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          color: "var(--text-2)",
          marginTop: 0,
          maxWidth: "60ch",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        VITRO is where you practise the hands-on half of each practical
        topic. Read the theory in the note, test it with the tutor, then
        come here and run the practical on a real bench — the same steps,
        in the same order, with the same consequences when you get them
        wrong.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        {BENCHES.map((bench) => (
          <div
            key={bench.id}
            className="card"
            style={{
              opacity: bench.ready ? 1 : 0.72,
              cursor: bench.ready ? "pointer" : "default",
              transition: "opacity .15s, border-color .15s",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>
              {bench.name}
            </div>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: 12.5,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {bench.tagline}
            </div>
            <div
              className="mono"
              style={{
                color: bench.ready ? "var(--amber-2)" : "var(--text-3)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginTop: 10,
              }}
            >
              {bench.ready
                ? `${bench.practicals} PRACTICALS · READY`
                : `${bench.practicals} PRACTICALS · IN BUILD`}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "14px 16px",
          borderRadius: 12,
          border: "1px solid var(--line)",
          background: "var(--bg-2)",
        }}
      >
        <div
          className="eyebrow"
          style={{ marginBottom: 6, color: "var(--text-3)" }}
        >
          How to enter
        </div>
        <div
          style={{
            color: "var(--text-2)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          Every topic in a practical course has a{" "}
          <strong style={{ color: "var(--text)" }}>
            Practise in VITRO
          </strong>{" "}
          button on its card. Tapping it brings you straight to the
          bench that topic uses — no room picker, no navigation detour.
          The theory, the test, and the practical are three halves of
          the same topic, and the app treats them that way.
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// VitroBenchStyles — every keyframe used by the bench, the
// capillary, the tube, and the doffing fade-outs, rendered
// once at the top of VitroView. These used to live inside
// VitroDonning's <style> block, which unmounted the moment the
// student left the donning screen — so the bench's animations
// (tube wipe, clay drop, capillary seal) silently did nothing.
// Rendering them here means the keyframes exist for the whole
// session, regardless of which component is mounted.
//
// React will keep this in the DOM as long as VitroView is
// mounted, and it is cheap — a single <style> tag with a
// dozen keyframes.
// ------------------------------------------------------------------
function VitroBenchStyles() {
  return (
    <style>{`
      @keyframes vitro-fade-in { from { opacity: 0 } to { opacity: 1 } }
      @keyframes vitro-coat-in {
        from { transform: translate(-40px, -20px); opacity: 0 }
        to   { transform: translate(0, 0);         opacity: 1 }
      }
      @keyframes vitro-mask-in {
        from { transform: translateY(-30px); opacity: 0 }
        to   { transform: translateY(0);     opacity: 1 }
      }
      @keyframes vitro-eye-in {
        from { transform: translateX(30px); opacity: 0 }
        to   { transform: translateX(0);    opacity: 1 }
      }
      @keyframes vitro-glove-in {
        from { transform: translateY(30px) scale(0.6); opacity: 0 }
        to   { transform: translateY(0)    scale(1);   opacity: 1 }
      }
      @keyframes vitro-wash-pulse {
        0%   { opacity: 0; transform: scale(0.6) }
        40%  { opacity: 1; transform: scale(1.15) }
        100% { opacity: 1; transform: scale(1) }
      }
      .vitro-anim-coat  { animation: vitro-coat-in  550ms cubic-bezier(.2,.9,.3,1) both }
      .vitro-anim-mask  { animation: vitro-mask-in  550ms cubic-bezier(.2,.9,.3,1) both }
      .vitro-anim-eye   { animation: vitro-eye-in   550ms cubic-bezier(.2,.9,.3,1) both }
      .vitro-anim-glove { animation: vitro-glove-in 550ms cubic-bezier(.2,.9,.3,1) both }
      .vitro-anim-wash  { animation: vitro-wash-pulse 550ms ease-out both }
      .vitro-anim-fade  { animation: vitro-fade-in 300ms ease-out both }
      @keyframes vitro-label-appear {
        0%   { opacity: 0; transform: scale(0.6) }
        60%  { opacity: 1; transform: scale(1.08) }
        100% { opacity: 1; transform: scale(1) }
      }
      @keyframes vitro-tube-shake {
        0%, 100% { transform: rotate(0deg) }
        25%      { transform: rotate(-3deg) }
        75%      { transform: rotate(3deg) }
      }
      .vitro-anim-label-appear {
        animation: vitro-label-appear 400ms cubic-bezier(.2,.9,.3,1) both;
      }
      .vitro-anim-tube-shake {
        animation: vitro-tube-shake 400ms ease-in-out both;
      }
      @keyframes vitro-clay-drop {
        0%   { transform: translateY(-12px); opacity: 0 }
        60%  { transform: translateY(0);     opacity: 1 }
        100% { transform: translateY(0);     opacity: 1 }
      }
      .vitro-anim-clay-drop {
        animation: vitro-clay-drop 400ms cubic-bezier(.2,.9,.3,1) both;
        transform-origin: center top;
      }
      @keyframes vitro-tube-wipe {
        0%   { transform: translate(0, 0) rotate(0deg) }
        30%  { transform: translate(-6px, 6px) rotate(-6deg) }
        60%  { transform: translate(-4px, 4px) rotate(4deg) }
        100% { transform: translate(0, 0) rotate(0deg) }
      }
      .vitro-anim-tube-wipe {
        animation: vitro-tube-wipe 700ms ease-in-out both;
        transform-origin: center bottom;
      }
      @keyframes vitro-capillary-seal {
        0%   { transform: translate(0, 0) }
        40%  { transform: translate(0, 12px) }
        100% { transform: translate(0, 0) }
      }
      .vitro-anim-capillary-seal {
        animation: vitro-capillary-seal 700ms ease-in-out both;
      }
      @keyframes vitro-rotor-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes vitro-led-blink {
        0%, 100% { opacity: 1 }
        50%      { opacity: 0.25 }
      }
      .vitro-rotor-spinning {
        animation: vitro-rotor-spin 0.35s linear infinite;
        transform-origin: 100px 78px;
      }
      .vitro-led-on  { animation: vitro-led-blink 0.6s ease-in-out infinite }
      @keyframes vitro-smear-appear {
        0%   { opacity: 0; transform: scale(0.4) }
        60%  { opacity: 1; transform: scale(1.08) }
        100% { opacity: 1; transform: scale(1) }
      }
      .vitro-anim-smear-appear {
        animation: vitro-smear-appear 400ms cubic-bezier(.2,.9,.3,1) both;
        transform-origin: 30px 18px;
      }
      @keyframes vitro-pit-appear {
        0%   { opacity: 0; transform: scale(0.3) }
        60%  { opacity: 1; transform: scale(1.15) }
        100% { opacity: 1; transform: scale(1) }
      }
      .vitro-anim-pit-appear {
        animation: vitro-pit-appear 400ms cubic-bezier(.2,.9,.3,1) both;
        transform-origin: 30px 15px;
      }
    `}</style>
  );
}
// ------------------------------------------------------------------
// VitroScientistSvg — one medical laboratory scientist, drawn
// as a full-body SVG. Two figures exist, male and female, and
// they are distinct people, not the same figure with a hair
// swap. The male is broader at the shoulders and straighter at
// the hip; the female is narrower at the shoulder, tapered at
// the waist, and wider at the hip. Each has a fixed palette so
// the two read as colleagues — two different scientists in the
// same lab — not one scientist drawn twice.
//
// Props:
//   sex      — "male" | "female"
//   stage    — "street"  (before donning, in their own clothes)
//              "donned"  (in lab coat, after the coat goes on)
//   height   — overall pixel height of the SVG
//
// Both figures share the same skeleton: head, neck, torso, arms,
// hands, legs, feet. What differs is the silhouette path and
// the proportions, plus the hair shape. Everything else is the
// same drawing, tuned by two numbers.
// ------------------------------------------------------------------
function VitroScientistSvg({ sex = "male", stage = "street", height = 220 }) {
  const isFemale = sex === "female";

  // ---- Identity colours (literal hex — represent the person/garment) ----
  const skin = isFemale ? "#C68642" : "#6B4226";
  const hair = "#1B1210";
  const underlayer = isFemale ? "#4C6B5A" : "#3E5E7A";
  const trousers = "#2E3A55";
  const shoeColor = "#1B1B1F";
  const coatColor = "#F4F6FA";
  const coatShade = "#E8EDF5";
  const faceDot = "#2A2016";
  const mlsRed = "#B91C1C";
  const mlsBlack = "#1A1A1A";

  const cx = 70;

  // ---- Fixed anchors — do not move; parent overlays depend on these ----
  const headCy = 46;
  const headR = 20;
  const eyeY = 44;
  const eyeXLeft = 60;
  const eyeXRight = 80;
  const shoulderY = 82;
  const waistY = 130;
  const hipY = 150;
  const ankleY = 226;
  const footY = 243;
  const handY = 179;
  const handXLeft = 32;
  const handXRight = 108;

  // ---- Sex-specific silhouette ----
  const shoulderHalf = isFemale ? 27 : 34;
  const waistHalf = isFemale ? 14 : 23;
  const hipHalf = isFemale ? 26 : 18;
  const collarHalf = 7;
  const neckTopY = isFemale ? 60 : 68;

  const shoulderXLeft = cx - shoulderHalf + 6;
  const shoulderXRight = cx + shoulderHalf - 6;

  // ---- Coat geometry ----
  const coatShoulderHalf = shoulderHalf + 5;
  const coatChestHalf = shoulderHalf + 8;
  const coatHemHalf = shoulderHalf + 4;
  const coatHemY = 200;
  const coatNeckY = 84;
  const coatVPointY = 150;

  // Sleeve cuff pinned to the hand anchor itself.
  const cuffY = handY - 10;

  const label = isFemale
    ? "Female medical laboratory scientist"
    : "Male medical laboratory scientist";

  const Hand = ({ hx, hy, mirrored }) => {
    const d = mirrored ? -1 : 1;
    return (
      <g>
        <path
          d={`M${hx - 6 * d},${hy - 8}
              Q${hx - 9 * d},${hy - 2} ${hx - 8 * d},${hy + 6}
              Q${hx - 6 * d},${hy + 11} ${hx},${hy + 11}
              Q${hx + 7 * d},${hy + 10} ${hx + 7 * d},${hy + 2}
              Q${hx + 7 * d},${hy - 7} ${hx + 2 * d},${hy - 9}
              Z`}
          fill={skin}
          stroke="var(--line-2)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d={`M${hx - 5 * d},${hy - 8} Q${hx - 5 * d},${hy - 12} ${hx - 3 * d},${hy - 12}`} fill="none" stroke="var(--line-2)" strokeWidth="1" strokeLinecap="round" />
        <path d={`M${hx - 2 * d},${hy - 9} Q${hx - 2 * d},${hy - 13} ${hx},${hy - 13}`} fill="none" stroke="var(--line-2)" strokeWidth="1" strokeLinecap="round" />
        <path d={`M${hx + 1 * d},${hy - 9} Q${hx + 1 * d},${hy - 13} ${hx + 3 * d},${hy - 13}`} fill="none" stroke="var(--line-2)" strokeWidth="1" strokeLinecap="round" />
        <path d={`M${hx - 6 * d},${hy - 6} Q${hx - 11 * d},${hy - 5} ${hx - 10 * d},${hy + 1}`} fill="none" stroke="var(--line-2)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  };

  const Braid = ({ rootX, rootY, endX, endY, width, curve }) => {
    const midX = rootX + (endX - rootX) * 0.5 + curve;
    const midY = rootY + (endY - rootY) * 0.5;
    const w1 = width;
    const w2 = width * 0.55;
    const outline = `M${rootX - w1 / 2},${rootY}
      Q${midX - w1 / 2 + curve * 0.3},${midY} ${endX - w2 / 2},${endY}
      Q${endX},${endY + 3} ${endX + w2 / 2},${endY}
      Q${midX + w1 / 2 + curve * 0.3},${midY} ${rootX + w1 / 2},${rootY}
      Z`;
    const ties = [];
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const qx = (1 - t) * (1 - t) * rootX + 2 * (1 - t) * t * midX + t * t * endX;
      const qy = (1 - t) * (1 - t) * rootY + 2 * (1 - t) * t * midY + t * t * endY;
      const tickW = w1 - (w1 - w2) * t;
      ties.push(
        <line
          key={i}
          x1={qx - tickW / 2.4}
          y1={qy - 1.1}
          x2={qx + tickW / 2.4}
          y2={qy + 1.1}
          stroke="var(--line-2)"
          strokeWidth="0.6"
          opacity="0.55"
          strokeLinecap="round"
        />
      );
    }
    return (
      <g>
        <path d={outline} fill={hair} stroke="var(--line-2)" strokeWidth="1" strokeLinejoin="round" />
        {ties}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 140 260"
      width={(height / 260) * 140}
      style={{ display: "block" }}
      role="img"
      aria-label={label}
    >
      {/* ---------- 1. Legs (trousers) ---------- */}
      <path
        d={`M${cx - waistHalf},${waistY}
            L${cx - hipHalf},${hipY}
            L${cx - 13},${ankleY}
            L${cx - 4},${ankleY}
            L${cx - 3},${hipY + 10}
            L${cx + 3},${hipY + 10}
            L${cx + 4},${ankleY}
            L${cx + 13},${ankleY}
            L${cx + hipHalf},${hipY}
            L${cx + waistHalf},${waistY}
            Z`}
        fill={trousers}
        stroke="var(--line-2)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1={cx - waistHalf + 2} y1={waistY} x2={cx + waistHalf - 2} y2={waistY} stroke="var(--line-2)" strokeWidth="1" opacity="0.5" />

      {/* ---------- 2. Shoes ---------- */}
      <path
        d={`M${cx - 15},${ankleY} L${cx - 3},${ankleY} L${cx - 3},${footY - 5}
            Q${cx - 6},${footY - 1} ${cx - 12},${footY}
            Q${cx - 20},${footY + 0.5} ${cx - 24},${footY - 5}
            Q${cx - 25},${footY - 9} ${cx - 15},${ankleY} Z`}
        fill={shoeColor}
        stroke="var(--line-2)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1={cx - 22} y1={footY - 2} x2={cx - 6} y2={footY - 2.5} stroke="var(--bg-2)" strokeWidth="0.8" opacity="0.6" />
      <path
        d={`M${cx + 15},${ankleY} L${cx + 3},${ankleY} L${cx + 3},${footY - 5}
            Q${cx + 6},${footY - 1} ${cx + 12},${footY}
            Q${cx + 20},${footY + 0.5} ${cx + 24},${footY - 5}
            Q${cx + 25},${footY - 9} ${cx + 15},${ankleY} Z`}
        fill={shoeColor}
        stroke="var(--line-2)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1={cx + 6} y1={footY - 2.5} x2={cx + 22} y2={footY - 2} stroke="var(--bg-2)" strokeWidth="0.8" opacity="0.6" />

      {/* ---------- 3. Torso underlayer (shirt) ---------- */}
      <path
        d={`M${shoulderXLeft - 6},${shoulderY}
            Q${cx - shoulderHalf - 3},${shoulderY + 22} ${cx - waistHalf},${waistY}
            L${cx - collarHalf},${neckTopY + 10}
            L${cx},${neckTopY + 16}
            L${cx + collarHalf},${neckTopY + 10}
            L${cx + waistHalf},${waistY}
            Q${cx + shoulderHalf + 3},${shoulderY + 22} ${shoulderXRight + 6},${shoulderY}
            L${cx + collarHalf + 2},${shoulderY - 6}
            L${cx},${shoulderY + 6}
            L${cx - collarHalf - 2},${shoulderY - 6}
            Z`}
        fill={underlayer}
        stroke="var(--line-2)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ---------- 4. Collar of the underlayer (only matters for "street"
           stage — once the coat goes on in step 11, the coat's solid
           closed neckline sits on top and fully hides this) ---------- */}
      <path d={`M${cx - 6},${neckTopY + 10} L${cx},${neckTopY} L${cx + 6},${neckTopY + 10} Z`} fill={underlayer} stroke="var(--line-2)" strokeWidth="1.5" strokeLinejoin="round" />

      {/* ---------- 5. Neck ---------- */}
      <rect x={cx - 6} y={neckTopY} width="12" height={shoulderY - neckTopY + 2} rx="3" fill={skin} stroke="var(--line-2)" strokeWidth="1.5" />

      {/* ---------- 6. Head ---------- */}
      <circle cx={cx} cy={headCy} r={headR} fill={skin} stroke="var(--line-2)" strokeWidth="2" />

      {/* ---------- 7. Hair ---------- */}
      {isFemale ? (
        <>
          <path
            d="M49,38 Q47,19 70,17 Q93,19 91,38 Q91,27 70,23 Q49,27 49,38 Z"
            fill={hair}
            stroke="var(--line-2)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <line x1="70" y1="18" x2="70" y2="26" stroke="var(--line-2)" strokeWidth="0.6" opacity="0.4" />
          <Braid rootX={52} rootY={30} endX={47} endY={70} width={5.5} curve={-3} />
          <Braid rootX={59} rootY={23} endX={51} endY={74} width={5} curve={-2} />
          <Braid rootX={81} rootY={23} endX={89} endY={74} width={5} curve={2} />
          <Braid rootX={88} rootY={30} endX={93} endY={70} width={5.5} curve={3} />
          <ellipse cx="47" cy="70" rx="3.2" ry="1.8" fill="var(--line-2)" opacity="0.55" />
          <ellipse cx="93" cy="70" rx="3.2" ry="1.8" fill="var(--line-2)" opacity="0.55" />
        </>
      ) : (
        <>
          <path
            d="M51,37 Q51,23 70,21 Q89,23 89,37 Q89,28 70,26 Q51,28 51,37 Z"
            fill={hair}
            stroke="var(--line-2)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M51,37 Q48,40 49,44 Q50,41 52,38 Z" fill={hair} opacity="0.45" />
          <path d="M49,43 Q47.5,46.5 50,48 Q49.5,45.5 51,43.5 Z" fill={hair} opacity="0.2" />
          <path d="M89,37 Q92,40 91,44 Q90,41 88,38 Z" fill={hair} opacity="0.45" />
          <path d="M91,43 Q92.5,46.5 90,48 Q90.5,45.5 89,43.5 Z" fill={hair} opacity="0.2" />
          <path d="M60,23.5 Q70,21.5 80,23.5" fill="none" stroke="var(--line-2)" strokeWidth="0.6" opacity="0.5" />
        </>
      )}

      {/* ---------- 8. Face ---------- */}
      <circle cx={eyeXLeft} cy={eyeY} r="2.4" fill={faceDot} />
      <circle cx={eyeXRight} cy={eyeY} r="2.4" fill={faceDot} />
      <path d="M63,54 Q70,58 77,54" fill="none" stroke={faceDot} strokeWidth="2" strokeLinecap="round" />

      {/* ---------- 9. Arms ---------- */}
      <path d={`M${shoulderXLeft},${shoulderY + 6} Q${cx - shoulderHalf - 6},${shoulderY + 48} ${handXLeft},${cuffY}`} fill="none" stroke="var(--line-2)" strokeWidth="13" strokeLinecap="round" />
      <path d={`M${shoulderXLeft},${shoulderY + 6} Q${cx - shoulderHalf - 6},${shoulderY + 48} ${handXLeft},${cuffY}`} fill="none" stroke={underlayer} strokeWidth="10" strokeLinecap="round" />
      <path d={`M${shoulderXRight},${shoulderY + 6} Q${cx + shoulderHalf + 6},${shoulderY + 48} ${handXRight},${cuffY}`} fill="none" stroke="var(--line-2)" strokeWidth="13" strokeLinecap="round" />
      <path d={`M${shoulderXRight},${shoulderY + 6} Q${cx + shoulderHalf + 6},${shoulderY + 48} ${handXRight},${cuffY}`} fill="none" stroke={underlayer} strokeWidth="10" strokeLinecap="round" />

      {/* ---------- 10. Hands ---------- */}
      <Hand hx={handXLeft} hy={handY} mirrored={true} />
      <Hand hx={handXRight} hy={handY} mirrored={false} />

      {/* ---------- 11. Lab coat (donned only) ---------- */}
      {stage === "donned" && (
        <>
          {/* sleeves — drawn as thick stroked paths over the EXACT same
              curve as the arms, with a wider stroke than the arm's own
              outline (13) so no underlayer colour can peek through at any
              point along the bend, all the way down to the wrist */}
          <path d={`M${shoulderXLeft},${shoulderY + 4} Q${cx - shoulderHalf - 6},${shoulderY + 48} ${handXLeft},${cuffY}`} fill="none" stroke="var(--line-2)" strokeWidth="17" strokeLinecap="round" />
          <path d={`M${shoulderXLeft},${shoulderY + 4} Q${cx - shoulderHalf - 6},${shoulderY + 48} ${handXLeft},${cuffY}`} fill="none" stroke={coatShade} strokeWidth="14.5" strokeLinecap="round" />
          <path d={`M${shoulderXRight},${shoulderY + 4} Q${cx + shoulderHalf + 6},${shoulderY + 48} ${handXRight},${cuffY}`} fill="none" stroke="var(--line-2)" strokeWidth="17" strokeLinecap="round" />
          <path d={`M${shoulderXRight},${shoulderY + 4} Q${cx + shoulderHalf + 6},${shoulderY + 48} ${handXRight},${cuffY}`} fill="none" stroke={coatShade} strokeWidth="14.5" strokeLinecap="round" />

          {/* wrist cuffs — enlarged so they fully wrap the wrist and sit
              flush against the hand anchor, leaving no gap for the shirt
              colour to show before the glove overlay lands on top */}
          <ellipse cx={handXLeft} cy={cuffY + 2} rx="8.5" ry="7" fill={coatColor} stroke="var(--line-2)" strokeWidth="1.3" />
          <line x1={handXLeft - 7} y1={cuffY + 3} x2={handXLeft + 7} y2={cuffY + 3} stroke="var(--line-2)" strokeWidth="0.6" opacity="0.5" />
          <ellipse cx={handXRight} cy={cuffY + 2} rx="8.5" ry="7" fill={coatColor} stroke="var(--line-2)" strokeWidth="1.3" />
          <line x1={handXRight - 7} y1={cuffY + 3} x2={handXRight + 7} y2={cuffY + 3} stroke="var(--line-2)" strokeWidth="0.6" opacity="0.5" />

          {/* coat body — shoulders to mid-thigh. Neckline is now a solid,
              closed edge (no centre dip) so the underlayer collar/shirt is
              completely hidden; only bare neck above and trousers below
              the hem remain visible, as intended */}
          <path
            d={`M${cx - collarHalf - 6},${coatNeckY - 6}
                L${cx - coatShoulderHalf},${coatNeckY}
                Q${cx - coatChestHalf},${(coatNeckY + hipY) / 2} ${cx - coatHemHalf},${coatHemY}
                L${cx + coatHemHalf},${coatHemY}
                Q${cx + coatChestHalf},${(coatNeckY + hipY) / 2} ${cx + coatShoulderHalf},${coatNeckY}
                L${cx + collarHalf + 6},${coatNeckY - 6}
                Q${cx},${coatNeckY - 2} ${cx - collarHalf - 6},${coatNeckY - 6}
                Z`}
            fill={coatColor}
            stroke="var(--line-2)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* lapel fold-lines — decorative stitching on the solid coat
              surface, not a cut-out, so nothing underneath shows through */}
          <path d={`M${cx - collarHalf - 6},${coatNeckY - 6} L${cx - 7},${coatVPointY}`} fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
          <path d={`M${cx + collarHalf + 6},${coatNeckY - 6} L${cx + 7},${coatVPointY}`} fill="none" stroke="var(--line-2)" strokeWidth="1.5" />

          {/* front seam */}
          <line x1={cx} y1={coatVPointY} x2={cx} y2={coatHemY - 4} stroke="var(--line-2)" strokeWidth="1" opacity="0.7" />

          {/* side seams */}
          <path d={`M${cx - coatShoulderHalf + 4},${coatNeckY + 6} Q${cx - coatChestHalf + 4},${(coatNeckY + hipY) / 2} ${cx - coatHemHalf + 4},${coatHemY - 4}`} fill="none" stroke="var(--line-2)" strokeWidth="0.8" opacity="0.45" />
          <path d={`M${cx + coatShoulderHalf - 4},${coatNeckY + 6} Q${cx + coatChestHalf - 4},${(coatNeckY + hipY) / 2} ${cx + coatHemHalf - 4},${coatHemY - 4}`} fill="none" stroke="var(--line-2)" strokeWidth="0.8" opacity="0.45" />

          {/* ---------- MLS crest — high on the wearer's left chest (x > 70),
               like a school crest, red + black microscope ---------- */}
          <g transform={`translate(${cx + 13}, 96)`}>
            <path
              d="M-8,-7 L8,-7 L8,2 Q8,8 0,11 Q-8,8 -8,2 Z"
              fill={coatShade}
              stroke="var(--line-2)"
              strokeWidth="1"
            />
            <path
              d="M-6.5,-5.5 L6.5,-5.5 L6.5,1.5 Q6.5,6.5 0,9 Q-6.5,6.5 -6.5,1.5 Z"
              fill="none"
              stroke="var(--line-2)"
              strokeWidth="0.4"
              strokeDasharray="1 0.8"
              opacity="0.5"
            />
            <g strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0,-0.5) scale(0.82)">
              <line x1="-5.5" y1="5.5" x2="4.5" y2="5.5" stroke={mlsRed} strokeWidth="1.3" />
              <line x1="-4" y1="1.5" x2="3" y2="1.5" stroke={mlsRed} strokeWidth="1.1" />
              <line x1="-0.5" y1="5.5" x2="-0.5" y2="2.3" stroke={mlsRed} strokeWidth="1.1" />
              <path d="M1.5,-7.5 Q4.5,-4 3,1.5 Q2,4 -1,5.5" stroke={mlsBlack} strokeWidth="1" />
              <line x1="1.5" y1="-7.5" x2="-2" y2="1" stroke={mlsBlack} strokeWidth="1.2" />
              <line x1="2.3" y1="-9" x2="0" y2="-8.4" stroke={mlsBlack} strokeWidth="1.4" />
              <line x1="-2" y1="1" x2="-1.2" y2="1.5" stroke={mlsBlack} strokeWidth="1.4" />
              <circle cx="3" cy="-2.5" r="1" fill={mlsBlack} stroke="none" />
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
// ------------------------------------------------------------------
// VitroCharacterPicker — the "choose your medical laboratory
// scientist" screen. Two figures, side by side, one male and one
// female. Tapping either selects it and calls onPick("male" |
// "female"). The caller stores the choice and moves to the next
// step.
//
// No persistence here — the picker is dumb. Whoever renders it
// decides how long the choice lasts (the placeholder keeps it
// per session).
// ------------------------------------------------------------------
function VitroCharacterPicker({ onPick }) {
  const [hovered, setHovered] = useState(null);

  const Card = ({ sex, label }) => {
    const hover = hovered === sex;
    return (
      <button
        onClick={() => onPick && onPick(sex)}
        onMouseEnter={() => setHovered(sex)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(sex)}
        onBlur={() => setHovered(null)}
        className="card hover"
        style={{
          textAlign: "center",
          padding: "18px 14px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          border: hover ? "1.5px solid var(--amber)" : "1px solid var(--line)",
          background: hover ? "var(--bg-3)" : "var(--bg-2)",
          transition: "border-color .15s, background .15s, transform .15s",
          transform: hover ? "translateY(-2px)" : "none",
        }}
        aria-label={"Choose the " + label.toLowerCase() + " medical laboratory scientist"}
      >
        <div
          style={{
            padding: 8,
            borderRadius: 12,
            background: "var(--bg)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VitroScientistSvg sex={sex} stage="street" height={200} />
        </div>
        <div style={{ fontWeight: 750, fontSize: 14.5, marginTop: 2 }}>
          {label}
        </div>
        <div
          style={{
            color: "var(--text-3)",
            fontSize: 12,
            lineHeight: 1.5,
            maxWidth: "26ch",
          }}
        >
          Medical laboratory scientist
        </div>
      </button>
    );
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{ borderColor: "var(--amber)", padding: 18 }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--amber-2)", marginBottom: 6 }}
        >
          VITRO · Step 1 of 3
        </div>
        <div style={{ fontWeight: 750, fontSize: 16, lineHeight: 1.35 }}>
          Choose your medical laboratory scientist.
        </div>
        <div
          style={{
            color: "var(--text-2)",
            fontSize: 13,
            marginTop: 8,
            lineHeight: 1.55,
            maxWidth: "60ch",
          }}
        >
          You will run every practical in this session as the scientist
          you pick. The choice lasts until you close the app.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 16,
        }}
      >
        <Card sex="male" label="Male" />
        <Card sex="female" label="Female" />
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// VitroEnterLab — the transition screen between donning and the
// bench. The student sees their scientist, fully dressed, standing
// at the lab door. The voice tells them to tap the button that
// says Enter the lab. When they do, the bench renders.
//
// This exists so that the moment of entering the lab is a
// discrete action, not an implicit one. In a real lab, you do
// not slide from the changing area onto the bench — you walk in
// through a door. The screen mirrors that.
// ------------------------------------------------------------------
function VitroEnterLab({ character, onEnter, speak }) {
  const isFemale = character === "female";
  const ENTER_KEY = "ascend_vitro_enter_prompt_played";

  useEffect(() => {
    if (typeof speak !== "function") return;
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(ENTER_KEY) === "1";
    } catch {}
    if (alreadyPlayed) return;
    try {
      sessionStorage.setItem(ENTER_KEY, "1");
    } catch {}
    speak(
      "Your personal protective equipment is on and correctly fitted. The door to the laboratory is in front of you. Tap the button that says Enter the lab to walk in and begin the practical."
    );
  }, [speak]);

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{
          borderColor: "var(--amber)",
          padding: 20,
          background: "var(--bg-2)",
        }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--amber-2)", marginBottom: 6 }}
        >
          VITRO · Step 3 of 3
        </div>
        <div style={{ fontWeight: 750, fontSize: 16, lineHeight: 1.35 }}>
          You are at the lab door.
        </div>
        <div
          style={{
            color: "var(--text-2)",
            fontSize: 13.5,
            marginTop: 10,
            lineHeight: 1.6,
            maxWidth: "60ch",
          }}
        >
          Your PPE is on and correctly fitted. Walk into the
          laboratory and stand at the bench. The practical will begin
          the moment you enter.
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* The scientist at the lab door is fully dressed — mask,
            eyewear, and gloves on, because donning is complete.
            These are the same overlay paths VitroDonning uses
            when the item is placed, in the same coordinate
            space, so the figure renders identically to the last
            frame of the donning screen. */}
        <div style={{ position: "relative" }}>
          <VitroScientistSvg
            sex={isFemale ? "female" : "male"}
            stage="donned"
            height={220}
          />

          {/* Mask */}
          <svg
            viewBox="0 0 140 260"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d="M52,50 Q70,58 88,50 L86,64 Q70,68 54,64 Z"
              fill="#E8EDF5"
              stroke="var(--line-2)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>

          {/* Eyewear */}
          <svg
            viewBox="0 0 140 260"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <g
              stroke="#2A2016"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            >
              <rect x="54" y="37" width="13" height="11" rx="3" />
              <rect x="73" y="37" width="13" height="11" rx="3" />
              <line x1="67" y1="42" x2="73" y2="42" />
            </g>
          </svg>

          {/* Gloves */}
          <svg
            viewBox="0 0 140 260"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <g>
              <path
                d="M24,170 Q21,175 23,182 L23,187 Q23,191 28,191 L36,191 Q42,191 42,187 L42,171 Q42,165 36,165 Q30,165 26,167 Q24,168 24,170 Z"
                fill="#5B8DEF"
                stroke="var(--line-2)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M26,169 Q27,166 29,166 M31,166 Q32,164 34,165 M36,167 Q37,165 39,166"
                fill="none"
                stroke="var(--line-2)"
                strokeWidth="0.5"
                opacity="0.55"
              />
              <path
                d="M24,173 Q22,177 24,181"
                fill="none"
                stroke="var(--line-2)"
                strokeWidth="0.7"
                opacity="0.7"
              />
              <line
                x1="23"
                y1="187"
                x2="42"
                y2="187"
                stroke="var(--line-2)"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <path
                d="M116,170 Q119,175 117,182 L117,187 Q117,191 112,191 L104,191 Q98,191 98,187 L98,171 Q98,165 104,165 Q110,165 114,167 Q116,168 116,170 Z"
                fill="#5B8DEF"
                stroke="var(--line-2)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M114,169 Q113,166 111,166 M109,166 Q108,164 106,165 M104,167 Q103,165 101,166"
                fill="none"
                stroke="var(--line-2)"
                strokeWidth="0.5"
                opacity="0.55"
              />
              <path
                d="M116,173 Q118,177 116,181"
                fill="none"
                stroke="var(--line-2)"
                strokeWidth="0.7"
                opacity="0.7"
              />
              <line
                x1="98"
                y1="187"
                x2="117"
                y2="187"
                stroke="var(--line-2)"
                strokeWidth="0.8"
                opacity="0.6"
              />
            </g>
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          className="btn btn-a"
          style={{ padding: "12px 26px", fontSize: 15 }}
          onClick={() => onEnter && onEnter()}
        >
          Enter the lab
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// VitroDoffing — the gating check a student runs when leaving
// the lab. It is the reverse of donning, with one hazard:
// gloves come off first, and they come off without contaminating
// the hands.
//
// Order (the correct one): gloves, eyewear, lab coat, mask,
// hand hygiene. Removing the lab coat before the eyewear would
// mean reaching up past a clean face with contaminated sleeves;
// removing the mask before the coat would mean the coat sleeves
// brush a bare face. That is why the order matters.
//
// The screen structure mirrors VitroDonning: figure on the
// left, cart on the right, step headline with a short
// instruction, a voice that names the button, error panel
// with a specific explanation for each out-of-order tap.
// ------------------------------------------------------------------
const DOFFING_STEPS = [
  {
    id: "gloves",
    label: "Gloves",
    why: "Gloves come off first, before anything else. They are the most contaminated item on you. Remove them by peeling them inside-out from the wrist, without touching your skin.",
  },
  {
    id: "eye",
    label: "Eyewear",
    why: "Eyewear comes off next, after the gloves. With bare hands that are washed or at least not glove-contaminated, you can handle the eyewear frame safely.",
  },
  {
    id: "gown",
    label: "Lab coat",
    why: "The lab coat comes off after the eyewear. You unfasten it, pull it away from your shoulders without touching your face, and fold it inside-out for disposal or laundering.",
  },
  {
    id: "mask",
    label: "Mask",
    why: "The mask comes off after the coat. Hold the mask by its ties or elastics, not the fabric — the front of the mask is the most contaminated side.",
  },
  {
    id: "wash",
    label: "Hand hygiene",
    why: "Hand hygiene is last, always. Even after you have removed all PPE, you wash your hands again. This is the single most important step in the whole doffing sequence.",
  },
];

const DOFFING_INSTRUCTIONS = {
  gloves:
    "Peel the gloves off inside-out, one at a time. Never touch your bare skin with the outside of a glove.",
  eye:
    "Remove the eyewear by the arms or the frame, not the lenses. Do not touch your face.",
  gown:
    "Unfasten the coat, pull it off by the shoulders, and fold it inside-out so the contaminated side stays inside.",
  mask:
    "Hold the mask by the ear loops or ties. Do not touch the fabric at the front.",
  wash:
    "Wash your hands with soap and water. Dry them fully with a paper towel.",
};

const DOFFING_NARRATION = {
  welcome:
    "You are leaving the laboratory. Before you go, you need to remove your personal protective equipment in the correct order. There are five steps. The order matters even more here than when you put the equipment on, because the outside of everything you are wearing is contaminated. I will talk you through it. When you are ready to begin, tap the Gloves button on the right.",
  step: {
    gloves:
      "First, the gloves. They come off before anything else, because they are the most contaminated item on you. Peel them off inside-out, so the outside of the glove ends up on the inside. Do not touch your bare skin with the outside of a glove. Tap the Gloves button on the right.",
    eye:
      "Next, the eyewear. Remove it by the frame, not the lenses. Your hands are bare now, so be careful not to touch your face. Tap the Eyewear button on the right.",
    gown:
      "Next, the lab coat. Unfasten it and pull it off by the shoulders. Fold it inside-out so the contaminated side stays inside. Tap the Lab coat button on the right.",
    mask:
      "Next, the mask. Hold it by the ear loops or the ties only. Do not touch the front of the mask, which is the most contaminated part. Tap the Mask button on the right.",
    wash:
      "Finally, hand hygiene. Even after all your PPE is off, you wash your hands one more time. This is the single most important step in doffing. Tap the Hand hygiene button on the right.",
  },
  wrongOrder: (nextLabel) =>
    `Not yet. That item does not come off next. The next item is ${nextLabel}. Tap the ${nextLabel} button on the right. If you are not sure why the order matters, the error panel on the screen explains what went wrong.`,
  complete:
    "You have doffed your personal protective equipment correctly, in the right order. You are ready to leave the laboratory. Well done.",
};

function VitroDoffing({ character, onPass, speak, stopSpeaking }) {
  const [removed, setRemoved] = useState([]);
  const [error, setError] = useState(null);
  const [animating, setAnimating] = useState(null);
  const welcomeSpokenRef = useRef(false);

  const nextStep = DOFFING_STEPS[removed.length] || null;
  const done = removed.length === DOFFING_STEPS.length;

  const ANIM_MS = 550;

  const STEP_HEADLINES = {
    gloves: "Remove the gloves.",
    eye: "Remove the eyewear.",
    gown: "Remove the lab coat.",
    mask: "Remove the mask.",
    wash: "Wash your hands.",
  };

  const DOFFING_ORDER_ERRORS = {
    eye: "The gloves come off first. They are the most contaminated item — everything else stays on until the gloves are gone.",
    gown:
      "The eyewear comes off before the coat. If you unfasten the coat while the eyewear is still on, your sleeves brush past the frame and the eye shield, and you contaminate the coat with what was on the shield.",
    mask:
      "The coat comes off before the mask. The sleeves of a lab coat are the most contaminated part of the coat — reaching up to unhook a mask with those sleeves still on spreads contamination to your face.",
    wash:
      "Hand hygiene comes last, always. It goes after every item has been removed, so that whatever was on the outside of your PPE ends up down the drain, not on your hands.",
  };

  // in doffing, an item is on the figure until it is removed.
  // so `has` here means "this item is still visible on the
  // figure" — the opposite of its meaning in vitrodonning.
  const has = (id) => !removed.includes(id);

  // Welcome line — once per session. Same sessionStorage pattern
  // as the donning welcome, so a refresh mid-doffing does not
  // replay it.
  const DOFFING_WELCOME_KEY = "ascend_vitro_doffing_welcome_played";
  useEffect(() => {
    if (typeof speak !== "function") return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(DOFFING_WELCOME_KEY) === "1";
    } catch {}

    if (alreadyPlayed) {
      welcomeSpokenRef.current = true;
      return;
    }

    // Only consume the session flag if the voice actually
    // started. Same onstart trick as the donning welcome.
    let started = false;
    let timer = null;
    speak(
      DOFFING_NARRATION.welcome,
      () => {},
      () => {
        started = true;
        if (timer) clearTimeout(timer);
        welcomeSpokenRef.current = true;
        try {
          sessionStorage.setItem(DOFFING_WELCOME_KEY, "1");
        } catch {}
      }
    );
    timer = setTimeout(() => {
      if (!started) welcomeSpokenRef.current = true;
    }, 500);

    return () => {
      if (timer) clearTimeout(timer);
      if (typeof stopSpeaking === "function") stopSpeaking();
    };
  }, [speak, stopSpeaking]);

  // Step guidance — silent on the first step (welcome covers it).
  useEffect(() => {
    if (typeof speak !== "function") return;
    if (animating) return;
    if (removed.length === 0) return;
    if (removed.length >= DOFFING_STEPS.length) return;
    const upcoming = DOFFING_STEPS[removed.length];
    if (!upcoming) return;
    const line = DOFFING_NARRATION.step[upcoming.id];
    if (line) speak(line);
  }, [removed.length, animating, speak]);

  const tap = (id) => {
    if (removed.includes(id)) return;
    if (animating) return;
    if (nextStep && id === nextStep.id) {
      setError(null);
      setAnimating(id);
      setTimeout(() => {
        setRemoved((prev) => [...prev, id]);
        setAnimating(null);
      }, ANIM_MS);
      if (removed.length + 1 === DOFFING_STEPS.length) {
        if (typeof speak === "function") {
          speak(DOFFING_NARRATION.complete, () => {
            setTimeout(() => {
              if (typeof onPass === "function") onPass();
            }, 500);
          });
        } else {
          setTimeout(() => {
            if (typeof onPass === "function") onPass();
          }, ANIM_MS + 800);
        }
      }
      return;
    }
    const skipped = nextStep;
    const entry = DOFFING_ORDER_ERRORS[id];
    const message =
      entry ||
      `That is not the next item. Remove ${skipped ? skipped.label : "the next item"} first.`;
    setError({ id, message });
    if (typeof speak === "function" && skipped) {
      speak(DOFFING_NARRATION.wrongOrder(skipped.label));
    }
  };

  const isFemale = character === "female";

  return (
    <div style={{ marginTop: 16 }}>
      <div className="card" style={{ borderColor: "var(--amber)", padding: 18 }}>
        <div
          className="eyebrow"
          style={{ color: "var(--amber-2)", marginBottom: 6 }}
        >
          Doffing check
        </div>
        <div style={{ fontWeight: 750, fontSize: 16, lineHeight: 1.35 }}>
          {done
            ? "PPE removed. Correct order."
            : nextStep
            ? STEP_HEADLINES[nextStep.id]
            : "Ready."}
        </div>
        {!done && nextStep && (
          <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>
            Step {removed.length + 1} of {DOFFING_STEPS.length}
          </div>
        )}
        {!done && nextStep && DOFFING_INSTRUCTIONS[nextStep.id] && (
          <div
            style={{
              color: "var(--text-2)",
              fontSize: 13,
              lineHeight: 1.6,
              marginTop: 10,
              maxWidth: "60ch",
            }}
          >
            {DOFFING_INSTRUCTIONS[nextStep.id]}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(170px, 240px) 1fr",
          gap: 16,
          marginTop: 16,
          alignItems: "start",
        }}
      >
        <div
          className="card"
          style={{
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-2)",
          }}
        >
          <div style={{ position: "relative" }}>
            <VitroScientistSvg
              sex={isFemale ? "female" : "male"}
              stage={has("gown") ? "donned" : "street"}
              height={220}
            />
            {/* Mask, if still on */}
            {has("mask") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: animating === "mask" ? 0 : 1,
                  transition: "opacity 550ms ease-out",
                }}
              >
                <path
                  d="M52,50 Q70,58 88,50 L86,64 Q70,68 54,64 Z"
                  fill="#E8EDF5"
                  stroke="var(--line-2)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {/* Eyewear, if still on */}
            {has("eye") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: animating === "eye" ? 0 : 1,
                  transition: "opacity 550ms ease-out",
                }}
              >
                <g
                  stroke="#2A2016"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                >
                  <rect x="54" y="37" width="13" height="11" rx="3" />
                  <rect x="73" y="37" width="13" height="11" rx="3" />
                  <line x1="67" y1="42" x2="73" y2="42" />
                </g>
              </svg>
            )}
            {/* Gloves, if still on */}
            {has("gloves") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: animating === "gloves" ? 0 : 1,
                  transition: "opacity 550ms ease-out",
                }}
              >
                <g>
                  <path
                    d="M24,170 Q21,175 23,182 L23,187 Q23,191 28,191 L36,191 Q42,191 42,187 L42,171 Q42,165 36,165 Q30,165 26,167 Q24,168 24,170 Z"
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M116,170 Q119,175 117,182 L117,187 Q117,191 112,191 L104,191 Q98,191 98,187 L98,171 Q98,165 104,165 Q110,165 114,167 Q116,168 116,170 Z"
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            )}
            {/* Hand hygiene sparkle after wash */}
            {animating === "wash" && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <g
                  className="vitro-anim-wash"
                  fill="none"
                  stroke="#54D08A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M26 166 l0 -5 M23 168 l-5 -3 M29 168 l5 -3" />
                  <path d="M110 166 l0 -5 M107 168 l-5 -3 M113 168 l5 -3" />
                </g>
              </svg>
            )}
            {/* Contamination spot on wrong tap */}
            {error && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <g>
                  <circle cx="98" cy="96" r="5" fill="#F0776A" opacity="0.9" />
                  <circle cx="100" cy="98" r="2" fill="#F0776A" opacity="0.6" />
                </g>
              </svg>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {DOFFING_STEPS.map((s) => {
              const isPlaced = removed.includes(s.id);
              const isNext = nextStep && nextStep.id === s.id;
              const wasErrored = error && error.id === s.id;
              const isAnimatingNow = animating === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => tap(s.id)}
                  disabled={isPlaced || !!animating}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: wasErrored
                      ? "1.5px solid var(--bad)"
                      : isAnimatingNow
                      ? "1.5px solid var(--good)"
                      : isNext
                      ? "1.5px solid var(--amber)"
                      : isPlaced
                      ? "1px solid var(--line)"
                      : "1px solid var(--line-2)",
                    background: isPlaced
                      ? "var(--bg-2)"
                      : wasErrored
                      ? "var(--bad-dim)"
                      : isAnimatingNow
                      ? "var(--good-dim)"
                      : "var(--bg-3)",
                    color: isPlaced ? "var(--text-3)" : "var(--text)",
                    cursor: isPlaced || animating ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: isPlaced
                        ? "var(--good-dim)"
                        : isAnimatingNow
                        ? "var(--good)"
                        : "var(--bg-2)",
                      color: isPlaced
                        ? "var(--good)"
                        : isAnimatingNow
                        ? "#08210F"
                        : "var(--text-3)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {isPlaced ? "✓" : ""}
                  </span>
                  <span style={{ fontWeight: 650, fontSize: 13.5 }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div
              className="card"
              style={{
                marginTop: 12,
                borderColor: "var(--bad)",
                background: "var(--bad-dim)",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 750,
                  fontSize: 14,
                  color: "var(--bad)",
                  marginBottom: 6,
                }}
              >
                Out of order.
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                {error.message}
              </div>
              {nextStep && (
                <div
                  style={{
                    color: "var(--text)",
                    fontSize: 13,
                    marginTop: 8,
                    fontWeight: 650,
                  }}
                >
                  Next: {nextStep.label}. {nextStep.why}
                </div>
              )}
            </div>
          )}

          {done && (
            <div
              className="card"
              style={{
                marginTop: 12,
                borderColor: "var(--good)",
                background: "var(--good-dim)",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 750,
                  fontSize: 14,
                  color: "var(--good)",
                  marginBottom: 6,
                }}
              >
                PPE removed. Correct order.
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                Gloves, eyewear, lab coat, mask, hand hygiene. That
                is the correct doffing order. You are ready to leave.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// VitroDonning — the gating check every student runs before
// entering any bench.
//
// Five items, one correct order: hand hygiene, lab coat, mask,
// eyewear, gloves. Tapping out of order marks the character with
// a contamination spot, names the wrong step, and explains why
// the correct order is what it is. Passing the sequence stores a
// flag in sessionStorage for the rest of this session, so a
// student entering bench after bench only does it once per
// sitting — but a fresh session re-gates, because muscle memory
// is the point.
//
// The lab coat is not optional and not a hoodie-under-a-coat
// situation — the coat is the outer layer, over a clean
// underlayer, exactly as it is worn at the bench. The teaching
// beat before the coat commits is there so a student learns the
// rule, not just taps past it.
//
// The 2D figure and the supply icons are plain SVG drawn by
// React, matching the rest of ASCEND: no sprite art, no PNGs,
// one shared palette. When the student has an avatar set, the
// figure's skin tone, hair colour and gender cue follow it.
// ------------------------------------------------------------------
const DONNING_STEPS = [
  {
    id: "wash",
    label: "Hand hygiene",
    short: "Wash",
    why: "Hands are the single biggest route of cross-contamination. Before gloves, before gown, before anything — hands get washed and dried.",
  },
  {
    id: "gown",
    label: "Lab coat",
    short: "Lab coat",
    why: "The lab coat goes on before the mask and eyewear so that when you fasten it, you are not reaching up past a clean face with potentially contaminated sleeves.",
  },
  {
    id: "mask",
    label: "Mask",
    short: "Mask",
    why: "The mask is fitted before eyewear — putting glasses or goggles on afterwards means you can adjust the mask seal without touching a clean eye shield.",
  },
  {
    id: "eye",
    label: "Eyewear",
    short: "Eyewear",
    why: "Eyewear is last before gloves because the gloves are the item you must never use to touch your own face or eyes.",
  },
  {
    id: "gloves",
    label: "Gloves",
    short: "Gloves",
    why: "Gloves go on last, and only once. Everything that needs to be done with bare hands is already done; from here on, your hands are the barrier.",
  },
];

// ------------------------------------------------------------------
// STEP_INSTRUCTIONS — the visible paragraph under each donning
// headline. The headline is the name of the step; this is the
// one-sentence instruction that tells the student what they are
// about to do and why. The narrator reads the full guidance
// aloud; this is the on-screen shorthand so the student can
// follow silently.
// ------------------------------------------------------------------
const STEP_INSTRUCTIONS = {
  wash:
    "Wash your hands with soap and water, or with alcohol gel if hands are not visibly soiled. Dry them fully before anything else goes on.",
  gown:
    "Put on your lab coat before the mask or eyewear. Fasten it, then move on — the coat is the outer layer over your own clothes.",
  mask:
    "Fit the mask over nose and mouth. Press the metal strip at the top so it seals against the bridge of your nose.",
  eye:
    "Put on the eyewear over your eyes. Adjust the fit now, before the gloves go on.",
  gloves:
    "Put on one pair of gloves, and only now. Everything from this point on is treated as contaminated.",
};

// Which item was attempted out of order, and what the student
// should actually do first. Keyed by the id of the item that was
// tapped too early, with the id of the item they skipped.
const DONNING_ORDER_ERRORS = {
  gown: { shouldBe: "wash", why: "The lab coat and gloves both come after hand hygiene. Wash your hands first — the coat protects your clothes, it does not protect you from what is already on your hands." },
  mask: { shouldBe: "wash", why: "Wash your hands before fitting a mask. Otherwise you have just moved whatever is on your hands straight onto the mask surface — and the mask then sits against your face for the rest of the shift." },
  eye: { shouldBe: "wash", why: "Eyewear comes after the mask and lab coat. Start with hand hygiene, then lab coat, then mask, then eyewear." },
  gloves: { shouldBe: "wash", why: "Gloves are last, always. If you put them on now, you will have to touch the lab coat fastenings, the mask seal and the eyewear with dirty gloves — the exact contamination the sequence exists to prevent." },
  wash: null, // wash is the first step, so it can never be too early
};

// ------------------------------------------------------------------
// DONNING_NARRATION — what the voice says on the donning screen.
// The screen itself shows only short headlines; the voice does
// the teaching. That is deliberate: this is the moment a student
// learns the sequence, and hearing it while seeing the figure
// react is the whole point.
//
// `welcome` fires once when a student first arrives at donning.
// `step` fires each time a new step becomes the active one.
// `wrongOrder` fires when a tap is out of sequence, before the
// on-screen error panel appears.
// `complete` fires when all five items are placed.
// ------------------------------------------------------------------
const DONNING_NARRATION = {
  welcome:
    "Welcome to ASCEND VITRO. Before you can enter the laboratory, you need to put on your personal protective equipment in the correct order. There are five items. The order matters. A mistake at the bench can mean a contaminated sample, a false result, or a risk to you. I will talk you through it, one step at a time. When you are ready to begin, tap the Hand hygiene button on the right side of the screen.",
  step: {
    wash: "First, hand hygiene. Wash your hands with soap and water, or with alcohol gel if your hands are not visibly soiled. Dry them fully. Everything else goes on after clean hands, not before. Tap the Hand hygiene button on the right to do this.",
    gown: "Next, the lab coat. Your own clothing is not lab-safe, so the coat becomes the outer layer. Fasten it before you touch the mask or eyewear, so you are not reaching up past a clean face with contaminated sleeves. Tap the Lab coat button on the right to put it on.",
    mask: "Now the mask. Fit it over your nose and mouth, and press the metal strip at the top so it seals against the bridge of your nose. A mask that sits below the nose is not doing anything. Tap the Mask button on the right to fit it.",
    eye: "Next, eyewear. Glasses or goggles go on over your eyes, protecting you from splashes and aerosols. Fit them now, before gloves, so you can adjust the fit with clean hands. Tap the Eyewear button on the right to put them on.",
    gloves:
      "Finally, gloves. One pair, once, and only now. From this point on, your hands are the barrier. Everything you touch from here until you take them off must be treated as contaminated. Tap the Gloves button on the right to put them on.",
  },
  // wrongOrder is a function, not a string. It takes the label
  // of the item that should have been tapped next, and builds
  // a spoken correction that names the actual button. A student
  // who taps the wrong item hears precisely which button to tap.
  wrongOrder: (nextLabel) =>
    `Not yet. That item does not come next. The next item is ${nextLabel}. Tap the ${nextLabel} button on the right. If you are not sure why the order matters, the error panel on the screen explains what went wrong.`,
  complete:
    "Your personal protective equipment is on correctly, in the right order. You are ready to enter the laboratory. I will take you there now.",
};

function VitroDonning({ onPass, character, speak, stopSpeaking }) {
  const [placed, setPlaced] = useState([]);
  const [error, setError] = useState(null);
  const [animating, setAnimating] = useState(null);
  // Tracks whether the welcome line has already been spoken, so
  // it fires once on entry and not on every re-render.
  const welcomeSpokenRef = useRef(false);

  const nextStep = DONNING_STEPS[placed.length] || null;
  const done = placed.length === DONNING_STEPS.length;

  const ANIM_MS = 550;

  const STEP_HEADLINES = {
    wash: "Wash your hands.",
    gown: "Put on the lab coat.",
    mask: "Fit the mask.",
    eye: "Put on the eyewear.",
    gloves: "Put on the gloves — last.",
  };
    // ---- Donning voice ----
  // The welcome fires ONCE PER SESSION. A page refresh during
  // the same sitting does not replay it; closing the tab or
  // PWA and reopening does, because sessionStorage is scoped
  // to the tab's lifetime.
  //
  // Browsers block speech synthesis until the page has seen a
  // user gesture. In practice, the student tapped a scientist
  // card to get here, so autoplay is usually unlocked. If it
  // is not (a hard refresh, or a resumed PWA), a small
  // "Play introduction" button appears so the student can
  // start the welcome themselves. That button only appears if
  // autoplay was blocked.
  const WELCOME_KEY = "ascend_vitro_welcome_played";
  const [welcomeBlocked, setWelcomeBlocked] = useState(false);

  const markWelcomePlayed = () => {
    welcomeSpokenRef.current = true;
    try {
      sessionStorage.setItem(WELCOME_KEY, "1");
    } catch {}
  };

  useEffect(() => {
    if (typeof speak !== "function") return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(WELCOME_KEY) === "1";
    } catch {}

    if (alreadyPlayed) {
      welcomeSpokenRef.current = true;
      return;
    }

    // Attempt playback. The browser's speak() call does not
    // throw when autoplay is blocked — it silently drops the
    // utterance. The only reliable signal that speech actually
    // began is the utterance's onstart event. We arm a short
    // timer; if onstart has not fired by then, the browser
    // blocked it, and we show the manual Play button instead
    // of consuming the session flag.
    let started = false;
    let timer = null;
    speak(
      DONNING_NARRATION.welcome,
      // onEnd
      () => {},
      // onStart
      () => {
        started = true;
        if (timer) clearTimeout(timer);
        markWelcomePlayed();
      }
    );

    timer = setTimeout(() => {
      if (!started && !welcomeSpokenRef.current) {
        setWelcomeBlocked(true);
      }
    }, 500);

    return () => {
      if (timer) clearTimeout(timer);
      if (typeof stopSpeaking === "function") stopSpeaking();
    };
  }, [speak, stopSpeaking]);

  const playWelcomeManually = () => {
    if (typeof speak !== "function") return;
    speak(
      DONNING_NARRATION.welcome,
      () => {},
      () => {
        setWelcomeBlocked(false);
        markWelcomePlayed();
      }
    );
  };

  // Speak the next step's guidance whenever a new step becomes
  // active. The exception: do not speak on the very first step
  // (placed.length === 0), because that is the welcome's job.
  // The welcome itself ends with the "tap Hand hygiene" line,
  // so the first step is already covered. Queuing the wash
  // guidance on top of the welcome is what was cutting the
  // welcome off mid-sentence.
  useEffect(() => {
    if (typeof speak !== "function") return;
    if (animating) return;
    if (placed.length === 0) return;
    if (placed.length >= DONNING_STEPS.length) return;
    const upcoming = DONNING_STEPS[placed.length];
    if (!upcoming) return;
    const line = DONNING_NARRATION.step[upcoming.id];
    if (line) speak(line);
  }, [placed.length, animating, speak]);
  const tap = (id) => {
    if (placed.includes(id)) return;
    if (animating) return;
    if (nextStep && id === nextStep.id) {
      setError(null);
      setAnimating(id);
      setTimeout(() => {
        setPlaced((prev) => [...prev, id]);
        setAnimating(null);
      }, ANIM_MS);
      if (placed.length + 1 === DONNING_STEPS.length) {
        // Speak the completion line with an onEnd callback.
        // Only advance to the bench when the voice has actually
        // finished the sentence — this is the fix for the
        // donning-to-bench transition chopping the completion
        // mid-word.
        if (typeof speak === "function") {
          speak(DONNING_NARRATION.complete, () => {
            // Small beat after the voice ends, before the
            // screen changes. Feels like a natural pause,
            // not a hard cut.
            setTimeout(() => {
              if (typeof onPass === "function") onPass();
            }, 500);
          });
        } else {
          // No voice available. Advance on a fixed timer so
          // the student still sees the completed figure for
          // a moment.
          setTimeout(() => {
            if (typeof onPass === "function") onPass();
          }, ANIM_MS + 800);
        }
      }
      return;
    }
    const wrongItem = DONNING_STEPS.find((s) => s.id === id);
    const skipped = nextStep;
    const entry = DONNING_ORDER_ERRORS[id];
    const message =
      entry && entry.why
        ? entry.why
        : `${wrongItem ? wrongItem.label : "That"} is not the next step. ${skipped ? skipped.label + " first." : ""}`.trim();
    setError({ id, message });
    if (typeof speak === "function" && skipped) {
      // Name the actual button the student should have tapped,
      // so the correction is actionable rather than descriptive.
      speak(DONNING_NARRATION.wrongOrder(skipped.label));
    }
  };

  // The picked scientist drives the figure. The donning check
  // no longer reads the student's ASCEND avatar — the two
  // scientists are their own fixed identities, chosen on the
  // picker screen a moment ago.
  const isFemale = character === "female";

  const has = (id) => placed.includes(id) || animating === id;

  // The donning figure no longer carries its own outline colour
  // or identity colours — both come from VitroScientistSvg, which
  // owns its own palette. This used to hold a `figureStroke`
  // constant for the inline figure; that figure is gone now.

  return (
    <div style={{ marginTop: 16 }}>
      <style>{`
        @keyframes vitro-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vitro-coat-in {
          from { transform: translate(-40px, -20px); opacity: 0 }
          to   { transform: translate(0, 0);         opacity: 1 }
        }
        @keyframes vitro-mask-in {
          from { transform: translateY(-30px); opacity: 0 }
          to   { transform: translateY(0);     opacity: 1 }
        }
        @keyframes vitro-eye-in {
          from { transform: translateX(30px); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes vitro-glove-in {
          from { transform: translateY(30px) scale(0.6); opacity: 0 }
          to   { transform: translateY(0)    scale(1);   opacity: 1 }
        }
        @keyframes vitro-wash-pulse {
          0%   { opacity: 0; transform: scale(0.6) }
          40%  { opacity: 1; transform: scale(1.15) }
          100% { opacity: 1; transform: scale(1) }
        }
        .vitro-anim-coat  { animation: vitro-coat-in  550ms cubic-bezier(.2,.9,.3,1) both }
        .vitro-anim-mask  { animation: vitro-mask-in  550ms cubic-bezier(.2,.9,.3,1) both }
        .vitro-anim-eye   { animation: vitro-eye-in   550ms cubic-bezier(.2,.9,.3,1) both }
        .vitro-anim-glove { animation: vitro-glove-in 550ms cubic-bezier(.2,.9,.3,1) both }
        .vitro-anim-wash  { animation: vitro-wash-pulse 550ms ease-out both }
        .vitro-anim-fade  { animation: vitro-fade-in 300ms ease-out both }
        @keyframes vitro-label-appear {
          0%   { opacity: 0; transform: scale(0.6) }
          60%  { opacity: 1; transform: scale(1.08) }
          100% { opacity: 1; transform: scale(1) }
        }
        @keyframes vitro-tube-shake {
          0%, 100% { transform: rotate(0deg) }
          25%      { transform: rotate(-3deg) }
          75%      { transform: rotate(3deg) }
        }
        .vitro-anim-label-appear {
          animation: vitro-label-appear 400ms cubic-bezier(.2,.9,.3,1) both;
        }
        .vitro-anim-tube-shake {
          animation: vitro-tube-shake 400ms ease-in-out both;
        }
                @keyframes vitro-clay-drop {
          0%   { transform: translateY(-12px); opacity: 0 }
          60%  { transform: translateY(0);     opacity: 1 }
          100% { transform: translateY(0);     opacity: 1 }
        }
        .vitro-anim-clay-drop {
          animation: vitro-clay-drop 400ms cubic-bezier(.2,.9,.3,1) both;
          transform-origin: center top;
        }
        @keyframes vitro-tube-wipe {
          0%   { transform: translate(0, 0) rotate(0deg) }
          30%  { transform: translate(-6px, 6px) rotate(-6deg) }
          60%  { transform: translate(-4px, 4px) rotate(4deg) }
          100% { transform: translate(0, 0) rotate(0deg) }
        }
        .vitro-anim-tube-wipe {
          animation: vitro-tube-wipe 700ms ease-in-out both;
          transform-origin: center bottom;
        }
        @keyframes vitro-capillary-seal {
          0%   { transform: translate(0, 0) }
          40%  { transform: translate(0, 12px) }
          100% { transform: translate(0, 0) }
        }
        .vitro-anim-capillary-seal {
          animation: vitro-capillary-seal 700ms ease-in-out both;
        }
      `}</style>

      <div className="card" style={{ borderColor: "var(--amber)", padding: 18 }}>
        <div className="eyebrow" style={{ color: "var(--amber-2)", marginBottom: 6 }}>
          Donning check
        </div>
        <div style={{ fontWeight: 750, fontSize: 16, lineHeight: 1.35 }}>
          {done
            ? "PPE complete. Correct order."
            : nextStep
            ? STEP_HEADLINES[nextStep.id]
            : "Ready."}
        </div>
        {!done && nextStep && (
          <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>
            Step {placed.length + 1} of {DONNING_STEPS.length}
          </div>
        )}
        {!done && nextStep && STEP_INSTRUCTIONS[nextStep.id] && (
          <div
            style={{
              color: "var(--text-2)",
              fontSize: 13,
              lineHeight: 1.6,
              marginTop: 10,
              maxWidth: "60ch",
            }}
          >
            {STEP_INSTRUCTIONS[nextStep.id]}
          </div>
        )}
        {welcomeBlocked && !done && (
          <button
            className="btn btn-g btn-sm"
            style={{ marginTop: 12 }}
            onClick={playWelcomeManually}
          >
            ▶ Play introduction
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(170px, 240px) 1fr",
          gap: 16,
          marginTop: 16,
          alignItems: "start",
        }}
      >
        <div
          className="card"
          style={{
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-2)",
          }}
        >
          {/* The picked scientist, dressed as they were when
              they walked into the lab. PPE is layered on top
              of this shared figure — the base body is drawn
              once, so the two scientist identities can never
              drift apart across sessions. */}
          <div style={{ position: "relative" }}>
            <VitroScientistSvg
              sex={isFemale ? "female" : "male"}
              stage={has("gown") ? "donned" : "street"}
              height={220}
            />

            {has("mask") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: animating === "mask" ? 0 : 1,
                  transition: "opacity 550ms ease-out",
                }}
              >
                <path
                  d="M52,50 Q70,58 88,50 L86,64 Q70,68 54,64 Z"
                  fill="#E8EDF5"
                  stroke="var(--line-2)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {has("eye") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: animating === "eye" ? 0 : 1,
                  transition: "opacity 550ms ease-out",
                }}
              >
                <g
                  stroke="#2A2016"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                >
                  <rect x="54" y="37" width="13" height="11" rx="3" />
                  <rect x="73" y="37" width="13" height="11" rx="3" />
                  <line x1="67" y1="42" x2="73" y2="42" />
                </g>
              </svg>
            )}

            {has("gloves") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <g className={animating === "gloves" ? "vitro-anim-glove" : ""}>
                  {/* Left glove — traced on the same hand
                      silhouette as VitroScientistSvg's `Hand`
                      component, expanded 2px on every side so no
                      skin shows through, with a rolled cuff at
                      the wrist. Reads as a glove because it is
                      literally the hand shape, covered. */}
                  <path
                    d="
                      M24,170
                      Q21,175 23,182
                      L23,187
                      Q23,191 28,191
                      L36,191
                      Q42,191 42,187
                      L42,171
                      Q42,165 36,165
                      Q30,165 26,167
                      Q24,168 24,170
                      Z
                    "
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  {/* Finger creases — three short lines so the
                      glove reads as having fingers, not a mitt */}
                  <path
                    d="M26,169 Q27,166 29,166 M31,166 Q32,164 34,165 M36,167 Q37,165 39,166"
                    fill="none"
                    stroke="var(--line-2)"
                    strokeWidth="0.5"
                    opacity="0.55"
                  />
                  {/* Thumb line, tracing the hand's thumb */}
                  <path
                    d="M24,173 Q22,177 24,181"
                    fill="none"
                    stroke="var(--line-2)"
                    strokeWidth="0.7"
                    opacity="0.7"
                  />
                  {/* Wrist cuff */}
                  <line
                    x1="23"
                    y1="187"
                    x2="42"
                    y2="187"
                    stroke="var(--line-2)"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                  {/* Right glove — mirrored on the right hand */}
                  <path
                    d="
                      M116,170
                      Q119,175 117,182
                      L117,187
                      Q117,191 112,191
                      L104,191
                      Q98,191 98,187
                      L98,171
                      Q98,165 104,165
                      Q110,165 114,167
                      Q116,168 116,170
                      Z
                    "
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M114,169 Q113,166 111,166 M109,166 Q108,164 106,165 M104,167 Q103,165 101,166"
                    fill="none"
                    stroke="var(--line-2)"
                    strokeWidth="0.5"
                    opacity="0.55"
                  />
                  <path
                    d="M116,173 Q118,177 116,181"
                    fill="none"
                    stroke="var(--line-2)"
                    strokeWidth="0.7"
                    opacity="0.7"
                  />
                  <line
                    x1="98"
                    y1="187"
                    x2="117"
                    y2="187"
                    stroke="var(--line-2)"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                </g>
              </svg>
            )}

            {has("wash") && !has("gloves") && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <g
                  className={animating === "wash" ? "vitro-anim-wash" : ""}
                  fill="none"
                  stroke="#54D08A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M26 166 l0 -5 M23 168 l-5 -3 M29 168 l5 -3" />
                  <path d="M110 166 l0 -5 M107 168 l-5 -3 M113 168 l5 -3" />
                </g>
              </svg>
            )}

            {error && (
              <svg
                viewBox="0 0 140 260"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <g>
                  <circle cx="98" cy="96" r="5" fill="#F0776A" opacity="0.9" />
                  <circle cx="100" cy="98" r="2" fill="#F0776A" opacity="0.6" />
                </g>
              </svg>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {DONNING_STEPS.map((s) => {
              const isPlaced = placed.includes(s.id);
              const isNext = nextStep && nextStep.id === s.id;
              const wasErrored = error && error.id === s.id;
              const isAnimatingNow = animating === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => tap(s.id)}
                  disabled={isPlaced || !!animating}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: wasErrored
                      ? "1.5px solid var(--bad)"
                      : isAnimatingNow
                      ? "1.5px solid var(--good)"
                      : isNext
                      ? "1.5px solid var(--amber)"
                      : isPlaced
                      ? "1px solid var(--line)"
                      : "1px solid var(--line-2)",
                    background: isPlaced
                      ? "var(--bg-2)"
                      : wasErrored
                      ? "var(--bad-dim)"
                      : isAnimatingNow
                      ? "var(--good-dim)"
                      : "var(--bg-3)",
                    color: isPlaced ? "var(--text-3)" : "var(--text)",
                    cursor: isPlaced || animating ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: isPlaced
                        ? "var(--good-dim)"
                        : isAnimatingNow
                        ? "var(--good)"
                        : "var(--bg-2)",
                      color: isPlaced
                        ? "var(--good)"
                        : isAnimatingNow
                        ? "#08210F"
                        : "var(--text-3)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {isPlaced ? "✓" : ""}
                  </span>
                  <span style={{ fontWeight: 650, fontSize: 13.5 }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          
          {error && (
            <div
              className="card"
              style={{
                marginTop: 12,
                borderColor: "var(--bad)",
                background: "var(--bad-dim)",
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 14, color: "var(--bad)", marginBottom: 6 }}>
                Out of order.
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>
                {error.message}
              </div>
              {nextStep && (
                <div style={{ color: "var(--text)", fontSize: 13, marginTop: 8, fontWeight: 650 }}>
                  Next: {nextStep.label}. {nextStep.why}
                </div>
              )}
            </div>
          )}

          {done && (
            <div
              className="card"
              style={{
                marginTop: 12,
                borderColor: "var(--good)",
                background: "var(--good-dim)",
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 14, color: "var(--good)", marginBottom: 6 }}>
                PPE complete.
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>
                Lab coat, mask, eyewear, gloves — correct order. Re-gates next session.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// TUBE_LIBRARY — every tube type a student will meet in an MLS
// lab, keyed by the colour of its cap. This is the reference
// content the bench's wrong-tube feedback draws on: for any pick
// the student makes, the bench can name the tube, say what it
// contains, say what it is for, say what it does to blood, and
// say — precisely — why it is wrong for the current request.
//
// Six entries cover the practicals in scope today. Add to this
// object when a practical needs a tube that isn't here yet; the
// bench reads from it, nothing else in the file changes.
// ------------------------------------------------------------------
const TUBE_LIBRARY = {
  red: {
    label: "Red-top (plain / serum)",
    contains: "No additive — silica clot activator only.",
    purpose: "Serum chemistry, cross-match, blood banking.",
    effect: "Blood clots; serum is the liquid above.",
    notFor: "Haematology — clotted blood cannot give a cell count.",
  },
  purple: {
    label: "Purple-top (EDTA)",
    contains: "K2 or K3 EDTA, sprayed and dried on the wall.",
    purpose: "Full blood count, haemoglobin, packed cell volume, blood film, HbA1c.",
    effect: "EDTA chelates calcium irreversibly, so the blood never clots. Cell morphology is preserved.",
    notFor: "Calcium or electrolyte assays — the EDTA chelates the very analyte being measured.",
  },
  blue: {
    label: "Blue-top (sodium citrate)",
    contains: "3.2% or 3.8% trisodium citrate, liquid.",
    purpose: "Coagulation studies — PT, APTT, INR, fibrinogen.",
    effect: "Citrate chelates calcium reversibly. The tube is filled to a specific line because the citrate:blood ratio is fixed (1:9).",
    notFor: "Anything except coagulation — the dilution distorts other assays.",
  },
  green: {
    label: "Green-top (heparin)",
    contains: "Sodium, lithium or ammonium heparin.",
    purpose: "Blood gases, electrolytes, ammonia, some chemistry, cytogenetics.",
    effect: "Heparin potentiates antithrombin III. It does not preserve cell morphology as well as EDTA, and it stains the background blue on a film.",
    notFor: "Haematology — heparin distorts white cell morphology and gives a blue background on the blood film.",
  },
  gray: {
    label: "Gray-top (fluoride-oxalate)",
    contains: "Sodium fluoride and potassium oxalate.",
    purpose: "Glucose, lactate, and other analytes where glycolysis must be stopped.",
    effect: "Fluoride inhibits enolase, so glucose does not continue to be consumed by red cells. Oxalate chelates calcium.",
    notFor: "Enzymes and most chemistry — fluoride inhibits many enzymes, so it destroys the very things being measured.",
  },
  yellow: {
    label: "Yellow-top (SPS / ACD)",
    contains: "Sodium polyanethol sulfonate, or acid-citrate-dextrose in some versions.",
    purpose: "Blood cultures (SPS) or tissue typing and DNA studies (ACD).",
    effect: "SPS inhibits complement and phagocytosis, and neutralises some antibiotics, so organisms survive. ACD preserves cell viability.",
    notFor: "Routine haematology or chemistry — different tube, different purpose.",
  },
};

// ------------------------------------------------------------------
// PLACEHOLDER_SCRIPT — one hardcoded script that proves the
// bench wiring renders end to end. It is PCV-shaped, so it
// already reads like a real practical, but it is marked
// _placeholder so nothing about it pretends to be final.
//
// Step 4 replaces this with the real PCV script and flips the
// placeholder branch off for that practical. Every other
// practical in every practical course keeps using the "Bench in
// build" card until its own script lands.
// ------------------------------------------------------------------
const PLACEHOLDER_SCRIPT = {
  _placeholder: true,
  id: "placeholder:pcv",
  title: "Estimation of Packed Cell Volume (Haematocrit)",
  request:
    "A 34-year-old female presents with fatigue and pallor. Request: PCV on an EDTA sample.",
  correctTube: "purple",
  patientLabel: "Ama Mensah · 34 F",
  analyser: {
    id: "microhaematocrit",
    label: "Microhaematocrit centrifuge",
    // Step in the script where the analyser becomes usable. Before
    // that step, the analyser is drawn but not tappable.
    unlockedAfter: "sample_drawn",
    action: "Spin the capillary for 5 minutes at 12,000 g.",
    result: "PCV = 0.31 L/L  (31%)",
  },
  // Wrong-tube branches. Keyed by tube colour; the bench renders
  // whichever one matches the student's pick.
  wrongTubes: {
    red: "Red-top has no anticoagulant, so the blood will clot before it reaches the centrifuge. A clotted sample cannot give a PCV — the red cell column will be a solid plug, not a packed column of cells. You need the purple EDTA tube.",
    green: "Green-top contains heparin, which preserves cells poorly for haematology. Heparin distorts white cell morphology and gives a blue background on the film — and for a PCV you want the sample in a tube that was designed for cell counts. That is EDTA.",
    blue: "Blue-top is for coagulation studies. The citrate dilutes the whole-blood sample at a fixed 1:9 ratio, which is exactly what you do not want when you are trying to measure the actual packed cell volume. It would read artificially low.",
    gray: "Gray-top contains fluoride-oxalate, which is for glucose and lactate. It is not intended for cell counting, and the oxalate alters red cell membranes, so the PCV would be unreliable.",
    yellow: "Yellow-top is for blood cultures or tissue typing. It is not a haematology tube and has no role in a PCV.",
  },
  // Copy shown when the correct tube is picked.
  correctTubesFeedback:
    "Purple EDTA is correct. EDTA chelates calcium irreversibly, so the blood never clots, and cell morphology is preserved — that is the tube the analyser is built for.",
  // What the student sees on the outcome panel, before Step 5
  // adds the interpretation step.
  outcome:
    "Sample run. PCV is 0.31 L/L (31%). The interpretation step — decide if this is anaemic, and against what reference range — arrives when the scored version of this practical lands.",
};

// ------------------------------------------------------------------
// VITRO_SCRIPTS — every real practical VITRO knows how to run,
// keyed as "courseId:topicIndex" so a script never shifts when a
// topic is inserted above it in the TOPICS array. This is the
// exact same keying Atlas uses for DIAGRAMS; if it works there
// for illustrations, it works here for practicals.
//
// To add a practical: add one entry to this object. Nothing else
// in VitroView.jsx changes. The bench already knows how to run
// anything shaped like this.
//
// Right now there is exactly one script — PCV, in Physiology II
// Practicals (ph2p), topic index 2. Every other practical in
// every practical course still shows the "Bench in build" card.
// ------------------------------------------------------------------
const VITRO_SCRIPTS = {
  "ph2p:2": {
    id: "ph2p:2",
    title: "Estimation of Packed Cell Volume (Haematocrit)",
    patientLabel: "Grace Owusu · 34 F",
    correctTube: "purple",
    request:
  "Antenatal clinic, Tuesday morning. You have a patient: Grace Owusu, 34 years old, 34 weeks pregnant. The midwife has sent her for a packed cell volume test, or PCV. At her first booking appointment her haemoglobin was 10.8 grams per decilitre. Today she says she has felt more and more tired for the past 3 weeks, and she gets short of breath when she moves around. When you look at her, she is pale. The midwife has written this note: \"Query anaemia. Please measure PCV today and report to the antenatal team.\" Before you pick a tube, say out loud, in one sentence, which tube you need and why. If you cannot say why, read the theory again before you run the test.",
    // Narrator lines — spoken aloud as the bench advances.
    // Plain English, clinical register, short. Read by the
    // student's chosen podcast voice (see App.js's
    // ascendPickVoice). Each line is the instruction, not a
    // description of the instruction.
    narration: {
      intro:
        "Here is the request. Antenatal clinic, Tuesday morning. You have a patient: Grace Owusu, 34 years old, 34 weeks pregnant. The midwife has sent her for a packed cell volume test, or PCV. At her first booking appointment her haemoglobin was 10.8 grams per decilitre. Today she says she has felt more and more tired for the past 3 weeks, and she gets short of breath when she moves around. When you look at her, she is pale. The midwife has written this note: \"Query anaemia. Please measure PCV today and report to the antenatal team.\" When you are ready, tap one of the tubes in the tube rack to pick it.",
      afterWrongTube:
        "That tube is not right for this test. Read the explanation that just appeared on the screen, then tap the button that says Try another tube and pick again.",
      afterCorrectTube:
        "Correct — the purple-top tube. Inside it is a chemical called EDTA, sprayed onto the wall as a thin film. When the blood hits it, the EDTA grabs the calcium in the blood. Calcium is what makes blood clot, so with the calcium held, the blood stays liquid. Just as importantly, the red cells keep their exact shape, so when you load the tube into the centrifuge later, they will pack down into a clean column you can measure. This is the tube the practical was designed around. Now tap the button that says Begin the practical to move to the bench.",
      labelling:
        "Step one, labelling. Write on the tube before you leave the patient's side: her name, the date and time you took the sample, and your initials. A tube with no label, or with a label written later from memory, is thrown away by the laboratory and the sample is taken again. This is not a formality — it is the single most common reason a blood sample is rejected. Tap the button that says Write the label.",
      filling:
        "Step two, filling the capillary. A capillary tube is a thin glass tube, narrower than a drinking straw. You will hold it against the drop of blood and the blood will rise up it on its own. Let it fill to about three-quarters of its length, then stop. Wipe the outside of the tube with gauze — blood left on the outside gets flung off inside the centrifuge and dirties the machine. Tap the button that says Fill the capillary.",
      sealing:
        "Step three, sealing the dry end. One end of the tube has touched the blood. The other end is still dry. Push the dry end into a block of sealing clay. The clay plugs that end and stops blood escaping when the tube spins. Never seal the wet end: the plug would push air into the tube and break the column of blood. Tap the button that says Seal the dry end.",
      loading:
        "Step four, loading the centrifuge. The centrifuge is a machine that spins samples at very high speed. Put your tube into one of the holes in the rotor, with the sealed end facing the outside wall of the machine. Then put a second, empty capillary in the hole directly opposite yours, to balance the rotor. A centrifuge with a tube on only one side will shake itself and can be damaged. Tap the button that says Load the centrifuge.",
      spinning:
        "Step five, spinning the sample. Spin for 5 minutes at 12,000 g. Then read the packed cell column against the haematocrit reader card — red cells at the bottom, buffy coat above, plasma at the top. Tap the button that says Start the spin.",
      reading:
        "The spin is complete. The readout on the centrifuge says PCV equals 0.31 litres per litre, that is 31 percent. The reference range is written underneath it: 0.36 to 0.46, for an adult female. Her result is below the range. Now a question has appeared below. Read the question on the screen, and when you are ready, tap the option that you think is the correct answer.",
      interpret:
        "Question one. Read the question and the four options on the screen, then tap the option you think is correct. This is the question the whole practical exists for.",
      action:
        "Question two. You have already reported the value. Read the question on the screen, and tap the option that tells you what the next professional action should be.",
      results:
        "The practical is complete. Every competency is shown below, and each was assessed independently. If you want to run the practical again, tap the button that says Try again. When you are finished and ready to leave, tap the button that says Leave the lab.",
    },
    // Tube-by-tube feedback for the wrong picks. Each message names
    // the tube, says why it is wrong for this practical specifically,
    // and points at the correct one. No generic "incorrect."
    wrongTubes: {
      red: "The red-top tube has nothing inside it to stop blood clotting. By the time you load it into the centrifuge, the blood has already turned into a solid jelly. A jelly cannot be spun into layers, so this tube gives you no result at all. The right tube needs to keep the blood liquid from the moment it leaves her arm until the moment it is spun.",
      blue: "The blue-top tube is meant for testing how well blood clots — not for counting cells. It contains a liquid that dilutes the blood on purpose, at exactly nine parts blood to one part liquid. That dilution is what the clotting tests need. If you run a packed cell volume on a diluted sample, the result comes out falsely low. The dilution is the whole point of the tube, and it is the exact opposite of what this test needs.",
      green: "The green-top tube keeps blood liquid, which is good — but the chemical it uses to do that changes the shape of white blood cells and stains the background of a blood film blue. For counting cells and measuring their size, this tube is the wrong choice. You need a tube whose only job is to keep cells exactly as they are, so the numbers you report reflect her blood and not the tube.",
      gray: "The gray-top tube is meant for measuring glucose — the sugar in blood. Its chemicals stop the red cells from eating the glucose while the sample is waiting to be tested. Those same chemicals also damage the red cell membrane, so the cells do not pack down cleanly when you spin them, and the packed cell volume is unreliable. Right kind of tube, wrong purpose.",
      yellow: "The yellow-top tube is used to grow bacteria from blood, or to prepare samples for genetic testing. It has nothing to do with counting red cells, and running a packed cell volume on it gives you nothing useful. That tube belongs at the microbiology bench.",
    },
    // What the student sees when the correct tube is picked. Teaches
    // the reason, not just the fact.
    correctTubesFeedback:
      "Correct — the purple-top tube. Inside it is a chemical called EDTA, sprayed onto the wall as a thin film. When the blood hits it, the EDTA grabs the calcium in the blood. Calcium is what makes blood clot, so with the calcium held, the blood stays liquid. Just as importantly, the red cells keep their exact shape, so when you load the tube into the centrifuge later, they will pack down into a clean column you can measure. This is the tube the practical was designed around.",
    // What the student has to do at the bench after picking the
    // tube, in order. Each step is a button they tap; the bench
    // tracks progress and only unlocks the analyser at the right
    // point in the sequence.
    benchSteps: [
      {
        id: "label",
        label: "Label the tube",
        instruction:
          "Write on the tube before you leave the patient's side: her name, the date and time you took the sample, and your initials. A tube with no label, or with a label written later from memory, is thrown away by the laboratory and the sample is taken again. This is not a formality — it is the single most common reason a blood sample is rejected.",
      },
      {
        id: "fill",
        label: "Fill the capillary tube",
        instruction:
          "A capillary tube is a thin glass tube, narrower than a drinking straw. You will hold it against the drop of blood and the blood will rise up it on its own. Let it fill to about three-quarters of its length, then stop. Wipe the outside of the tube with gauze — blood left on the outside gets flung off inside the centrifuge and dirties the machine.",
      },
      {
        id: "seal",
        label: "Seal the dry end",
        instruction:
          "One end of the tube has touched the blood. The other end is still dry. Push the dry end into a block of sealing clay. The clay plugs that end and stops blood escaping when the tube spins. Never seal the wet end: the plug would push air into the tube and break the column of blood.",
      },
      {
        id: "load",
        label: "Load the centrifuge",
        instruction:
          "The centrifuge is a machine that spins samples at very high speed. Put your tube into one of the holes in the rotor, with the sealed end facing the outside wall of the machine. Then put a second, empty capillary in the hole directly opposite yours, to balance the rotor. A centrifuge with a tube on only one side will shake itself and can be damaged.",
      },
    ],
    analyser: {
      id: "microhaematocrit",
      label: "Microhaematocrit centrifuge",
      action:
        "Spin for 5 minutes at 12,000 g. Then read the packed cell column against the haematocrit reader card — red cells at the bottom, buffy coat above, plasma at the top.",
      result: "PCV = 0.31 L/L  (31%)",
      // Reference range shown on the readout, so the result is
      // never shown without context. Interpretation itself is
      // Step 5, but a student should always see what normal is.
      reference: "Reference range (adult female): 0.36–0.46 L/L  (36–46%)",
    },
    // The teaching payload at the end of the practical. In Step 5
    // this becomes a scored competency check; for now it is read
    // as a lesson.
    outcome:
      "Grace's packed cell volume is 0.31. The normal range for a non-pregnant woman is 0.36 to 0.46, so she is below the range — she is anaemic. Her haemoglobin of 9.4 g/dL, down from 10.8 at booking, agrees. The number tells us she is anaemic; it does not tell us why. To find the cause, the clinician needs two more tests: a full blood count, which will show the size of her red cells, and a blood film, which lets a scientist look at the cells under the microscope. Those two together will point at iron deficiency, folate deficiency, or something else. That is the next step, and the report we send should say so.",
    // The interpretation question. Scored as its own competency,
    // because interpretation is what the practical is for.
        interpretation: {
      question:
        "Grace Owusu's packed cell volume reads 0.31. The reference range for a non-pregnant adult woman is 0.36 to 0.46. She is 34 weeks pregnant, and in late pregnancy the plasma volume expands, which lowers the packed cell volume slightly. Her booking haemoglobin was 10.8 g/dL. Her current haemoglobin is 9.4 g/dL. How do you interpret the result on the report form?",
      options: [
        "Expected in late pregnancy; record as normal for gestation and take no action.",
        "Below the reference range for her gestation; report as anaemia and flag it.",
        "Uninterpretable without a repeat sample; hold the result and recollect venous blood.",
        "Above the reference range for a pregnant woman; report as gestational polycythaemia.",
      ],
      correctIndex: 1,
      wrongFeedback: {
        0: "Pregnancy does dilute the blood and lower the packed cell volume slightly, but not as far as 0.31, and not with a haemoglobin that has fallen from 10.8 to 9.4 g/dL over the same period. Filing this as normal would mean a real problem goes back to the antenatal team with no comment on it — which is the one thing a laboratory result exists to prevent.",
        2: "The result can absolutely be interpreted. That is what the reference range is for. 0.31 against a range of 0.36 to 0.46 reads clearly as below range, and her falling haemoglobin supports that reading. Asking for a new sample is not the right action; the sample is valid, the result is real, and it should be reported to the clinician.",
        3: "Pregnancy lowers the packed cell volume, it does not raise it. And 0.31 is below the reference range, not above it. Reading the number against the range — and then allowing for how pregnancy shifts that range — is the whole skill being tested here.",
      },
    },
    reportableAction: {
      question:
        "The result has been written on the report form and marked as below the reference range. The antenatal team will not review it until their next clinic in four days. What is the next thing you do with this result?",
      options: [
        "File the report for the antenatal team to read at their next scheduled clinic.",
        "Run the test again on a second venous sample to confirm the finding first.",
        "Send the result now and suggest a full blood count and a blood film to find the cause.",
        "Telephone the antenatal team immediately as a same-hour critical result call.",
      ],
      correctIndex: 2,
      wrongFeedback: {
        0: "Filing without flagging is how abnormal results get missed. The midwife specifically asked us to measure the packed cell volume today and report to the antenatal team. The result confirms her suspicion. It needs to go back to her now, not sit in a folder until the next clinic.",
        1: "Repeating the sample adds nothing. The result is consistent with her clinical picture — falling haemoglobin, tiredness, breathlessness, pallor. What is missing is not a repeat packed cell volume, it is the tests that will tell us why she is anaemic. Repeating without escalating just delays the answer the clinician needs.",
        3: "This is not a same-hour emergency. A result that requires a phone call within the hour is one where the patient is in immediate danger — for example, a packed cell volume so low she needs blood right now. Grace's result is significant, but she is walking and talking, and the correct action is a routine report that suggests further tests, not an emergency call.",
      },
    },
  },
};

// ------------------------------------------------------------------
// VITRO_COMPETENCIES — the named skills each practical trains,
// keyed the same way as VITRO_SCRIPTS. Every practical has its
// own set; the bench scores against whichever set the loaded
// script points at.
//
// Each competency is assessed independently: passed or not-yet-
// passed. This is the vocabulary an MLS curriculum already uses
// — "competent at tube selection", "not yet competent at result
// interpretation" — not a points score.
// ------------------------------------------------------------------
const VITRO_COMPETENCIES = {
  "ph2p:2": [
    {
      id: "tube_selection",
      label: "Tube selection",
      description:
        "Chose EDTA (purple) for a haematology sample, not a tube meant for another purpose.",
    },
    {
      id: "sample_handling",
      label: "Sample handling",
      description:
        "Labelled, filled, sealed and loaded the capillary in the correct order without skipping a step.",
    },
    {
      id: "instrument_operation",
      label: "Instrument operation",
      description:
        "Ran the microhaematocrit centrifuge once the sample was loaded.",
    },
    {
      id: "result_interpretation",
      label: "Result interpretation",
      description:
        "Read the PCV against the reference range, weighed the pregnancy confound, and correctly identified the result as anaemia.",
    },
    {
      id: "reportable_action",
      label: "Reportable action",
      description:
        "Escalated the abnormal result to the requesting clinician with a suggestion for further testing, rather than filing or repeating it.",
    },
  ],
};

// ------------------------------------------------------------------
// Bench narration. Reads each step aloud through the same Web
// Speech voices the podcast feature already uses (see App.js's
// ascendPickVoice). One utterance at a time, cancel on stop,
// no queuing — the narrator is meant to guide, not to lecture
// over the student.
//
//   vitroSpeak(text, onEnd?)
//     — speaks text, calls onEnd when done (or on error), so the
//       caller can advance or wait. Cancels whatever is already
//       speaking first, so step transitions never stack.
//
//   vitroStopSpeaking()
//     — cancels whatever is speaking, silently. Called when the
//       bench unmounts, or when the student mutes.
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// Vitro narration engine.
//
// One utterance is a unit. The engine lets a sentence finish
// before starting the next one, with a short silence between
// them. That is the whole point: cutting speech mid-sentence
// is what makes an app sound broken, and every transition in
// this file — donning to bench, bench to question, question to
// question — has to sound like narration, not like a switch.
//
//   playNext = the line currently being spoken, if any
//   queued   = the line waiting to speak, if any
//   MAX_WAIT = if the current line has been going longer than
//              this, cut it and move on. Prevents a very long
//              sentence from blocking the student's progress.
//
// External API, unchanged from the caller's point of view:
//
//   vitroSpeak(text)      — request a line
//   vitroStopSpeaking()   — silence immediately
//   vitroIsSpeaking()     — true if anything is currently audible
//
// Every request replaces the queue. Only one line is ever
// pending. A second call before the first has finished will
// not stack lines; it will wait for the current line, then
// speak the newest request.
// ------------------------------------------------------------------
const VITRO_SPEAK_BEAT_MS = 350;
const VITRO_MAX_WAIT_MS = 3200;

const vitroEngine = {
  currentUtter: null,
  queuedText: null,
  queuedStartedAt: 0,
  currentStartedAt: 0,
  tickHandle: null,
  gender: "female",
  // Callbacks fired when the currently speaking line finishes
  // (naturally, or because the ticker cut it). Cleared after use.
  currentOnEnd: null,
  queuedOnEnd: null,
  // Callback fired the moment the queued utterance actually
  // begins producing audio. Used to distinguish "queued" from
  // "actually playing" for the welcome autoplay detection.
  queuedOnStart: null,
};

// Pick a good voice for the chosen gender, once per session.
function vitroPickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    const englishVoices = voices.filter((v) => /^en/i.test(v.lang));
    const pool = englishVoices.length ? englishVoices : voices;
    const hints =
      vitroEngine.gender === "male"
        ? ["male", "david", "mark", "daniel", "alex", "fred", "guy", "ryan", "tom", "george"]
        : ["female", "zira", "samantha", "victoria", "susan", "karen", "aria", "jenny", "joanna", "libby", "sonia"];
    return pool.find((v) => hints.some((h) => v.name.toLowerCase().includes(h))) || null;
  } catch {
    return null;
  }
}

// Build and speak one utterance. Returns true if the call was
// accepted by the browser; the caller should verify actual
// playback separately via `onStart`, because `speak()` does
// not throw when autoplay is blocked — it silently drops the
// utterance. `onStart` is fired the moment the browser
// actually begins producing audio, which is the only reliable
// signal that a line has really started.
function vitroSpeakNow(text, onStart) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const clean = String(text || "").replace(/\s*—\s*/g, ", ");
  const utter = new SpeechSynthesisUtterance(clean);
  utter.pitch = vitroEngine.gender === "male" ? 0.85 : 1.1;
  utter.rate = 0.97;
  const voice = vitroPickVoice();
  if (voice) utter.voice = voice;

  vitroEngine.currentUtter = utter;
  vitroEngine.currentStartedAt = Date.now();

  if (typeof onStart === "function") {
    utter.onstart = onStart;
  }
  utter.onend = vitroEngine.onEnd;
  utter.onerror = vitroEngine.onEnd;

  try {
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    vitroEngine.currentUtter = null;
    return false;
  }
}

// Called when an utterance ends, naturally or otherwise.
// Hands control to the next queued line, or clears the queue.
vitroEngine.onEnd = function () {
  vitroEngine.currentUtter = null;
  // Fire the finished line's callback first, so the caller
  // knows its own line ended before the next one starts.
  const finishedCb = vitroEngine.currentOnEnd;
  vitroEngine.currentOnEnd = null;
  if (finishedCb) {
    try { finishedCb(); } catch {}
  }
  if (vitroEngine.queuedText) {
    // Brief beat, then speak the pending line.
    setTimeout(() => {
      const next = vitroEngine.queuedText;
      const nextCb = vitroEngine.queuedOnEnd;
      const nextStart = vitroEngine.queuedOnStart;
      vitroEngine.queuedText = null;
      vitroEngine.queuedOnEnd = null;
      vitroEngine.queuedOnStart = null;
      if (next) {
        vitroEngine.currentOnEnd = nextCb;
        vitroSpeakNow(next, nextStart);
      }
    }, VITRO_SPEAK_BEAT_MS);
  }
};

// Called periodically while a line is speaking, to enforce
// the MAX_WAIT cap and drain the queue if the browser fails
// to fire onend (which happens occasionally on some mobile
// speech engines).
function vitroSpeakTick() {
  if (!vitroEngine.currentUtter) {
    // Nothing is speaking. Drain queue if there is anything.
    if (vitroEngine.queuedText) {
      vitroEngine.idleTicks = 0;
      const next = vitroEngine.queuedText;
      const nextCb = vitroEngine.queuedOnEnd;
      vitroEngine.queuedText = null;
      vitroEngine.queuedOnEnd = null;
      vitroEngine.currentOnEnd = nextCb;
      vitroSpeakNow(next);
      return;
    }
    // Truly idle. Stop polling after a short grace period instead of
    // running every 400ms for the rest of the session once the
    // student has left the lab - vitroStartTicker() restarts it the
    // next time there's actually a line to speak.
    vitroEngine.idleTicks = (vitroEngine.idleTicks || 0) + 1;
    if (vitroEngine.idleTicks > 3 && vitroEngine.tickHandle) {
      clearInterval(vitroEngine.tickHandle);
      vitroEngine.tickHandle = null;
      vitroEngine.idleTicks = 0;
    }
    return;
  }
  vitroEngine.idleTicks = 0;
  // Paused because the tab/app is backgrounded - the line isn't
  // actually overrunning, the student just isn't here. Don't let the
  // overrun cutoff below fire while we're waiting for them to come
  // back; the visibility handler resumes this on its own.
  if (vitroEngine.pausedByVisibility) return;
  const elapsed = Date.now() - vitroEngine.currentStartedAt;
  if (elapsed > VITRO_MAX_WAIT_MS && vitroEngine.queuedText) {
    // Current line has overrun. Cut it, then speak the queue.
    try {
      window.speechSynthesis.cancel();
    } catch {}
    vitroEngine.currentUtter = null;
    // Fire the cut line's callback, so the caller knows.
    const cutCb = vitroEngine.currentOnEnd;
    vitroEngine.currentOnEnd = null;
    if (cutCb) {
      try { cutCb(); } catch {}
    }
    const next = vitroEngine.queuedText;
    const nextCb = vitroEngine.queuedOnEnd;
    vitroEngine.queuedText = null;
    vitroEngine.queuedOnEnd = null;
    setTimeout(() => {
      vitroEngine.currentOnEnd = nextCb;
      vitroSpeakNow(next);
    }, VITRO_SPEAK_BEAT_MS);
  }
}

function vitroStartTicker() {
  if (vitroEngine.tickHandle) return;
  vitroEngine.idleTicks = 0;
  vitroEngine.tickHandle = setInterval(vitroSpeakTick, 400);
}

// ------------------------------------------------------------------
// Pause/resume on tab visibility. speechSynthesis keeps talking even
// when the tab is backgrounded or the app loses focus - without this
// the narrator keeps going into an empty tab, or races ahead of a
// student who isn't looking. We pause the actual audio (not cancel -
// cancelling would lose the line entirely and desync the voice from
// whatever the student is looking at when they return) and resume
// from the same point once the tab is visible again.
//
// Known limitation: some versions of desktop Chrome silently fail to
// resume a line paused longer than ~15s. If resume doesn't actually
// produce audio shortly after we ask for it, we fall back to
// restarting the same line from its beginning, rather than leaving
// the student stuck on a permanently silent narrator.
// ------------------------------------------------------------------
vitroEngine.pausedByVisibility = false;
vitroEngine.visHandlerInstalled = false;

function vitroInstallVisibilityHandler() {
  if (vitroEngine.visHandlerInstalled) return;
  if (typeof document === "undefined") return;
  vitroEngine.visHandlerInstalled = true;

  document.addEventListener("visibilitychange", () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (document.visibilityState === "hidden") {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        try { window.speechSynthesis.pause(); } catch {}
        vitroEngine.pausedByVisibility = true;
      }
      return;
    }

    if (!vitroEngine.pausedByVisibility) return;
    vitroEngine.pausedByVisibility = false;
    const resumeText = vitroEngine.currentUtter ? vitroEngine.currentUtter.text : null;
    try { window.speechSynthesis.resume(); } catch {}
    setTimeout(() => {
      if (window.speechSynthesis.paused && resumeText) {
        try { window.speechSynthesis.cancel(); } catch {}
        vitroEngine.currentUtter = null;
        vitroSpeakNow(resumeText);
      }
    }, 400);
  });
}

function vitroSpeak(text, onEnd, onStart) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (typeof onEnd === "function") onEnd();
    return false;
  }
  // Refresh the gender preference at every call, so a student
  // who changes the podcast voice mid-session hears the change
  // on the next line.
  try {
    vitroEngine.gender = window.localStorage.getItem("ascend_voice_gender") || "female";
  } catch {}
  vitroStartTicker();
  vitroInstallVisibilityHandler();

  const clean = String(text || "").trim();
  if (!clean) return false;

  if (vitroEngine.currentUtter) {
    // Something is speaking. Queue the new line; it will play
    // when the current one finishes naturally, or when the
    // ticker decides the current line has overrun.
    vitroEngine.queuedText = clean;
    vitroEngine.queuedStartedAt = Date.now();
    vitroEngine.queuedOnEnd = typeof onEnd === "function" ? onEnd : null;
    vitroEngine.queuedOnStart = typeof onStart === "function" ? onStart : null;
    return true;
  }

  // Nothing speaking. Save the onEnd and onStart callbacks
  // and speak now.
  vitroEngine.currentOnEnd = typeof onEnd === "function" ? onEnd : null;
  return vitroSpeakNow(clean, onStart);
}

function vitroStopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  vitroEngine.queuedText = null;
  vitroEngine.currentUtter = null;
  vitroEngine.pausedByVisibility = false;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

function vitroIsSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    return window.speechSynthesis.speaking;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------
// vitroReadMcq — reads an MCQ aloud: the question stem, then each
// option prefixed with its letter, then a closing line telling
// the student which button to tap. Used by the two scored
// questions on the bench.
//
// The student can tap an option at any point. The engine queues
// the lines in order, so if they answer mid-read, the letter
// they tapped still registers and the remaining narration
// finishes speaking before the outcome line plays.
//
//   header — e.g. "Question one" or "Question two"
//   stem   — the question text
//   options — array of option strings
//   onEnd   — called when the whole read is finished
// ------------------------------------------------------------------
function vitroReadMcq(header, stem, options, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (typeof onEnd === "function") onEnd();
    return;
  }
  const letters = ["A", "B", "C", "D", "E"];
  // Build the entire read as one utterance. This is deliberate:
  // sentence-by-sentence queuing would let a student's answer
  // cut the read between options, leaving them unsure which
  // letter was which. One utterance means the read either plays
  // whole or is skipped as a whole.
  const parts = [];
  if (header) parts.push(header + ".");
  if (stem) parts.push(stem);
  (options || []).forEach((opt, i) => {
    parts.push("Option " + (letters[i] || String(i + 1)) + ". " + opt);
  });
  parts.push("When you are ready, tap the option you think is correct.");
  const full = parts.join(" ");
  vitroSpeak(full, onEnd);
}

// ------------------------------------------------------------------
// recordVitroAttempt — fold a finished VITRO attempt into the
// student's progress object.
//
// Stored shape on progress:
//
//   progress.vitroAttempts = {
//     "ph2p:2": {
//       attempts: 3,
//       lastAttemptAt: 1728...,
//       best: {
//         tube_selection: true,
//         sample_handling: true,
//         instrument_operation: true,
//         result_interpretation: false,
//       },
//     },
//   }
//
// "best" preserves the best-ever result per competency. Once a
// student has passed a competency, a later failed attempt does
// not un-pass it. That matches how an MLS competency record
// works: you demonstrate competence once and it stays
// demonstrated. The attempt counter still increments, so the
// record shows how many times the student has run it.
//
// Returns a NEW progress object. The caller decides when to
// persist it — this function does not save anything.
// ------------------------------------------------------------------
function recordVitroAttempt(progress, scriptId, competencyMap) {
  if (!progress || !scriptId || !competencyMap) return progress;

  const prev = progress.vitroAttempts || {};
  const prevEntry = prev[scriptId] || {
    attempts: 0,
    lastAttemptAt: null,
    best: {},
  };

  // Fold this attempt's competency map into "best". A true value
  // wins over anything; a false value only sticks if there is no
  // previous true. undefined values are ignored.
  const nextBest = { ...prevEntry.best };
  Object.keys(competencyMap).forEach((k) => {
    const v = competencyMap[k];
    if (v === true) nextBest[k] = true;
    else if (v === false && nextBest[k] !== true) nextBest[k] = false;
  });

  const nextEntry = {
    attempts: prevEntry.attempts + 1,
    lastAttemptAt: Date.now(),
    best: nextBest,
  };

  return {
    ...progress,
    vitroAttempts: {
      ...prev,
      [scriptId]: nextEntry,
    },
  };
}

// ------------------------------------------------------------------
// VitroTubeSvg — one tube drawn as an SVG shape, coloured by cap.
// Two visual states: empty body (light) with a coloured cap, and
// filled body (dark red) once the sample has been drawn. Same
// discipline as Atlas: shapes drawn in code, one palette, no
// sprite art.
//
//   cap      — the tube colour key (red/purple/blue/green/gray/yellow)
//   filled   — whether the tube body shows blood
//   size     — width in pixels; height is derived from the viewBox
// ------------------------------------------------------------------
function VitroTubeSvg({ cap, filled, labelled = false, labelText = "", size = 46 }) {
  // A map from key to the actual cap colour, so the SVG matches
  // what the student would see on the bench. Purple and gray are
  // the two that most often look "wrong" if you just pick a
  // generic version of the name; these are the textbook shades.
  const capColor = {
    red: "#C0392B",
    purple: "#7B3FA0",
    blue: "#2E6FBF",
    green: "#3E9E5C",
    gray: "#8A8F99",
    yellow: "#E4B93F",
  }[cap] || "#5B6473";

  return (
    <svg
      viewBox="0 0 32 96"
      width={size}
      style={{ display: "block" }}
      role="img"
      aria-label={filled ? "Blood-filled tube" : "Empty tube"}
    >
      {/* Cap */}
      <rect x="7" y="0" width="18" height="10" rx="2" fill={capColor} />
      {/* Body — a very light cylinder, so the cap colour reads */}
      <path
        d="M8,10 L8,84 Q8,92 16,92 Q24,92 24,84 L24,10 Z"
        fill={filled ? "#8E2E2A" : "#E6EBF2"}
        stroke="#1B283F"
        strokeWidth="0.9"
      />
      {/* Meniscus — a subtle hint of the liquid surface when filled */}
      {filled && (
        <ellipse cx="16" cy="16" rx="8" ry="2" fill="#5A1A18" opacity="0.65" />
      )}
      {/* Label strip — the white patch where the tube is written
          on. Empty by default (a blank strip); when `labelled`
          is true, the strip carries the patient's name and the
          date, drawn as real text so it is legible. */}
      <rect x="9" y="36" width="14" height="26" rx="2" fill="#FFFFFF" opacity="0.95" stroke="#D0D6E0" strokeWidth="0.4" />
      {labelled && (
        <g
          className="vitro-anim-label-appear"
          style={{ transformOrigin: "16px 49px" }}
        >
          <text
            x="16"
            y="44"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="3.4"
            fontWeight="700"
            fill="#1B1405"
          >
            {labelText.split("\n")[0] || ""}
          </text>
          <text
            x="16"
            y="49"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="3"
            fontWeight="600"
            fill="#1B1405"
          >
            {labelText.split("\n")[1] || ""}
          </text>
          <text
            x="16"
            y="54"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="3"
            fontWeight="600"
            fill="#1B1405"
          >
            {labelText.split("\n")[2] || ""}
          </text>
        </g>
      )}
    </svg>
  );
}

// ------------------------------------------------------------------
// VitroCentrifugeSvg — the microhaematocrit centrifuge, drawn
// on the bench. Three visual states, driven by props:
//
//   state="idle"    — lid closed, rotor still, LED off.
//   state="loaded"  — lid closed, rotor carrying two
//                     capillaries in opposite slots, LED dim.
//   state="spin"    — lid closed, rotor rotating (a rotation
//                     animation on the rotor group), LED
//                     blinking.
//
// A readout panel on the front of the machine shows the result
// once the spin has completed. Before that it reads "—".
//
// All chassis colours use theme tokens so the machine flips
// with dark/light/system. Only the rotor LED and the readout
// text stay literal (a real LED is a real LED).
// ------------------------------------------------------------------
function VitroCentrifugeSvg({ state = "idle", result = null }) {
  const spinning = state === "spin";
  const loaded = state === "loaded" || spinning;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <style>{`
        @keyframes vitro-rotor-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vitro-led-blink {
          0%, 100% { opacity: 1 }
          50%      { opacity: 0.25 }
        }
        .vitro-rotor-spinning {
          animation: vitro-rotor-spin 0.35s linear infinite;
          transform-origin: 100px 78px;
        }
        .vitro-led-on  { animation: vitro-led-blink 0.6s ease-in-out infinite }
      `}</style>

      <svg
        viewBox="0 0 200 160"
        width="100%"
        style={{ maxWidth: 260, display: "block" }}
        role="img"
        aria-label={
          spinning
            ? "Centrifuge spinning"
            : loaded
            ? "Centrifuge loaded, ready to spin"
            : "Centrifuge idle"
        }
      >
        {/* Base — a rounded trapezoid so the machine reads as a
            bench-top device, not a box. */}
        <path
          d="M22,60 Q100,54 178,60 L184,146 Q100,152 16,146 Z"
          fill="var(--bg-3)"
          stroke="var(--line-2)"
          strokeWidth="1.2"
        />

        {/* Lid — a domed shape, sits on top of the base. Drawn
            closed in every state (the lid only opens at the load
            step, which is a step we render separately). */}
        <path
          d="M30,60 Q100,26 170,60 L170,66 L30,66 Z"
          fill="var(--bg-2)"
          stroke="var(--line-2)"
          strokeWidth="1.2"
        />

        {/* Rim line separating lid from body */}
        <line
          x1="30"
          y1="66"
          x2="170"
          y2="66"
          stroke="var(--line-2)"
          strokeWidth="1"
        />

        {/* Rotor — a disc set into the top of the machine, seen
            from slightly above so the slots are visible. Spins
            when state === "spin". */}
        <g className={spinning ? "vitro-rotor-spinning" : ""}>
          <circle
            cx="100"
            cy="78"
            r="28"
            fill="var(--bg-2)"
            stroke="var(--line-2)"
            strokeWidth="1.2"
          />
          <circle
            cx="100"
            cy="78"
            r="6"
            fill="var(--bg-3)"
            stroke="var(--line-2)"
            strokeWidth="1"
          />
          {/* Two slots, diametrically opposed */}
          <rect
            x="92"
            y="70"
            width="6"
            height="16"
            rx="2"
            fill="var(--bg-3)"
            stroke="var(--line-2)"
            strokeWidth="0.8"
          />
          <rect
            x="102"
            y="70"
            width="6"
            height="16"
            rx="2"
            fill="var(--bg-3)"
            stroke="var(--line-2)"
            strokeWidth="0.8"
          />
          {/* Loaded capillaries, if the machine is loaded or
              spinning. Drawn as small red rectangles in the
              slots so the machine reads as "carrying a sample". */}
          {loaded && (
            <>
              <rect
                x="93"
                y="71"
                width="4"
                height="14"
                rx="1"
                fill="#8E2E2A"
              />
              <rect
                x="103"
                y="71"
                width="4"
                height="14"
                rx="1"
                fill="#8E2E2A"
              />
            </>
          )}
        </g>

        {/* Readout panel on the body — result or dash */}
        <rect
          x="40"
          y="112"
          width="120"
          height="22"
          rx="4"
          fill="var(--bg-2)"
          stroke="var(--line-2)"
          strokeWidth="1"
        />
        <text
          x="100"
          y="127"
          textAnchor="middle"
          fontFamily="var(--mono, monospace)"
          fontSize="11"
          fontWeight="700"
          fill={result ? "var(--amber-2)" : "var(--text-3)"}
        >
          {result ? result : "—"}
        </text>

        {/* Power LED — blinks while spinning */}
        <circle
          className={spinning ? "vitro-led-on" : ""}
          cx="176"
          cy="120"
          r="3"
          fill={spinning ? "#54D08A" : "#3B4A63"}
        />
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------
// VitroCapillarySvg — one microhaematocrit capillary tube.
//
// Three fill states driven by props:
//
//   fill="empty"   — clear glass, no sample.
//   fill="partial" — glass with red sample in the bottom
//                    quarter (used mid-animation).
//   fill="full"    — glass filled with red to about
//                    three-quarters, exactly the fill level
//                    the instruction teaches.
//
//   sealed         — the dry (top) end carries a clay plug.
//
// The body uses theme-neutral glass colouring, so it reads as
// glass on both dark and light backgrounds.
// ------------------------------------------------------------------
function VitroCapillarySvg({ fill = "empty", sealed = false, height = 120 }) {
  const fillHeight =
    fill === "full" ? 78 : fill === "partial" ? 24 : 0;
  return (
    <svg
      viewBox="0 0 14 130"
      width={(height / 130) * 14}
      style={{ display: "block" }}
      role="img"
      aria-label={
        sealed
          ? "Sealed capillary"
          : fill === "full"
          ? "Filled capillary"
          : "Empty capillary"
      }
    >
      {/* Glass tube */}
      <rect
        x="4"
        y="0"
        width="6"
        height="130"
        rx="3"
        fill="var(--bg-2)"
        stroke="var(--line-2)"
        strokeWidth="0.8"
        opacity="0.9"
      />
      {/* Blood column, filled from the bottom up */}
      {fillHeight > 0 && (
        <rect
          x="5"
          y={126 - fillHeight}
          width="4"
          height={fillHeight}
          rx="2"
          fill="#8E2E2A"
          style={{ transition: "height 600ms ease-out, y 600ms ease-out" }}
        />
      )}
      {/* Sealing clay plug at the top (dry) end. Slides down
          from above when it appears, so the seal is a visible
          action, not a static detail. */}
      {sealed && (
        <g className="vitro-anim-clay-drop">
          <rect
            x="3"
            y="0"
            width="8"
            height="10"
            rx="2.5"
            fill="#C4A57B"
            stroke="#8A6E45"
            strokeWidth="0.7"
          />
          {/* Highlight so the plug reads as a rounded object */}
          <ellipse cx="6" cy="3" rx="2.6" ry="1" fill="#E0C89C" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

// ------------------------------------------------------------------
// Three small bench objects. Each is drawn the same way as the
// tube and capillary — plain SVG, one palette, theme tokens for
// anything that should flip, literal colour only for the object's
// own identity (gauze is white, clay is tan, the reader card is
// white with a red scale).
//
// These exist because the narrator names them. If the voice says
// "wipe the tube with gauze", there has to be gauze on the bench.
// Naming an object that isn't there is the fastest way to lose a
// student.
// ------------------------------------------------------------------
function VitroGauzeSvg({ size = 60, used = false }) {
  return (
    <svg
      viewBox="0 0 60 40"
      width={size}
      style={{ display: "block" }}
      role="img"
      aria-label={used ? "Gauze square, bloodied" : "Gauze square"}
    >
      {/* A stack of two gauze squares, offset, with a woven
          cross-hatch so it reads as gauze and not a napkin. */}
      <rect x="4" y="6" width="44" height="30" rx="2" fill="#E8EDF5" stroke="var(--line-2)" strokeWidth="1" opacity="0.75" />
      <rect x="8" y="2" width="44" height="30" rx="2" fill="#F4F6FA" stroke="var(--line-2)" strokeWidth="1" />
      {/* Weave: horizontal threads */}
      {[7, 12, 17, 22, 27].map((y) => (
        <line key={"h" + y} x1="10" y1={y} x2="50" y2={y} stroke="var(--line-2)" strokeWidth="0.4" opacity="0.4" />
      ))}
      {/* Weave: vertical threads */}
      {[14, 20, 26, 32, 38, 44].map((x) => (
        <line key={"v" + x} x1={x} y1="4" x2={x} y2="30" stroke="var(--line-2)" strokeWidth="0.4" opacity="0.4" />
      ))}
      {/* The blood smear. Appears the moment the tube is wiped
          on the gauze, stays on for the rest of the practical
          so the student can see that this object has been
          used. Irregular blob rather than a circle, so it
          reads as a smear and not a stain. */}
      {used && (
        <g className="vitro-anim-smear-appear">
          <ellipse cx="30" cy="18" rx="9" ry="4.5" fill="#8E2E2A" opacity="0.75" />
          <ellipse cx="24" cy="16" rx="3.5" ry="2" fill="#8E2E2A" opacity="0.55" />
          <ellipse cx="37" cy="20" rx="3" ry="1.6" fill="#8E2E2A" opacity="0.55" />
        </g>
      )}
    </svg>
  );
}

function VitroSealingClaySvg({ size = 56, used = false }) {
  return (
    <svg
      viewBox="0 0 56 40"
      width={size}
      style={{ display: "block" }}
      role="img"
      aria-label={used ? "Sealing clay block, freshly used" : "Sealing clay block"}
    >
      {/* The clay block: a rounded rectangle in clay-tan, with
          a couple of small pits on top where previous capillaries
          were pressed in. */}
      <rect x="4" y="14" width="48" height="22" rx="4" fill="#C4A57B" stroke="#8A6E45" strokeWidth="1.2" />
      <ellipse cx="18" cy="15" rx="3.5" ry="1.4" fill="#8A6E45" opacity="0.6" />
      <ellipse cx="30" cy="15" rx="3.5" ry="1.4" fill="#8A6E45" opacity="0.6" />
      <ellipse cx="42" cy="15" rx="3.5" ry="1.4" fill="#8A6E45" opacity="0.6" />
      {/* A soft highlight across the top of the block */}
      <ellipse cx="28" cy="17" rx="22" ry="2" fill="#E0C89C" opacity="0.5" />
      {/* A fresh pit, brighter than the older ones and slightly
          deeper-looking, appears the moment the capillary is
          pushed in. Reads as "this is the hole you just made." */}
      {used && (
        <g className="vitro-anim-pit-appear">
          <ellipse cx="30" cy="15.2" rx="4" ry="1.6" fill="#5A4425" opacity="0.85" />
          <ellipse cx="30" cy="16" rx="3.2" ry="1.2" fill="#3A2A12" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

function VitroReaderCardSvg({ size = 90 }) {
  return (
    <svg
      viewBox="0 0 90 50"
      width={size}
      style={{ display: "block" }}
      role="img"
      aria-label="Haematocrit reader card"
    >
      {/* A white card with a red scale. This is the physical
          reader card a student holds the spun capillary against. */}
      <rect x="2" y="4" width="86" height="42" rx="3" fill="#F4F6FA" stroke="var(--line-2)" strokeWidth="1" />
      {/* Red scale bar */}
      <rect x="8" y="10" width="74" height="8" rx="1" fill="#8E2E2A" opacity="0.85" />
      {/* Tick marks and numbers down the scale */}
      {[0, 10, 20, 30, 40, 50, 60, 70].map((v, i) => (
        <g key={i}>
          <line
            x1={8 + i * 10.5}
            y1="10"
            x2={8 + i * 10.5}
            y2="6"
            stroke="var(--line-2)"
            strokeWidth="0.6"
          />
          <text
            x={8 + i * 10.5}
            y="34"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="6"
            fontWeight="700"
            fill="var(--text-2)"
          >
            {v}
          </text>
        </g>
      ))}
      {/* Label under the scale */}
      <text
        x="45"
        y="43"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="4.6"
        fontWeight="600"
        fill="var(--text-3)"
      >
        HAEMATOCRIT READER
      </text>
    </svg>
  );
}

// ------------------------------------------------------------------
// VitroLabReport — the clinical lab report the student's work
// produces. Rendered between the second question and the
// competencies screen.
//
// The shape mirrors a real clinical laboratory report form:
//
//   Header        — laboratory name and address block
//   Patient       — name, age, sex, hospital number
//   Request       — who asked, what for, clinical details
//   Sample        — type, tube, date received
//   Result        — the value, units, reference range, flag
//   Interpretation — a short clinical comment
//   Authorisation — who reported it, when, signature block
//
// The report pulls its values from the script, so a second
// practical can reuse this component with a different script
// and produce a completely different report.
//
// Nothing here is interactive. It is a document. The single
// action is "Submit report", which advances to the competencies.
// ------------------------------------------------------------------
function VitroLabReport({ script, result, interpretationText, onDone, speak }) {
  useEffect(() => {
    if (typeof speak !== "function") return;
    speak(
      "Here is the report your work has produced. Read it as though you were the reporting scientist. Check the patient details, the sample details, the result against the reference range, and the interpretation. When you have read the whole report, tap the button that says Submit report."
    );
  }, [speak]);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const now = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{
          borderColor: "var(--amber)",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Header — the laboratory letterhead. */}
        <div
          style={{
            background: "var(--bg-3)",
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--amber-2)",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ASCEND VITRO · TEACHING LABORATORY
            </div>
            <div style={{ fontWeight: 750, fontSize: 15.5 }}>
              Clinical Laboratory Report
            </div>
            <div
              style={{
                color: "var(--text-3)",
                fontSize: 11.5,
                marginTop: 2,
              }}
            >
              Simulation for training purposes only
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            <div>Report no: VITRO-{Date.now().toString().slice(-6)}</div>
            <div>{today} · {now}</div>
          </div>
        </div>

        {/* Two-column body: patient + request on the left,
            sample + result on the right. Stacks on phones. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 0,
          }}
        >
          {/* Left column — patient and request */}
          <div
            style={{
              padding: "18px 20px",
              borderRight: "1px solid var(--line)",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              PATIENT
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
              <div>
                <span style={{ color: "var(--text-3)" }}>Name: </span>
                <strong>{script.patientLabel.split("·")[0].trim()}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Age / Sex: </span>
                <strong>
                  {script.patientLabel.split("·")[1]?.trim() || ""}
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>
                  Hospital no: {" "}
                </span>
                <span className="mono">AN-2024-08417</span>
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Ward / Clinic: </span>
                Antenatal clinic
              </div>
            </div>

            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              REQUESTING CLINICIAN
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
              <div>
                <span style={{ color: "var(--text-3)" }}>Requested by: </span>
                Midwife, Antenatal team
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Clinical details: </span>
                Query anaemia at 34 weeks' gestation
              </div>
            </div>

            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              SAMPLE
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
              <div>
                <span style={{ color: "var(--text-3)" }}>Type: </span>
                Venous whole blood
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Tube: </span>
                Purple-top, EDTA
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Received: </span>
                {today} · {now}
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Condition: </span>
                Suitable for analysis
              </div>
            </div>
          </div>

          {/* Right column — the result itself */}
          <div style={{ padding: "18px 20px" }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              RESULT
            </div>

            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-3)",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                  Packed Cell Volume (PCV)
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: "var(--bad)",
                    border: "1px solid var(--bad)",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontWeight: 800,
                  }}
                >
                  LOW
                </div>
              </div>

              <div
                style={{
                  padding: "16px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}
                  >
                    VALUE
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "var(--amber-2)",
                    }}
                  >
                    {result || "0.31 L/L"}
                  </div>
                </div>
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}
                  >
                    REFERENCE RANGE
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-2)",
                      lineHeight: 1.5,
                    }}
                  >
                    0.36 – 0.46 L/L
                    <div style={{ fontSize: 11, fontWeight: 500 }}>
                      (adult female, non-pregnant)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              INTERPRETATION
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "var(--text)",
                borderLeft: "3px solid var(--amber)",
                paddingLeft: 12,
              }}
            >
              {interpretationText ||
                "PCV below the reference range. Report as anaemia. Recommend full blood count and blood film to identify the cause."}
            </div>

            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                fontWeight: 700,
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              AUTHORISATION
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
              <div>
                <span style={{ color: "var(--text-3)" }}>Reported by: </span>
                <span
                  style={{
                    fontFamily: "'Pacifico', cursive",
                    fontSize: 17,
                    color: "var(--amber-2)",
                  }}
                >
                  {/* A signature-style mark so the report reads
                      as an issued document, not a form. Same
                      cursive face the ASCEND wordmark uses. */}
                  A. Scientist
                </span>
              </div>
              <div>
                <span style={{ color: "var(--text-3)" }}>Designation: </span>
                Medical Laboratory Scientist (trainee)
              </div>
              <div className="mono" style={{ color: "var(--text-3)" }}>
                {today} · {now}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — a small simulation notice and the action. */}
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            background: "var(--bg-2)",
          }}
        >
          <div
            style={{
              color: "var(--text-3)",
              fontSize: 11.5,
              maxWidth: "48ch",
              lineHeight: 1.5,
            }}
          >
            This is a simulated report produced during VITRO training.
            It is not a real clinical result.
          </div>
          <button
            className="btn btn-a"
            style={{ padding: "10px 22px", fontSize: 14 }}
            onClick={() => onDone && onDone()}
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// VitroTubeBench — the reusable tube-and-sample bench, rebuilt
// as a real simulation.
//
// Every bench step now happens visibly on the bench. The student
// is not reading past a paragraph and tapping "Done"; they are
// watching the tube get labelled, the capillary fill, the
// seal go on, the sample get loaded into the centrifuge, and the
// rotor spin. Actions produce state; state produces the picture.
//
// The competency profile is unchanged from Step 5 — the tracking
// rides on exactly the same actions.
// ------------------------------------------------------------------
function VitroTubeBench({ script, courseId, app, onComplete, onLeave }) {
  // phase: rack → picked → labelling → filling → sealing →
  //        loading → spinning → interpret → results
  const [phase, setPhase] = useState("rack");
  const [pickedTube, setPickedTube] = useState(null);
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [analyserRan, setAnalyserRan] = useState(false);
  const [rotorStopped, setRotorStopped] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  // Narration on by default. A student can mute from the bench
  // header; the choice lasts for the session on this bench only.
  const [muted, setMuted] = useState(false);
  // Flips true for 400ms right when the label is being written,
  // so the tube visibly reacts. Purely a presentation flag.
  const [animatingLabel, setAnimatingLabel] = useState(false);
  // Flips true for 400ms right when the seal is going on.
  const [animatingSeal, setAnimatingSeal] = useState(false);
  // Flips true briefly while the tube is being wiped on the
  // gauze during the fill step.
  const [animatingFill, setAnimatingFill] = useState(false);
  // One-way latch: set true the moment the spin button is tapped
  // and never unset. Prevents a fast double-tap from re-entering
  // the spin handler while the animation is running.
  const [spinInProgress, setSpinInProgress] = useState(false);

  // Per-bench-step visual state. Each one is a boolean that
  // flips when the student performs that step, and the SVG
  // reads from it to draw the right picture.
  const [labelled, setLabelled] = useState(false);
  const [capillaryFill, setCapillaryFill] = useState("empty");
  const [capillarySealed, setCapillarySealed] = useState(false);
  const [centrifugeLoaded, setCentrifugeLoaded] = useState(false);

  const [competency, setCompetency] = useState({
    tube_selection: undefined,
    sample_handling: undefined,
    instrument_operation: undefined,
    result_interpretation: undefined,
  });
  const [interpPick, setInterpPick] = useState(null);
  const [actionPick, setActionPick] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const correct = pickedTube && pickedTube === script.correctTube;

  const steps = Array.isArray(script && script.benchSteps)
    ? script.benchSteps
    : null;
  const interpretation =
    script && script.interpretation ? script.interpretation : null;

  const scriptId = script && script.id ? script.id : "";
  useEffect(() => {
    setPhase("rack");
    setPickedTube(null);
    setWrongFeedback(null);
    setAnalyserRan(false);
    setStepIdx(0);
    setLabelled(false);
    setCapillaryFill("empty");
    setCapillarySealed(false);
    setCentrifugeLoaded(false);
    setSpinInProgress(false);
    setCompetency({
      tube_selection: undefined,
      sample_handling: undefined,
      instrument_operation: undefined,
      result_interpretation: undefined,
    });
    setInterpPick(null);
    setActionPick(null);
  }, [scriptId]);

    // ---- Narration ----
  // The narrator reads the text the student is already looking
  // at, not a separate script. For the four bench steps that
  // means `steps[i].instruction`, which is the same string
  // rendered in the worktop card. For the analyser step it
  // means `script.analyser.action`. For the framing moments
  // (the request, feedback after a tube pick, the two
  // questions, the results) it means the short intro/feedback
  // lines in `script.narration`, which do not duplicate any
  // on-screen paragraph — those phases have no long
  // instruction, just the question or the feedback itself.
  //
  // No parallel caption bar. The text on screen IS the
  // narration. Muting silences the voice, nothing else changes.
  const narration = (script && script.narration) || {};
  useEffect(() => {
    if (muted) {
      vitroStopSpeaking();
      return;
    }
    // Small delay before the bench speaks anything. The
    // donning screen only advances when its own completion
    // line has finished, so in normal use the engine is idle
    // when we mount. The delay is a safety net against any
    // residual queued utterance from the previous screen.
    const timer = setTimeout(() => {
      const line = (() => {
        switch (phase) {
          case "rack":
            return narration.intro;
          case "picked":
            return correct
              ? narration.afterCorrectTube
              : narration.afterWrongTube;
          case "labelling":
            return steps && steps[0] ? steps[0].instruction : null;
          case "filling":
            return steps && steps[1] ? steps[1].instruction : null;
          case "sealing":
            return steps && steps[2] ? steps[2].instruction : null;
          case "loading":
            return steps && steps[3] ? steps[3].instruction : null;
                  case "spinning":
          return analyserRan ? narration.reading : script.analyser.action;
        case "interpret":
          // Handled specially below — the question and its
          // options are read in full, not just a header line.
          return null;
        case "action":
          // Handled specially below.
          return null;
        case "results":
          return narration.results;
        default:
          return null;
      }
    })();
      if (line) vitroSpeak(line);

      // The two scored questions are NOT read aloud. The
      // student reads them on screen. This matches the brief:
      // the voice guides the lab procedure, the student reads
      // the questions and thinks about them.
      //
      // Nothing to do for interpret/action here — the switch
      // above already returns null for those phases, so no
      // line fires. The `interpPick`/`actionPick` dependencies
      // were only needed when the questions were spoken; kept
      // in the array so the effect still re-runs when they
      // change (harmless, no line to speak).
    }, 250);
    return () => clearTimeout(timer);
  }, [phase, analyserRan, muted, stepIdx, interpPick, actionPick]);

  // Stop the voice the moment the student leaves the bench.
  useEffect(() => {
    return () => vitroStopSpeaking();
  }, []);

  const goBack = () => {
    // If the parent passed onLeave, it means the student is on
    // the way out of the lab — the parent handles the doffing
    // gate before actually navigating. Otherwise (no parent
    // handler) we navigate directly, which is the pre-doffing
    // behaviour and is still correct for a student who has
    // already doffed this session.
    if (typeof onLeave === "function") {
      onLeave();
      return;
    }
    if (app && typeof app.go === "function") {
      if (courseId) {
        app.go("course", { courseId });
      } else {
        app.go("courses");
      }
    }
  };

  const pickTube = (cap) => {
    if (phase !== "rack") return;
    setPickedTube(cap);
    if (cap === script.correctTube) {
      setCompetency((c) => ({
        ...c,
        tube_selection: c.tube_selection === false ? false : true,
      }));
      setWrongFeedback(null);
      setPhase("picked");
    } else {
      setCompetency((c) => ({ ...c, tube_selection: false }));
      setWrongFeedback({
        cap,
        message:
          (script.wrongTubes && script.wrongTubes[cap]) ||
          `${TUBE_LIBRARY[cap] ? TUBE_LIBRARY[cap].label : "That tube"} is not the right one for this request. ${
            TUBE_LIBRARY[cap] ? TUBE_LIBRARY[cap].notFor : ""
          }`.trim(),
      });
      setPhase("picked");
    }
  };

  const beginSteps = () => {
    if (phase !== "picked") return;
    if (steps && steps.length > 0) {
      setStepIdx(0);
      setPhase("labelling");
    } else {
      setPhase("spinning");
    }
  };

  // Each step is triggered by a specific button, and does exactly
  // one visible thing on the bench, then advances the phase.
  const doLabel = () => {
    if (phase !== "labelling") return;
    setAnimatingLabel(true);
    // The visible label lands a beat after the shake starts, so
    // the pen-then-text sequence reads correctly.
    setTimeout(() => setLabelled(true), 200);
    setTimeout(() => setAnimatingLabel(false), 700);
    setTimeout(() => {
      setStepIdx(1);
      setPhase("filling");
    }, 900);
  };

  const doFill = () => {
    if (phase !== "filling") return;
    // Wipe the tube against the gauze first — a visible action,
    // so the student sees the wipe that the instruction names.
    setAnimatingFill(true);
    setTimeout(() => setAnimatingFill(false), 700);
    // Then fill the capillary.
    setTimeout(() => setCapillaryFill("partial"), 300);
    setTimeout(() => setCapillaryFill("full"), 500);
    setTimeout(() => {
      setStepIdx(2);
      setPhase("sealing");
    }, 1100);
  };

  const doSeal = () => {
    if (phase !== "sealing") return;
    // Push the capillary down into the clay, then bring it back
    // up with the plug in place. The clay-drop animation inside
    // VitroCapillarySvg handles the plug itself; the wipe
    // animation here is the visible "into the block and back"
    // motion the instruction describes.
    setAnimatingSeal(true);
    setCapillarySealed(true);
    setTimeout(() => setAnimatingSeal(false), 700);
    setTimeout(() => {
      setStepIdx(3);
      setPhase("loading");
    }, 1100);
  };

  const doLoad = () => {
    if (phase !== "loading") return;
    setCentrifugeLoaded(true);
    setCompetency((c) => ({ ...c, sample_handling: true }));
    setTimeout(() => {
      setStepIdx(4);
      setPhase("spinning");
    }, 600);
  };

  const doSpin = () => {
    // Three guards, all belt-and-suspenders, in case a fast
    // double-tap races the state update:
    //   1. phase must still be "spinning"
    //   2. analyserRan must still be false
    //   3. spinInProgress must still be false
    // The spin is one-way. Nothing stops it once started.
    if (phase !== "spinning" || analyserRan || spinInProgress) return;
    setSpinInProgress(true);
    setAnalyserRan(true);
    setCompetency((c) => ({ ...c, instrument_operation: true }));

    // Speak the "reading" line once the spin animation has
    // visually completed. Then, when that line has finished
    // speaking, hold for a beat before showing the question —
    // long enough for the student to read the result and the
    // reference range on the readout, and to see the reader
    // card that has just appeared on the bench. Without this,
    // the question card lands on top of a readout the student
    // has not had time to look at.
    // The run is over — in a real machine the rotor coasts to
    // a halt the moment the timer ends. Stop the animation
    // here, on the same 3-second beat the spin itself uses,
    // so the student sees the rotor wind down as the result
    // appears on the readout.
    setTimeout(() => setRotorStopped(true), 3000);

    const readingLine = (script.narration && script.narration.reading) || "";
    setTimeout(() => {
      if (readingLine) {
        vitroSpeak(readingLine, () => {
          setTimeout(() => {
            setPhase(interpretation ? "interpret" : "results");
          }, 1800);
        });
      } else {
        setTimeout(() => {
          setPhase(interpretation ? "interpret" : "results");
        }, 1800);
      }
    }, 3000);
  };

  const answerInterpretation = (idx) => {
    if (interpPick !== null) return;
    setInterpPick(idx);
    const wasCorrect = idx === interpretation.correctIndex;
    setCompetency((c) => ({
      ...c,
      result_interpretation: wasCorrect,
    }));
    // Announce the outcome, then tell the student to tap the
    // Next question button — so the button they're about to
    // press is named before they press it.
    const outcomeLine = wasCorrect
      ? "That is correct. When you are ready, tap the button that says Next question to continue."
      : "That is not correct. Read the explanation on the screen, then tap the button that says Next question to continue.";
    // Cut whatever is still being read (the tail of the MCQ
    // read-aloud, if the student tapped early) and speak the
    // outcome immediately. The outcome is what matters now;
    // the rest of the read is stale.
    vitroStopSpeaking();
    vitroSpeak(outcomeLine);
  };

  const answerAction = (idx) => {
    if (actionPick !== null) return;
    setActionPick(idx);
    const wasCorrect = idx === script.reportableAction.correctIndex;
    setCompetency((c) => ({
      ...c,
      reportable_action: wasCorrect,
    }));
    // Announce the outcome, then name the button the student
    // is about to tap — See your competencies — before they
    // tap it.
    const outcomeLine = wasCorrect
      ? "That is correct. When you are ready, tap the button that says See your competencies to finish the practical."
      : "That is not correct. Read the explanation on the screen, then tap the button that says See your competencies to finish the practical.";
    vitroStopSpeaking();
    vitroSpeak(outcomeLine);
  };

  const goToResults = () => {
    setPhase("results");
    // Report the finished attempt upward, once. The parent folds
    // it into progress and persists. This is the only place
    // VitroTubeBench talks to the outside world — everything
    // else is internal state.
    if (typeof onComplete === "function") {
      onComplete(script.id, competency);
    }
  };

  // "See your competencies" now opens the lab report first.
  // The competencies are the last thing the student sees, after
  // the report has been reviewed and submitted.
  const openReport = () => setShowReport(true);
  const submitReport = () => {
    setShowReport(false);
    goToResults();
  };

  const resetBench = () => {
    setPhase("rack");
    setPickedTube(null);
    setWrongFeedback(null);
    setAnalyserRan(false);
    setStepIdx(0);
    setLabelled(false);
    setCapillaryFill("empty");
    setCapillarySealed(false);
    setCentrifugeLoaded(false);
    setSpinInProgress(false);
    setRotorStopped(false);
    setCompetency({
      tube_selection: undefined,
      sample_handling: undefined,
      instrument_operation: undefined,
      result_interpretation: undefined,
    });
    setInterpPick(null);
    setActionPick(null);
  };

  
  const centrifugeState =
    analyserRan && !rotorStopped
      ? "spin"
      : centrifugeLoaded
      ? "loaded"
      : "idle";
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // The headline for the current bench step. Short, clinical.
  const benchHeadline = {
    labelling: "Label the tube.",
    filling: "Fill the capillary.",
    sealing: "Seal the dry end.",
    loading: "Load the centrifuge.",
    spinning: analyserRan ? "Reading the result." : "Spin the sample.",
  }[phase];

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header strip — patient + request, always visible.
          Carries a mute button for the narrator voice. */}
      <div
        className="card"
        style={{
          borderColor: "var(--amber)",
          padding: 16,
          background: "var(--bg-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "var(--amber-2)", margin: 0 }}
          >
            VITRO · Simulation
          </div>
          <button
            onClick={() => {
              setMuted((m) => {
                const next = !m;
                if (next) vitroStopSpeaking();
                return next;
              });
            }}
            title={muted ? "Narration muted — tap to unmute" : "Narration on — tap to mute"}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "4px 10px",
              color: muted ? "var(--text-3)" : "var(--amber-2)",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.03em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {muted ? "MUTED" : "NARRATING"}
          </button>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="eyebrow"
              style={{ margin: 0, color: "var(--amber-2)" }}
            >
              Patient
            </span>
            <span style={{ fontWeight: 650, fontSize: 13.5 }}>
              {script.patientLabel}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span
              className="eyebrow"
              style={{ margin: 0, color: "var(--amber-2)" }}
            >
              Request
            </span>
            <span
              style={{
                color: "var(--text-2)",
                fontSize: 13.5,
                lineHeight: 1.55,
              }}
            >
              {script.request}
            </span>
          </div>
        </div>
      </div>

      {/* Bench headline — short, clinical, above the bench. */}
      {benchHeadline && (
        <div
          className="card"
          style={{
            marginTop: 12,
            borderColor: "var(--amber)",
            padding: "12px 16px",
          }}
        >
          <div style={{ fontWeight: 750, fontSize: 15 }}>
            {benchHeadline}
          </div>
        </div>
      )}

      

      {/* The bench — tube rack on the left, worktop on the right
          on wide screens; stacked on narrow phones so the
          centrifuge stays on screen. The minmax(0, 1fr) on each
          column is deliberate: without the 0 minimum, a column
          with a fixed-width child (the centrifuge SVG) forces the
          grid wider than the viewport and pushes content off the
          right edge, which is what made the machine invisible on
          phones. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {/* ---- Tube rack ---- */}
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Tube rack
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
              gap: 8,
            }}
          >
            {Object.keys(TUBE_LIBRARY).map((cap) => {
              const isPicked = pickedTube === cap;
              const isCorrect = cap === script.correctTube;
              const showCorrect =
                phase !== "rack" && isCorrect && correct;
              const showWrong =
                phase !== "rack" && isPicked && !isCorrect;
              return (
                <button
                  key={cap}
                  onClick={() => pickTube(cap)}
                  disabled={phase !== "rack"}
                  style={{
                    padding: 6,
                    borderRadius: 10,
                    border: showCorrect
                      ? "1.5px solid var(--good)"
                      : showWrong
                      ? "1.5px solid var(--bad)"
                      : isPicked
                      ? "1.5px solid var(--amber)"
                      : "1px solid var(--line)",
                    background: "var(--bg-3)",
                    cursor: phase === "rack" ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <VitroTubeSvg cap={cap} filled={false} size={34} />
                  <span
                    className="mono"
                    style={{
                      fontSize: 9.5,
                      color: "var(--text-3)",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                    }}
                  >
                    {cap}
                  </span>
                </button>
              );
            })}
          </div>

          <details
            style={{
              marginTop: 12,
              borderTop: "1px solid var(--line)",
              paddingTop: 10,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontSize: 12.5,
                color: "var(--text-2)",
                fontWeight: 600,
                listStyle: "none",
              }}
            >
              Tube reference (tap to open)
            </summary>
            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 10,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: "var(--text-2)",
              }}
            >
              {Object.entries(TUBE_LIBRARY).map(([cap, info]) => (
                <div key={cap}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: 12.5,
                    }}
                  >
                    {info.label}
                  </div>
                  <div>{info.contains}</div>
                  <div style={{ color: "var(--text-3)" }}>
                    <strong>For: </strong>
                    {info.purpose}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* ---- Worktop ---- */}
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Worktop
          </div>

          {phase === "rack" && (
            <div
              style={{
                color: "var(--text-3)",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Pick a tube from the rack to begin.
            </div>
          )}

          {/* Picked tube — always visible once chosen */}
          {pickedTube && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{ position: "relative" }}
                className={
                  animatingLabel
                    ? "vitro-anim-tube-shake"
                    : animatingFill
                    ? "vitro-anim-tube-wipe"
                    : ""
                }
              >
                <VitroTubeSvg
                  cap={pickedTube}
                  filled={phase !== "picked" && phase !== "rack"}
                  labelled={labelled}
                  labelText={
                    script.patientLabel.split(" ")[0] +
                    "\n" +
                    todayLabel +
                    "\n" +
                    "VITRO"
                  }
                  size={52}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 650, fontSize: 13.5 }}>
                  {TUBE_LIBRARY[pickedTube].label}
                </div>
                <div
                  style={{
                    color: "var(--text-3)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {labelled
                    ? `Labelled · ${script.patientLabel.split(" ")[0]} · ${todayLabel}`
                    : "Tube selected."}
                </div>
              </div>
            </div>
          )}

          {/* Interpret feedback on wrong-tube pick */}
          {phase === "picked" && !correct && wrongFeedback && (
            <div
              style={{
                borderLeft: "3px solid var(--bad)",
                paddingLeft: 12,
                color: "var(--text-2)",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <div
                className="eyebrow"
                style={{ color: "var(--bad)", marginBottom: 6 }}
              >
                Not this tube
              </div>
              <div>{wrongFeedback.message}</div>
              <button
                className="btn btn-g btn-sm"
                style={{ marginTop: 10 }}
                onClick={resetBench}
              >
                Try another tube
              </button>
            </div>
          )}

          {/* Correct-tube confirmation */}
          {phase === "picked" && correct && (
            <>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 10,
                }}
              >
                {script.correctTubesFeedback}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={beginSteps}
              >
                Begin the practical
              </button>
            </>
          )}

          {/* ---- Step: labelling ---- */}
          {phase === "labelling" && (
            <div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {steps[0].instruction}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={doLabel}
                disabled={animatingLabel}
              >
                {animatingLabel ? "Writing…" : "Write the label"}
              </button>
            </div>
          )}

          {/* ---- Step: filling ---- */}
          {phase === "filling" && (
            <div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {steps[1].instruction}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={doFill}
                disabled={capillaryFill !== "empty"}
              >
                {capillaryFill !== "empty" ? "Filling…" : "Fill the capillary"}
              </button>
            </div>
          )}

          {/* ---- Step: sealing ---- */}
          {phase === "sealing" && (
            <div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {steps[2].instruction}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={doSeal}
                disabled={animatingSeal}
              >
                {animatingSeal ? "Sealing…" : "Seal the dry end"}
              </button>
            </div>
          )}

          {/* ---- Step: loading ---- */}
          {phase === "loading" && (
            <div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {steps[3].instruction}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={doLoad}
                disabled={centrifugeLoaded}
              >
                {centrifugeLoaded ? "Loading…" : "Load the centrifuge"}
              </button>
            </div>
          )}

          {/* ---- Step: spinning ----
              Three states, and the button is a one-way action:
                • Idle (before tap)      — "Start the spin" button.
                • Running (during spin)  — "Spinning…" disabled
                                            button, cannot be stopped.
                • Done (after spin)      — button gone, readout shown.
              The spin cannot be interrupted. Nothing on this screen
              stops the rotor; only the timer inside doSpin ends it. */}
          {phase === "spinning" && (
            <div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {script.analyser.action}
              </div>

              {!analyserRan && (
                <button
                  className="btn btn-a btn-sm"
                  onClick={doSpin}
                  disabled={spinInProgress}
                >
                  {spinInProgress ? "Spinning…" : "Start the spin"}
                </button>
              )}

              {analyserRan && (
                <>
                  <div
                    className="mono"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--amber-2)",
                      padding: "10px 12px",
                      background: "var(--bg-3)",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                    }}
                  >
                    {script.analyser.result}
                  </div>
                  {script.analyser.reference && (
                    <div
                      style={{
                        color: "var(--text-3)",
                        fontSize: 12.5,
                        marginTop: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      {script.analyser.reference}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---- Bench objects ----
              Everything the narrator names appears here. Each
              object appears the moment the step that uses it
              becomes active, and stays visible while that step
              and later steps are in progress. Nothing the voice
              says is invisible to the student. */}
          {(phase === "filling" ||
            phase === "sealing" ||
            phase === "loading" ||
            phase === "spinning") && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Row 1: capillary + gauze (fill step) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 24,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                  className={animatingSeal ? "vitro-anim-capillary-seal" : ""}
                >
                  <VitroCapillarySvg
                    fill={capillaryFill}
                    sealed={capillarySealed}
                    height={100}
                  />
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    CAPILLARY
                  </div>
                </div>

                {/* Gauze appears while filling or sealing is
                    the active step, since the instruction tells
                    the student to wipe the tube on gauze. */}
                {(phase === "filling" ||
                  phase === "sealing" ||
                  phase === "loading" ||
                  phase === "spinning") && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <VitroGauzeSvg
                      size={64}
                      used={capillaryFill !== "empty"}
                    />
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      GAUZE
                    </div>
                  </div>
                )}

                {/* Sealing clay appears while sealing is the
                    active step, so the student can see what the
                    voice names. */}
                {(phase === "sealing" ||
                  phase === "loading" ||
                  phase === "spinning") && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <VitroSealingClaySvg
                      size={62}
                      used={capillarySealed}
                    />
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      SEALING CLAY
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: centrifuge, then reader card beside it
                  once the spin has run and the student is about
                  to read the result. */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 20,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <VitroCentrifugeSvg
                  state={centrifugeState}
                  result={analyserRan ? script.analyser.result : null}
                />
                {analyserRan && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <VitroReaderCardSvg size={96} />
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      READER CARD
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Interpretation ---- */}
            {/* ---- Interpretation: question 1 ---- */}
      {phase === "interpret" && interpretation && (
        <div
          className="card"
          style={{
            marginTop: 12,
            borderColor: "var(--amber-2)",
            padding: 16,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "var(--amber-2)", marginBottom: 8 }}
          >
            Interpretation
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14.5,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {interpretation.question}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {interpretation.options.map((opt, i) => {
              const picked = interpPick === i;
              const isCorrect = i === interpretation.correctIndex;
              const reveal = interpPick !== null;
              return (
                <button
                  key={i}
                  onClick={() => answerInterpretation(i)}
                  disabled={reveal}
                  className="card hover"
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    cursor: reveal ? "default" : "pointer",
                    border: reveal
                      ? isCorrect
                        ? "1.5px solid var(--good)"
                        : picked
                        ? "1.5px solid var(--bad)"
                        : "1px solid var(--line)"
                      : "1px solid var(--line)",
                    background: reveal
                      ? isCorrect
                        ? "var(--good-dim)"
                        : picked
                        ? "var(--bad-dim)"
                        : "var(--bg-2)"
                      : "var(--bg-2)",
                    color: "var(--text)",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {interpPick !== null && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  color:
                    interpPick === interpretation.correctIndex
                      ? "var(--good)"
                      : "var(--bad)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  marginBottom: 6,
                }}
              >
                {interpPick === interpretation.correctIndex
                  ? "Correct."
                  : "Not this."}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.65,
                }}
              >
                {interpPick === interpretation.correctIndex
                  ? "The result is below reference range. Pregnancy lowers PCV modestly, but not to 0.31 L/L, and her haemoglobin of 9.4 g/dL confirms anaemia. The correct action is to report the result as anaemia, not to normalise it because of pregnancy."
                  : interpretation.wrongFeedback[interpPick]}
              </div>
              <button
                className="btn btn-a btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => setPhase("action")}
              >
                Next question
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Interpretation: question 2, the reportable action ---- */}
      {phase === "action" && script.reportableAction && (
        <div
          className="card"
          style={{
            marginTop: 12,
            borderColor: "var(--amber-2)",
            padding: 16,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "var(--amber-2)", marginBottom: 8 }}
          >
            Reportable action
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14.5,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {script.reportableAction.question}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {script.reportableAction.options.map((opt, i) => {
              const picked = actionPick === i;
              const isCorrect = i === script.reportableAction.correctIndex;
              const reveal = actionPick !== null;
              return (
                <button
                  key={i}
                  onClick={() => answerAction(i)}
                  disabled={reveal}
                  className="card hover"
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    cursor: reveal ? "default" : "pointer",
                    border: reveal
                      ? isCorrect
                        ? "1.5px solid var(--good)"
                        : picked
                        ? "1.5px solid var(--bad)"
                        : "1px solid var(--line)"
                      : "1px solid var(--line)",
                    background: reveal
                      ? isCorrect
                        ? "var(--good-dim)"
                        : picked
                        ? "var(--bad-dim)"
                        : "var(--bg-2)"
                      : "var(--bg-2)",
                    color: "var(--text)",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {actionPick !== null && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  color:
                    actionPick === script.reportableAction.correctIndex
                      ? "var(--good)"
                      : "var(--bad)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  marginBottom: 6,
                }}
              >
                {actionPick === script.reportableAction.correctIndex
                  ? "Correct."
                  : "Not this."}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.65,
                }}
              >
                {actionPick === script.reportableAction.correctIndex
                  ? script.outcome
                  : script.reportableAction.wrongFeedback[actionPick]}
              </div>
              <button
                className="btn btn-a btn-sm"
                style={{ marginTop: 12 }}
                onClick={openReport}
              >
                See your competencies
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Lab report ----
          Shown after question two, before the competencies.
          The report is what the student's work would produce
          if it were issued to the requesting clinician, so it
          reads as the payoff of the whole practical. The
          student reviews it, then taps Submit report to see
          the competencies. */}
      {showReport && (
        <VitroLabReport
          script={script}
          result={script.analyser.result}
          interpretationText={script.outcome}
          onDone={submitReport}
          speak={vitroSpeak}
        />
      )}

      {/* ---- Results ----
          Only rendered when the report has been submitted AND
          the phase has moved to results. The showReport flag
          keeps the report visible on top of the results state
          until the student taps Submit. */}
      {phase === "results" && !showReport && (
        <div style={{ marginTop: 12 }}>
          <div
            className="card"
            style={{
              borderColor: "var(--amber)",
              padding: 18,
            }}
          >
            <div
              className="eyebrow"
              style={{ color: "var(--amber-2)", marginBottom: 6 }}
            >
              Competencies
            </div>
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              What you demonstrated
            </div>
            <div
              style={{
                color: "var(--text-3)",
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              Each competency is assessed independently.
            </div>

            {(() => {
              const list =
                VITRO_COMPETENCIES[script.id] ||
                VITRO_COMPETENCIES["ph2p:2"] ||
                [];
              const failedIds = list
                .filter((comp) => competency[comp.id] === false)
                .map((comp) => comp.id);
              return (
                <>
                  <div style={{ display: "grid", gap: 10 }}>
                    {list.map((comp) => {
                      const state = competency[comp.id];
                      const passed = state === true;
                      const failed = state === false;
                      return (
                        <div
                          key={comp.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: passed
                              ? "1px solid var(--good)"
                              : failed
                              ? "1px solid var(--bad)"
                              : "1px solid var(--line)",
                            background: passed
                              ? "var(--good-dim)"
                              : failed
                              ? "var(--bad-dim)"
                              : "var(--bg-2)",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              flexShrink: 0,
                              width: 20,
                              height: 20,
                              borderRadius: 5,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: passed
                                ? "var(--good)"
                                : failed
                                ? "var(--bad)"
                                : "var(--bg-3)",
                              color: passed
                                ? "#08210F"
                                : failed
                                ? "#2A0A06"
                                : "var(--text-3)",
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {passed ? "✓" : failed ? "✕" : "–"}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 13.5,
                                marginBottom: 2,
                              }}
                            >
                              {comp.label}
                            </div>
                            <div
                              style={{
                                color: "var(--text-2)",
                                fontSize: 12.5,
                                lineHeight: 1.5,
                              }}
                            >
                              {comp.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {failedIds.length > 0 && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 14,
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-2)",
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginBottom: 10,
                        }}
                      >
                        You have a not-yet-passed competency. Read the
                        theory that covers it, then come back and run
                        the practical again.
                      </div>
                      <button
                        className="btn btn-g btn-sm"
                        onClick={() => {
                          if (
                            app &&
                            typeof app.go === "function" &&
                            courseId
                          ) {
                            app.go("topic", {
                              courseId,
                              topicId: app.practicalId,
                            });
                          }
                        }}
                      >
                        Read the theory behind this
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn btn-a btn-sm"
                      onClick={resetBench}
                    >
                      Try again
                    </button>
                    <button
                      className="btn btn-g btn-sm"
                      onClick={goBack}
                    >
                      Leave the lab
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <button
        className="btn btn-g btn-sm"
        style={{ marginTop: 14 }}
        onClick={goBack}
      >
        Leave the lab
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// VitroPracticalPlaceholder — shown when VITRO is opened from a
// specific practical topic card.
//
// Three states, in order:
//
//   1. Donning not yet passed this session → VitroDonning
//   2. Donning passed, a script exists for this practical → bench
//   3. Donning passed, no script yet → "Bench in build" card
//
// Step 3 has one script (PLACEHOLDER_SCRIPT), so state 2 is
// currently unreachable from any real practical — every topic
// still falls through to state 3. Step 4 flips one practical
// (PCV) onto the real script and turns the placeholder off for
// it. The wiring is here so that flip is a one-line change, not
// a rebuild.
// ------------------------------------------------------------------
// Persistent "back" control shown above every stage of the practical
// flow. A student who opened a practical by mistake, or who wants to
// bail out partway through, otherwise has no way out - each stage
// here is just internal component state, not a real route change, so
// the device's own back button isn't reliable mid-flow.
function VitroBackBar({ onBack, label = "Back to the course" }) {
  return (
    <button
      onClick={onBack}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        color: "var(--text-2)",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        padding: "4px 0 12px",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
      {label}
    </button>
  );
}

function VitroPracticalPlaceholder({ practicalTitle, courseId, app }) {
  const donnedKey = "ascend_vitro_donned";
  const scientistKey = "ascend_vitro_scientist";
  const enteredKey = "ascend_vitro_entered";
  const doffedKey = "ascend_vitro_doffed";

  const [donned, setDonned] = useState(() => {
    try {
      return sessionStorage.getItem(donnedKey) === "1";
    } catch {
      return false;
    }
  });

  // Whether the student has pressed "Enter the lab". After this
  // is true the bench renders. Kept per session so a student
  // who walks away from the bench and comes back does not have
  // to re-enter through the door.
  const [entered, setEntered] = useState(() => {
    try {
      return sessionStorage.getItem(enteredKey) === "1";
    } catch {
      return false;
    }
  });

  // Whether the student has already doffed this session.
  // Doffing fires once per session, on the way out of the last
  // practical the student runs. Same per-session pattern as
  // the donning gate.
  const [doffed, setDoffed] = useState(() => {
    try {
      return sessionStorage.getItem(doffedKey) === "1";
    } catch {
      return false;
    }
  });

  // Set this to true when the student has finished the bench
  // and wants to leave. The placeholder then either shows
  // doffing (if not yet doffed) or navigates them straight back
  // to the course.
  const [leaving, setLeaving] = useState(false);

  // Which scientist the student is running this session as.
  // null before they pick, then "male" or "female". Kept in
  // sessionStorage so a navigation away and back does not
  // re-ask — but a fresh session does.
  const [character, setCharacter] = useState(() => {
    try {
      const v = sessionStorage.getItem(scientistKey);
      return v === "male" || v === "female" ? v : null;
    } catch {
      return null;
    }
  });

  const passDonning = () => {
    try {
      sessionStorage.setItem(donnedKey, "1");
    } catch {}
    setDonned(true);
  };

  const enterLab = () => {
    try {
      sessionStorage.setItem(enteredKey, "1");
    } catch {}
    setEntered(true);
  };

  const finishDoffing = () => {
    try {
      sessionStorage.setItem(doffedKey, "1");
    } catch {}
    setDoffed(true);
    setLeaving(false);
    // Navigate the student back to the course after doffing
    // completes.
    goBack();
  };

  const pickScientist = (sex) => {
    try {
      sessionStorage.setItem(scientistKey, sex);
    } catch {}
    setCharacter(sex);
  };

  const goBack = () => {
    if (app && typeof app.go === "function") {
      if (courseId) {
        app.go("course", { courseId });
      } else {
        app.go("courses");
      }
    }
  };

  // Stop the narrator the moment the student leaves the practical
  // entirely (navigates away, closes the tab, etc.) - otherwise a
  // line queued or mid-sentence here keeps playing into a screen
  // that no longer matches it.
  useEffect(() => {
    return () => {
      vitroStopSpeaking();
    };
  }, []);

  // ---- Stage 1: choose a scientist ----
  if (!character) {
    return (
      <>
        <VitroBackBar onBack={goBack} />
        <VitroCharacterPicker onPick={pickScientist} />
      </>
    );
  }

  // ---- Stage 2: donning ----
  // The donning screen uses the same voice engine as the bench.
  // The speak and stopSpeaking helpers are shared through the
  // props, so muting once carries across both screens.
  if (!donned) {
    return (
      <>
        <VitroBackBar onBack={() => { vitroStopSpeaking(); goBack(); }} />
        <VitroDonning
          onPass={passDonning}
          character={character}
          speak={vitroSpeak}
          stopSpeaking={vitroStopSpeaking}
        />
      </>
    );
  }

  // ---- Stage 3: enter the lab ----
  // Donning is complete. Before the bench, the student presses
  // Enter the lab. This mirrors the real transition from the
  // changing area into the laboratory itself.
  if (!entered) {
    return (
      <>
        <VitroBackBar onBack={() => { vitroStopSpeaking(); goBack(); }} />
        <VitroEnterLab
          character={character}
          onEnter={enterLab}
          speak={vitroSpeak}
        />
      </>
    );
  }

  // ---- Stage 4: leaving the lab / doffing ----
  // The student has left the bench (via Back to the course).
  // If they have not doffed this session, they doff now. The back
  // control here means "actually, I want to stay" - it cancels the
  // leaving intent and drops them back at the bench, rather than
  // forcing them through an exit they didn't mean to start.
  if (leaving && !doffed) {
    return (
      <>
        <VitroBackBar
          label="Stay in the lab"
          onBack={() => { vitroStopSpeaking(); setLeaving(false); }}
        />
        <VitroDoffing
          character={character}
          onPass={finishDoffing}
          speak={vitroSpeak}
          stopSpeaking={vitroStopSpeaking}
        />
      </>
    );
  }

  // ---- Stage 5: the bench ----
  const practicalKey =
    courseId !== null && app && app.practicalId !== undefined
      ? `${courseId}:${app.practicalId}`
      : null;
  const scriptForThisPractical = practicalKey
    ? VITRO_SCRIPTS[practicalKey] || null
    : null;

  if (scriptForThisPractical) {
    return (
      <>
        <VitroBackBar
          label="Leave the lab"
          onBack={() => { vitroStopSpeaking(); setLeaving(true); }}
        />
        <VitroTubeBench
          script={scriptForThisPractical}
          courseId={courseId}
          app={app}
          onComplete={(scriptId, competencyMap) => {
            if (
              app &&
              typeof app.recordVitroAttempt === "function"
            ) {
              app.recordVitroAttempt(scriptId, competencyMap);
            }
          }}
          onLeave={() => setLeaving(true)}
        />
      </>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{
          borderColor: "rgba(245,185,63,.35)",
          padding: 20,
        }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--amber-2)", marginBottom: 8 }}
        >
          Bench in build
        </div>
        <div
          style={{
            color: "var(--text-2)",
            fontSize: 13.5,
            lineHeight: 1.55,
            maxWidth: "60ch",
          }}
        >
          The VITRO bench for{" "}
          <strong style={{ color: "var(--text)" }}>
            {practicalTitle || "this practical"}
          </strong>{" "}
          is being built. When it arrives, you will enter the lab here
          — run the steps of the practical in order, see the results,
          and get scored on the competencies this practical trains.
        </div>

        <button
          className="btn btn-g btn-sm"
          style={{ marginTop: 16 }}
          onClick={goBack}
        >
          Back to the course
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// VitroView — the top-level component rendered when the app routes
// to the VITRO view.
//
// Two states:
//
//   1. Opened directly (no practical preselected) → VitroHome
//   2. Opened from a practical topic card           → placeholder
//                                                     for that
//                                                     practical
//
// The routing from a practical topic card passes the practical's
// id and title through `app` (fed from the route object), so this
// component knows which practical was requested and which course
// it belongs to.
// Named export alongside the default. App.js imports this so a
// completed VITRO attempt can be folded into progress without
// duplicating the merge logic.
export { recordVitroAttempt, VITRO_COMPETENCIES };
// ------------------------------------------------------------------
export default function VitroView({ app }) {
  const practicalId =
    app && app.practicalId !== undefined ? app.practicalId : null;
  const practicalTitle =
    app && app.practicalTitle ? app.practicalTitle : null;
  const courseId = app && app.courseId ? app.courseId : null;

  return (
    <div className="view">
      <VitroBenchStyles />
      <div className="eyebrow">VITRO</div>
      <h1
        style={{
          fontSize: "clamp(22px,4vw,28px)",
          margin: "6px 0 4px",
        }}
      >
        {practicalId !== null
          ? practicalTitle || "Practical"
          : "The virtual laboratory"}
      </h1>

      {practicalId !== null ? (
        <VitroPracticalPlaceholder
          practicalTitle={practicalTitle}
          courseId={courseId}
          app={app}
        />
      ) : (
        <VitroHome />
      )}
    </div>
  );
}