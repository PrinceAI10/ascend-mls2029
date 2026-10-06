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
import React, { useState, useEffect, useRef, useMemo } from "react";
import { AVATAR_SKIN_TONES, AVATAR_HAIR_COLORS, AVATAR_OUTFIT_COLORS } from "./avatarConstants";

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
// VitroScientistSvg — one medical laboratory scientist, drawn
// as a full-body SVG. Two figures exist, male and female, and
// they are distinct people, not the same figure with a hair
// swap. The male is broader at the shoulders and straighter at
// the hip; the female is narrower at the shoulder, tapered at
// the waist, and wider at the hip. Each has a fixed palette so
// the two read as colleagues — two different scientists in the
// same lab — not one scientist drawn twice.

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

  // Fixed palettes. Two distinct identities, not derived from
  // the student's avatar — that's the point of choosing.
  const skin = isFemale ? "#C68642" : "#6B4226";
  const hair = isFemale ? "#1B1210" : "#1B1210";
  const underlayer = isFemale ? "#4C6B5A" : "#3E5E7A";
  const labCoat = "#F4F6FA";
  const trousers = isFemale ? "#2E3A55" : "#2E3A55";
  const shoes = "#1B1B1F";

  // Body outline stroke, theme-aware so the figure flips with
  // dark / light / system.
  const outline = "var(--line-2)";

  // The torso silhouette. Female: narrower at the shoulder,
  // tapered at the waist, wider at the hip. Male: broader at
  // the shoulder, straighter down, narrower at the hip.
  const torsoPath = isFemale
    ? `
        M46,96
        Q52,80 62,76
        L78,76
        Q88,80 94,96
        Q100,108 100,128
        Q100,146 96,168
        L84,168
        Q86,148 86,132
        Q86,118 84,110
        Q82,120 82,132
        L82,168
        L58,168
        L58,132
        Q58,120 56,110
        Q54,118 54,132
        Q54,148 56,168
        L44,168
        Q40,146 40,128
        Q40,108 46,96
        Z
      `
    : `
        M40,96
        Q48,78 62,74
        L78,74
        Q92,78 100,96
        Q106,110 106,132
        Q106,150 104,168
        L86,168
        Q88,148 88,132
        Q88,118 86,108
        Q84,118 84,132
        L84,168
        L56,168
        L56,132
        Q56,118 54,108
        Q52,118 52,132
        Q52,148 54,168
        L36,168
        Q34,150 34,132
        Q34,110 40,96
        Z
      `;

  // The lab coat shape, drawn over the torso path when stage
  // is "donned". Open collar so the underlayer's collar peeks
  // through — a lab coat is worn open at the collar, not sealed
  // to the throat.
  const coatPath = isFemale
    ? `
        M42,94
        Q50,78 62,74
        L66,80
        L74,80
        L78,74
        Q90,78 98,94
        Q102,108 102,130
        Q102,148 100,168
        L40,168
        Q38,148 38,130
        Q38,108 42,94
        Z
      `
    : `
        M38,94
        Q48,76 62,72
        L66,78
        L74,78
        L78,72
        Q92,76 102,94
        Q108,108 108,132
        Q108,150 106,168
        L34,168
        Q32,150 32,132
        Q32,108 38,94
        Z
      `;

  // Hair shapes. Front-on head, so the hair is a crown that
  // comes down over the ears on both sides. The female version
  // is slightly fuller at the sides.
  const hairPath = isFemale
    ? "M48,44 Q48,16 70,16 Q92,16 92,44 Q88,28 70,26 Q52,28 48,44 Z"
    : "M50,42 Q50,20 70,20 Q90,20 90,42 Q86,28 70,28 Q54,28 50,42 Z";

  return (
    <svg
      viewBox="0 0 140 260"
      width={(height / 260) * 140}
      style={{ display: "block" }}
      role="img"
      aria-label={isFemale ? "Female medical laboratory scientist" : "Male medical laboratory scientist"}
    >
      {/* ---- LEGS: tapered from hip to ankle ---- */}
      <path
        d="
          M56,168
          L56,224
          Q56,232 60,232
          L66,232
          Q70,232 70,224
          L70,176
          Q70,174 72,174
          Q74,174 74,176
          L74,224
          Q74,232 78,232
          L84,232
          Q88,232 88,224
          L88,168
          Z
        "
        fill={trousers}
        stroke={outline}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ---- SHOES: turned out, laced ---- */}
      <path
        d="M54,232 Q52,240 58,243 L68,243 Q72,243 71,232 Z"
        fill={shoes}
        stroke={outline}
        strokeWidth="1"
      />
      <path
        d="M72,232 Q71,243 75,243 L85,243 Q90,240 86,232 Z"
        fill={shoes}
        stroke={outline}
        strokeWidth="1"
      />
      <line x1="58" y1="238" x2="68" y2="238" stroke={outline} strokeWidth="0.6" />
      <line x1="75" y1="238" x2="85" y2="238" stroke={outline} strokeWidth="0.6" />

      {/* ---- TORSO: underlayer. Covered by the coat when donned. ---- */}
      <path
        d={torsoPath}
        fill={underlayer}
        stroke={outline}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Collar of the underlayer — reads as a shirt, and shows
          through the open lab coat collar when the coat is on. */}
      <path
        d="M64,78 Q70,86 76,78 Q74,82 70,82 Q66,82 64,78 Z"
        fill={underlayer}
        stroke={outline}
        strokeWidth="0.8"
      />

      {/* ---- NECK ---- */}
      <path
        d="M64,74 L64,66 Q64,64 70,64 Q76,64 76,66 L76,74 Z"
        fill={skin}
        stroke={outline}
        strokeWidth="1"
      />

      {/* ---- HEAD ---- */}
      <ellipse
        cx="70"
        cy="46"
        rx={isFemale ? 18 : 19}
        ry={isFemale ? 21 : 22}
        fill={skin}
        stroke={outline}
        strokeWidth="1"
      />

      {/* ---- HAIR ---- */}
      <path d={hairPath} fill={hair} />

      {/* ---- FACE ---- */}
      <circle cx="62" cy="44" r="2.4" fill="#2A2016" />
      <circle cx="78" cy="44" r="2.4" fill="#2A2016" />
      <path
        d="M63,54 Q70,58 77,54"
        stroke="#2A2016"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* ---- ARMS: hang from the shoulder, curve at the elbow.
           Sleeve colour matches the underlayer before the coat,
           coat white after. ---- */}
      <path
        d="M44,100 Q32,132 34,170"
        stroke={stage === "donned" ? labCoat : underlayer}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M96,100 Q108,132 106,170"
        stroke={stage === "donned" ? labCoat : underlayer}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* ---- HANDS: rounded palm, hint of a thumb ---- */}
      <path
        d="M28,170 Q24,170 24,174 L24,184 Q24,188 28,188 L36,188 Q40,188 40,184 L40,174 Q40,170 36,170 Z"
        fill={skin}
        stroke={outline}
        strokeWidth="1"
      />
      <path
        d="M100,170 Q96,170 96,174 L96,184 Q96,188 100,188 L108,188 Q112,188 112,184 L112,174 Q112,170 108,170 Z"
        fill={skin}
        stroke={outline}
        strokeWidth="1"
      />

      {/* ---- LAB COAT: only when stage === "donned" ---- */}
      {stage === "donned" && (
        <g>
          <path
            d={coatPath}
            fill={labCoat}
            stroke={outline}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Left lapel */}
          <path
            d="M62,74 L66,80 L64,104"
            stroke={outline}
            strokeWidth="0.8"
            fill="none"
            strokeLinejoin="round"
          />
          {/* Right lapel */}
          <path
            d="M78,74 L74,80 L76,104"
            stroke={outline}
            strokeWidth="0.8"
            fill="none"
            strokeLinejoin="round"
          />
          {/* Front seam */}
          <line
            x1="70"
            y1="80"
            x2="70"
            y2="168"
            stroke={outline}
            strokeWidth="0.6"
            strokeDasharray="2 2"
            opacity="0.55"
          />
          {/* Pocket */}
          <rect
            x={isFemale ? "48" : "46"}
            y="140"
            width="12"
            height="10"
            rx="1.5"
            fill="none"
            stroke={outline}
            strokeWidth="0.7"
          />
        </g>
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

function VitroDonning({ onPass, character }) {
  const [placed, setPlaced] = useState([]);
  const [error, setError] = useState(null);
  const [gownPending, setGownPending] = useState(false);
  const [animating, setAnimating] = useState(null);

  const nextStep = DONNING_STEPS[placed.length] || null;
  const done = placed.length === DONNING_STEPS.length;

  const ANIM_MS = 550;

  const STEP_HEADLINES = {
    wash: "Wash your hands.",
    gown: "Put on the lab coat.",
    mask: "Fit the mask — nose and mouth.",
    eye: "Put on the eyewear.",
    gloves: "Put on the gloves — last.",
  };

  const tap = (id) => {
    if (placed.includes(id)) return;
    if (animating) return;
    if (nextStep && id === nextStep.id) {
      if (id === "gown" && !gownPending) {
        setGownPending(true);
        setError(null);
        return;
      }
      setError(null);
      setAnimating(id);
      setTimeout(() => {
        setPlaced((prev) => [...prev, id]);
        setAnimating(null);
        if (id === "gown") setGownPending(false);
      }, ANIM_MS);
      if (placed.length + 1 === DONNING_STEPS.length) {
        setTimeout(() => onPass && onPass(), ANIM_MS + 400);
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
                }}
              >
                <path
                  className={animating === "mask" ? "vitro-anim-mask" : ""}
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
                }}
              >
                <g
                  className={animating === "eye" ? "vitro-anim-eye" : ""}
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
                  <path
                    d="M28,170 Q24,170 24,174 L24,184 Q24,188 28,188 L36,188 Q40,188 40,184 L40,174 Q40,170 36,170 Z"
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                  />
                  <path
                    d="M100,170 Q96,170 96,174 L96,184 Q96,188 100,188 L108,188 Q112,188 112,184 L112,174 Q112,170 108,170 Z"
                    fill="#5B8DEF"
                    stroke="var(--line-2)"
                    strokeWidth="1"
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
              const isPendingGown = s.id === "gown" && gownPending && !isPlaced;
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
                      : isPendingGown
                      ? "1.5px solid var(--amber-2)"
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
                      : isPendingGown
                      ? "var(--amber-dim)"
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
                        : isPendingGown
                        ? "var(--amber)"
                        : isAnimatingNow
                        ? "var(--good)"
                        : "var(--bg-2)",
                      color: isPlaced
                        ? "var(--good)"
                        : isPendingGown
                        ? "#1B1405"
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
                    {isPlaced ? "✓" : isPendingGown ? "!" : ""}
                  </span>
                  <span style={{ fontWeight: 650, fontSize: 13.5 }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {gownPending && !placed.includes("gown") && (
            <div
              className="card"
              style={{
                marginTop: 12,
                borderColor: "var(--amber-2)",
                background: "var(--amber-dim)",
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 14.5, marginBottom: 6 }}>
                The lab coat is not optional.
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>
                Your own clothes are not lab-safe. The lab coat is the outer layer. It goes on over a clean underlayer.
              </div>
              <div style={{ color: "var(--text)", fontSize: 13, marginTop: 8, fontWeight: 650 }}>
                Tap "Lab coat" again to put it on.
              </div>
            </div>
          )}

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
    patientLabel: "Ama Mensah · 34 F",
    request:
      "A 34-year-old female presents with fatigue and pallor. Request: packed cell volume (PCV) on a fresh venous sample.",
    correctTube: "purple",
    // Narrator lines — spoken aloud as the bench advances.
    // Plain English, clinical register, short. Read by the
    // student's chosen podcast voice (see App.js's
    // ascendPickVoice). Each line is the instruction, not a
    // description of the instruction.
    narration: {
      intro:
        "You are about to run an estimation of packed cell volume. Read the patient history and the request on the card before you do anything else. The patient is Ama Mensah, a thirty four year old woman with fatigue and pallor. The clinician has asked for a packed cell volume. The correct answer depends on which tube you pick.",
      afterWrongTube:
        "That tube is not right for this test. Read the explanation carefully before you try again.",
      afterCorrectTube:
        "Correct. You have chosen the EDTA tube, purple top. EDTA chelates calcium irreversibly, so the blood will not clot, and the red cells are preserved exactly as they were in the patient's circulation. Pick a different tube and the whole result is worthless. Now, begin the practical.",
      labelling:
        "Step one. Label the tube. Write the patient's name, the date and time of collection, and your initials. Do this at the bedside, in the patient's presence, before you leave her side. A mislabelled tube is a rejected tube. Tap the button to write the label.",
      filling:
        "Step two. Fill the capillary. Take a heparinised microhaematocrit capillary and fill it to about three quarters. Then wipe the outside clean against gauze. Blood on the outside will contaminate the centrifuge. Tap the button to fill the capillary.",
      sealing:
        "Step three. Seal the dry end. Push the dry end of the capillary into sealing clay, or fit a plastic cap. Never seal the end that touched the blood. Sealing the wet end traps an air bubble and destroys the column. Tap the button to seal the tube.",
      loading:
        "Step four. Load the centrifuge. Put the capillary into the rotor with the sealed end pressed against the rubber gasket. Load a second, balanced capillary in the opposite slot. A single capillary unbalances the rotor at twelve thousand g and can damage the machine. Tap the button to load the sample.",
      spinning:
        "Step five. Spin the sample. The centrifuge will run for five minutes at twelve thousand g. Then you will read the packed cell column against the reader card. Red cells at the bottom, a thin buffy coat above them, and plasma at the top. Tap the button to start the spin.",
      reading:
        "The spin is complete. Read the packed cell volume against the haematocrit reader card, and compare the number to the reference range shown on the readout. Then answer the question that follows.",
      interpret:
        "Question one. Read it carefully before you answer. This is the question the whole practical exists for.",
      action:
        "Question two. You have already reported the value. Now decide what the next professional action on this result should be.",
      results:
        "The practical is complete. Every competency is assessed independently. Look at what you demonstrated, then either try again or go back to the course.",
    },
    // Tube-by-tube feedback for the wrong picks. Each message names
    // the tube, says why it is wrong for this practical specifically,
    // and points at the correct one. No generic "incorrect."
    wrongTubes: {
      red: "Red-top has no anticoagulant — the blood will clot before it reaches the centrifuge. A clotted sample cannot give a packed cell volume; you would see a solid plug, not a packed column of red cells. For a PCV, the sample has to be in a tube that keeps it liquid from draw to spin.",
      blue: "Blue-top is a coagulation tube. It contains liquid trisodium citrate and is filled to a fixed mark so the citrate-to-blood ratio is exactly 1:9. That dilution is the point for a PT or an APTT, and it is exactly what you do not want for a PCV — it would read artificially low because the plasma volume is inflated by the anticoagulant.",
      green: "Green-top contains heparin. Heparin keeps blood liquid, but it preserves cell morphology poorly, and for haematology work it produces a blue background on the film that obscures morphology. For a packed cell volume you want a tube designed for cell counts — that is EDTA, not heparin.",
      gray: "Gray-top contains sodium fluoride and potassium oxalate. Its job is to stop glycolysis in the sample — it is the glucose and lactate tube. Oxalate alters red cell membranes, so a PCV from a gray-top is not reliable. Right tube, wrong purpose.",
      yellow: "Yellow-top is a blood-culture or tissue-typing tube. It has no role in routine haematology and gives no valid PCV. Save it for the microbiology bench.",
    },
    // What the student sees when the correct tube is picked. Teaches
    // the reason, not just the fact.
    correctTubesFeedback:
      "Purple-top, EDTA. EDTA chelates calcium irreversibly, so the sample never clots — and it preserves cell morphology, which is exactly what a packed cell volume depends on. The analyser is calibrated for EDTA-anticoagulated whole blood. This is the right tube.",
    // What the student has to do at the bench after picking the
    // tube, in order. Each step is a button they tap; the bench
    // tracks progress and only unlocks the analyser at the right
    // point in the sequence.
    benchSteps: [
      {
        id: "label",
        label: "Label the tube",
        instruction:
          "Label the tube with the patient's name, the date and time of collection, and your initials — at the bedside, before you leave the patient. A mislabelled tube is a rejected tube.",
      },
      {
        id: "fill",
        label: "Fill the capillary tube",
        instruction:
          "Fill a heparinised microhaematocrit capillary to about three-quarters. Wipe the outside of the tube clean — blood on the outside will contaminate the centrifuge and skew the reading.",
      },
      {
        id: "seal",
        label: "Seal the capillary end",
        instruction:
          "Seal the dry end with sealing clay or a plastic cap. Never seal the end that touched the blood — you would trap a bubble and destroy the column.",
      },
      {
        id: "load",
        label: "Load the centrifuge",
        instruction:
          "Load the capillary into a microhaematocrit centrifuge, sealed end outward against the rubber gasket. Always load a balanced tube opposite it — even a single microhaematocrit capillary unbalances the rotor at 12,000 g.",
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
      "PCV is 0.31 L/L (31%), which is below the adult female reference range of 0.36–0.46 L/L. This is anaemia. The next step in a real lab would be a full blood count and a blood film to work out whether this is a microcytic, normocytic or macrocytic anaemia — the PCV alone tells you that she is anaemic, not why.",
    // The interpretation question. Scored as its own competency,
    // because interpretation is what the practical is for.
    interpretation: {
      question:
        "The PCV is 0.31 L/L. Given the adult female reference range of 0.36–0.46 L/L, how do you report this?",
      options: [
        "Normal — within reference range.",
        "Below reference range — this is anaemia.",
        "Above reference range — this is polycythaemia.",
        "Cannot be interpreted from a PCV alone.",
      ],
      correctIndex: 1,
      // Why each wrong option is wrong, specific to this result.
      wrongFeedback: {
        0: "0.31 L/L is below 0.36 L/L. The result is not normal. Reference range is the whole point of running the test — always compare the number against it, not against what looks like a reasonable figure.",
        2: "Above reference would mean a PCV higher than 0.46 L/L in an adult female. 0.31 is well below that. Anaemia is the low end, polycythaemia the high end — check which side of the range the number sits on.",
        3: "A PCV on its own can absolutely be interpreted — that is what the reference range is for. 0.31 L/L against a range of 0.36–0.46 L/L reads as anaemia. What the PCV cannot tell you is the cause. That is a different question.",
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
function vitroSpeak(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (typeof onEnd === "function") onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
  } catch {}
  const clean = String(text || "").replace(/\s*—\s*/g, ", ");
  const utter = new SpeechSynthesisUtterance(clean);
  // Same voice preference as the podcast feature. A student who
  // chose a female voice for Listen hears a female voice here.
  let gender = "female";
  try {
    gender = window.localStorage.getItem("ascend_voice_gender") || "female";
  } catch {}
  utter.pitch = gender === "male" ? 0.85 : 1.1;
  utter.rate = 0.97;
  // Try to attach the same named voice ascendPickVoice would
  // pick. Done synchronously from the cached voice list if it's
  // already populated, which it will be by the time the student
  // reaches the bench — the podcast feature populated it earlier.
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    const englishVoices = voices.filter((v) => /^en/i.test(v.lang));
    const pool = englishVoices.length ? englishVoices : voices;
    const hints =
      gender === "male"
        ? ["male", "david", "mark", "daniel", "alex", "fred", "guy", "ryan", "tom"]
        : ["female", "zira", "samantha", "victoria", "susan", "karen", "aria", "jenny", "joanna"];
    const match = pool.find((v) =>
      hints.some((h) => v.name.toLowerCase().includes(h))
    );
    if (match) utter.voice = match;
  } catch {}
  if (typeof onEnd === "function") {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  try {
    window.speechSynthesis.speak(utter);
  } catch {}
}

function vitroStopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
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
function VitroTubeSvg({ cap, filled, size = 46 }) {
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
      {/* Label strip — the white patch where the tube is written on */}
      <rect x="10" y="38" width="12" height="22" rx="2" fill="#FFFFFF" opacity="0.9" />
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
      {/* Sealing clay plug at the top (dry) end */}
      {sealed && (
        <rect
          x="3.5"
          y="0"
          width="7"
          height="8"
          rx="2"
          fill="#C4A57B"
          stroke="var(--line-2)"
          strokeWidth="0.6"
        />
      )}
    </svg>
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
function VitroTubeBench({ script, courseId, app, onComplete }) {
  // phase: rack → picked → labelling → filling → sealing →
  //        loading → spinning → interpret → results
  const [phase, setPhase] = useState("rack");
  const [pickedTube, setPickedTube] = useState(null);
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [analyserRan, setAnalyserRan] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  // Narration on by default. A student can mute from the bench
  // header; the choice lasts for the session on this bench only.
  const [muted, setMuted] = useState(false);

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
  // Speak the line for the current phase whenever the phase
  // changes. Cancels whatever was speaking first, so a fast
  // student tapping through does not stack voices.
  const narration = (script && script.narration) || {};
  useEffect(() => {
    if (muted) {
      vitroStopSpeaking();
      return;
    }
    const line = (() => {
      switch (phase) {
        case "rack":
          return narration.intro;
        case "picked":
          return correct ? narration.afterCorrectTube : narration.afterWrongTube;
        case "labelling":
          return narration.labelling;
        case "filling":
          return narration.filling;
        case "sealing":
          return narration.sealing;
        case "loading":
          return narration.loading;
        case "spinning":
          return analyserRan ? narration.reading : narration.spinning;
        case "interpret":
          return narration.interpret;
        case "action":
          return narration.action;
        case "results":
          return narration.results;
        default:
          return null;
      }
    })();
    if (line) vitroSpeak(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, analyserRan, muted]);

  // Stop the voice the moment the student leaves the bench.
  useEffect(() => {
    return () => vitroStopSpeaking();
  }, []);

  const goBack = () => {
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
    setLabelled(true);
    setTimeout(() => {
      setStepIdx(1);
      setPhase("filling");
    }, 500);
  };

  const doFill = () => {
    if (phase !== "filling") return;
    setCapillaryFill("partial");
    setTimeout(() => setCapillaryFill("full"), 120);
    setTimeout(() => {
      setStepIdx(2);
      setPhase("sealing");
    }, 800);
  };

  const doSeal = () => {
    if (phase !== "sealing") return;
    setCapillarySealed(true);
    setTimeout(() => {
      setStepIdx(3);
      setPhase("loading");
    }, 500);
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
    if (phase !== "spinning" || analyserRan) return;
    setAnalyserRan(true);
    setCompetency((c) => ({ ...c, instrument_operation: true }));
    // The spin animation runs for 3s; the readout appears at
    // the end, and the phase advances to interpretation/results.
        setTimeout(() => {
      setPhase(interpretation ? "interpret" : "results");
    }, 3000);
  };

  const answerInterpretation = (idx) => {
    if (interpPick !== null) return;
    setInterpPick(idx);
    setCompetency((c) => ({
      ...c,
      result_interpretation: idx === interpretation.correctIndex,
    }));
  };

  const answerAction = (idx) => {
    if (actionPick !== null) return;
    setActionPick(idx);
    setCompetency((c) => ({
      ...c,
      reportable_action: idx === script.reportableAction.correctIndex,
    }));
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
    phase === "spinning" && !analyserRan
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

      {/* The bench — tube rack on the left, worktop on the right.
          Stacks on phones. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 1fr) minmax(200px, 1fr)",
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
              <div style={{ position: "relative" }}>
                <VitroTubeSvg
                  cap={pickedTube}
                  filled={phase !== "picked" && phase !== "rack"}
                  size={44}
                />
                {labelled && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 6,
                      padding: "1px 4px",
                      borderRadius: 3,
                      background: "#FFFFFF",
                      border: "0.5px solid var(--line-2)",
                      fontSize: 5,
                      fontWeight: 700,
                      color: "#1B1405",
                      lineHeight: 1.1,
                      textAlign: "center",
                      maxWidth: 24,
                    }}
                  >
                    {script.patientLabel.split(" ")[0]}
                    <br />
                    {todayLabel}
                  </div>
                )}
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
              <button className="btn btn-a btn-sm" onClick={doLabel}>
                Write the label
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
              <button className="btn btn-a btn-sm" onClick={doFill}>
                Fill the capillary
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
              <button className="btn btn-a btn-sm" onClick={doSeal}>
                Seal the dry end
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
              <button className="btn btn-a btn-sm" onClick={doLoad}>
                Load the centrifuge
              </button>
            </div>
          )}

          {/* ---- Step: spinning ---- */}
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
                <button className="btn btn-a btn-sm" onClick={doSpin}>
                  Start the spin
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

          {/* ---- Capillary, when it exists ---- */}
          {(phase === "filling" ||
            phase === "sealing" ||
            phase === "loading" ||
            phase === "spinning") && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "flex-end",
                gap: 20,
                justifyContent: "center",
                padding: "10px 0",
                borderTop: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
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
              <VitroCentrifugeSvg
                state={centrifugeState}
                result={analyserRan ? script.analyser.result : null}
              />
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
                onClick={goToResults}
              >
                See your competencies
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Results ---- */}
      {phase === "results" && (
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
                      Back to the course
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
        Back to the course
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
function VitroPracticalPlaceholder({ practicalTitle, courseId, app }) {
  const donnedKey = "ascend_vitro_donned";
  const scientistKey = "ascend_vitro_scientist";

  const [donned, setDonned] = useState(() => {
    try {
      return sessionStorage.getItem(donnedKey) === "1";
    } catch {
      return false;
    }
  });

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

  // ---- Stage 1: choose a scientist ----
  if (!character) {
    return <VitroCharacterPicker onPick={pickScientist} />;
  }

  // ---- Stage 2: donning ----
  if (!donned) {
    return (
      <VitroDonning
        onPass={passDonning}
        character={character}
      />
    );
  }

  // ---- Stage 3: the bench ----
  const practicalKey =
    courseId !== null && app && app.practicalId !== undefined
      ? `${courseId}:${app.practicalId}`
      : null;
  const scriptForThisPractical = practicalKey
    ? VITRO_SCRIPTS[practicalKey] || null
    : null;

  if (scriptForThisPractical) {
    return (
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
      />
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