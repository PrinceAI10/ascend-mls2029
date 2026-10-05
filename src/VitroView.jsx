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

function VitroDonning({ onPass, avatarConfig }) {
  const [placed, setPlaced] = useState([]); // ids placed so far, in correct order
  const [error, setError] = useState(null); // { id, message } — cleared on next correct tap
  // The gown step has two beats: the first tap teaches the lab-coat
  // rule, the second commits it. This flag records that the student
  // has seen the teaching beat but has not yet put the coat on.
  const [gownPending, setGownPending] = useState(false);

  const nextStep = DONNING_STEPS[placed.length] || null;
  const done = placed.length === DONNING_STEPS.length;

  const tap = (id) => {
    // Already placed? Ignore. Prevents double-counting on fast taps.
    if (placed.includes(id)) return;
    // Correct next item: accept, clear any lingering error.
    if (nextStep && id === nextStep.id) {
      // ---- Gown sub-step: teach first, then commit ----
      if (id === "gown" && !gownPending) {
        setGownPending(true);
        setError(null);
        return;
      }
      const nextPlaced = [...placed, id];
      setPlaced(nextPlaced);
      setError(null);
      if (id === "gown") setGownPending(false);
      if (nextPlaced.length === DONNING_STEPS.length) {
        // Small beat so the student sees the fully-dressed figure
        // before the screen changes underneath them.
        setTimeout(() => onPass && onPass(), 700);
      }
      return;
    }
    // Wrong item: specific explanation, then they retry this step.
    const wrongItem = DONNING_STEPS.find((s) => s.id === id);
    const skipped = nextStep;
    const entry = DONNING_ORDER_ERRORS[id];
    const message =
      entry && entry.why
        ? entry.why
        : `${wrongItem ? wrongItem.label : "That"} is not the next step. You need to put on ${skipped ? skipped.label.toLowerCase() : "the next item"} first.`;
    setError({ id, message });
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{ borderColor: "var(--amber)", padding: 20 }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--amber-2)", marginBottom: 8 }}
        >
          Donning check
        </div>
        <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.4 }}>
          Before you enter the lab
        </div>
        <div
          style={{
            color: "var(--text-2)",
            fontSize: 13.5,
            marginTop: 8,
            lineHeight: 1.55,
            maxWidth: "60ch",
          }}
        >
          Put on your lab coat, mask, eyewear and gloves in the
          correct order — hand hygiene first, lab coat next, mask and
          eyewear after, gloves last. Tap each item on the cart
          below. If you get the order wrong, the app will tell you
          exactly which step went wrong and why, and you retry that
          step.
        </div>
      </div>

      {/* Figure + cart. Two-column on wide screens, stacked on phones. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, 220px) 1fr",
          gap: 16,
          marginTop: 16,
          alignItems: "start",
        }}
      >
        {/* ---- The figure ---- */}
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
          {/*
            The figure is drawn as the student's own avatar where
            that avatar exists — same skin tone, same hair colour,
            same outfit colour, same gender cue (via hair style
            family). Hair style itself is drawn generically rather
            than replicating the exact avatar shape, because the
            avatar is a 3/4 profile and the donning figure is
            front-on; reproducing the exact silhouette would look
            wrong. What travels is what reads correctly at a glance
            from a different angle: colour and bulk.

            Fallbacks: if the student never set an avatar, we use
            the same defaults the rest of the app uses (skin tone
            index 0, hair colour index 0, lab coat colour) so the
            figure never falls back to a broken state.
          */}
          {(() => {
            const cfg = (avatarConfig && typeof avatarConfig === "object") ? avatarConfig : {};
            const skin = cfg.skin && AVATAR_SKIN_TONES.includes(cfg.skin)
              ? cfg.skin
              : AVATAR_SKIN_TONES[0];
            const hairColor = cfg.hairColor && AVATAR_HAIR_COLORS.includes(cfg.hairColor)
              ? cfg.hairColor
              : AVATAR_HAIR_COLORS[0];
            const outfitColor = (cfg.outfit && AVATAR_OUTFIT_COLORS[cfg.outfit])
              ? AVATAR_OUTFIT_COLORS[cfg.outfit]
              : AVATAR_OUTFIT_COLORS.labcoat;
            // Gender cue: the hair list in App.js is gender-tagged.
            // We infer from the style id rather than storing gender
            // separately on the avatar config (it isn't — App.js
            // uses a genderFilter state at picker-time only, and
            // the config itself doesn't carry the gender).
            // "braids", "ponytail", "wig", "bun" are the female set;
            // everything else is male or neutral.
            const FEMALE_HAIR_IDS = ["braids", "ponytail", "wig", "bun"];
            const isFemale = FEMALE_HAIR_IDS.includes(cfg.hair);
            // A subtle silhouette cue so the figure reads as the
            // student's own gender without being caricature. For
            // male, hair volume sits lower and closer to the head;
            // for female, slightly higher and fuller. Both are
            // single paths — one shape, one variable.
            const hairPath = isFemale
              ? "M42,30 Q42,14 60,14 Q78,14 78,30 Q74,20 60,20 Q46,20 42,30 Z"
              : "M44,30 Q44,18 60,18 Q76,18 76,30 Q72,23 60,23 Q48,23 44,30 Z";
            return (
              <svg
                viewBox="0 0 120 220"
                width="100%"
                style={{ maxWidth: 180, display: "block" }}
                role="img"
                aria-label={
                  done
                    ? "You, fully dressed in PPE"
                    : "You, being dressed in PPE"
                }
              >
                {/* Head — skin tone from the avatar config */}
                <circle cx="60" cy="34" r="18" fill={skin} />

                {/* Hair — colour and silhouette family from the
                    avatar config. Drawn behind the head so the
                    face is not covered. */}
                <path d={hairPath} fill={hairColor} />

                {/* Torso — the student's outfit colour when the
                    gown is not yet on, the gown when it is */}
                <path
                  d="M32,60 Q60,50 88,60 L92,150 L28,150 Z"
                  fill={placed.includes("gown") ? "#F4F6FA" : outfitColor}
                  stroke="#1B283F"
                  strokeWidth="1"
                />

                {/* Legs — dark scrubs trousers, matching the
                    standard lab legwear */}
                <rect x="40" y="150" width="14" height="56" fill="#2E3A55" />
                <rect x="66" y="150" width="14" height="56" fill="#2E3A55" />

                {/* Feet */}
                <ellipse cx="47" cy="208" rx="11" ry="5" fill="#1B1B1F" />
                <ellipse cx="73" cy="208" rx="11" ry="5" fill="#1B1B1F" />

                {/* Mask */}
                {placed.includes("mask") && (
                  <path
                    d="M44,32 Q60,42 76,32 L74,44 Q60,50 46,44 Z"
                    fill="#E8EDF5"
                    stroke="#1B283F"
                    strokeWidth="1"
                  />
                )}

                {/* Eyewear */}
                {placed.includes("eye") && (
                  <g
                    stroke="#2A2016"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                  >
                    <rect x="42" y="22" width="14" height="10" rx="3" />
                    <rect x="64" y="22" width="14" height="10" rx="3" />
                    <line x1="56" y1="27" x2="64" y2="27" />
                  </g>
                )}

                {/* Gloves — one visible cuff over each hand */}
                {placed.includes("gloves") && (
                  <>
                    <circle cx="28" cy="152" r="7" fill="#5B8DEF" />
                    <circle cx="92" cy="152" r="7" fill="#5B8DEF" />
                  </>
                )}

                {/* Hand hygiene — a subtle sparkle on each hand,
                    hinting clean. Hidden once gloves go on. */}
                {placed.includes("wash") && !placed.includes("gloves") && (
                  <g
                    fill="none"
                    stroke="#54D08A"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M26 148 l0 -4 M24 150 l-4 -2 M28 150 l4 -2" />
                    <path d="M94 148 l0 -4 M92 150 l-4 -2 M96 150 l4 -2" />
                  </g>
                )}

                {/* Contamination spot when an out-of-order tap
                    happens. Cleared the moment the student taps
                    the correct next item. */}
                {error && (
                  <g>
                    <circle cx="88" cy="66" r="5" fill="#F0776A" opacity="0.9" />
                    <circle cx="90" cy="68" r="2" fill="#F0776A" opacity="0.6" />
                  </g>
                )}
              </svg>
            );
          })()}
        </div>

        {/* ---- The cart ---- */}
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
              return (
                <button
                  key={s.id}
                  onClick={() => tap(s.id)}
                  disabled={isPlaced}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: wasErrored
                      ? "1.5px solid var(--bad)"
                      : isPendingGown
                      ? "1.5px solid var(--amber-2)"
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
                      : "var(--bg-3)",
                    color: isPlaced ? "var(--text-3)" : "var(--text)",
                    cursor: isPlaced ? "default" : "pointer",
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
                        : "var(--bg-2)",
                      color: isPlaced
                        ? "var(--good)"
                        : isPendingGown
                        ? "#1B1405"
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

          {/* Gown teaching beat — appears the first time the student
              taps "Gown", before the coat is actually placed. Makes
              the lab-coat rule explicit rather than assumed. */}
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
              <div
                className="eyebrow"
                style={{ color: "var(--amber-2)", marginBottom: 6 }}
              >
                The lab coat is not optional
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                }}
              >
                In a real laboratory, your own clothing is not lab-safe.
                Hoodies, blouses and street clothes are not PPE — the
                lab coat is. It is the outer layer everyone sees, and
                it goes on over a clean underlayer, covering whatever
                you walked in wearing.
              </div>
              <div
                style={{
                  color: "var(--text)",
                  fontSize: 13.5,
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                Tap "Lab coat" again to put it on.
              </div>
            </div>
          )}

          {/* Error panel. Specific, named, never generic. */}
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
                className="eyebrow"
                style={{ color: "var(--bad)", marginBottom: 6 }}
              >
                That step is out of order
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                }}
              >
                {error.message}
              </div>
              {nextStep && (
                <div
                  style={{
                    color: "var(--text)",
                    fontSize: 13.5,
                    marginTop: 8,
                    fontWeight: 600,
                  }}
                >
                  Do this next: {nextStep.label.toLowerCase()} — {nextStep.why}
                </div>
              )}
            </div>
          )}

          {/* Success panel — the flag is already stored; this is the
              last thing the student sees before the placeholder. */}
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
                className="eyebrow"
                style={{ color: "var(--good)", marginBottom: 6 }}
              >
                PPE complete
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                }}
              >
                Lab coat on, mask sealed, eyewear up, gloves on last —
                the correct order. You will not see this check again
                for the rest of this session; next time you open the
                app, it re-gates, because the point is muscle memory,
                not a one-off.
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
  },
};

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
// VitroTubeBench — the reusable tube-and-sample bench.
//
// Takes a script and renders:
//   1. The patient card (who the sample is from)
//   2. The request card (what was asked for)
//   3. The tube rack (every tube type on the shelf)
//   4. The worktop (the picked tube, then the drawn sample)
//   5. The analyser (tappable once the sample has been drawn)
//   6. The outcome panel (the result, and the wrong-tube branch
//      when the student picked wrong)
//
// One bench, many scripts — the bench itself never changes; the
// script decides what appears on it.
//
// No scoring here. Competency scoring is Step 5. This step only
// proves the bench renders and the tube-pick branch works.
// ------------------------------------------------------------------
function VitroTubeBench({ script, courseId, app }) {
  // phase: rack → picked (with wrong feedback) → stepping → run
  //   rack      — choosing a tube
  //   picked    — tube chosen, feedback shown, "Begin bench steps" appears
  //   stepping  — walking through script.benchSteps one at a time
  //   run       — analyser has been run, result + outcome shown
  const [phase, setPhase] = useState("rack");
  const [pickedTube, setPickedTube] = useState(null);
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [analyserRan, setAnalyserRan] = useState(false);
  // Index of the current bench step when phase === "stepping". The
  // bench walks this forward one tap at a time; the analyser only
  // becomes reachable once it reaches the end.
  const [stepIdx, setStepIdx] = useState(0);

  const steps = Array.isArray(script && script.benchSteps)
    ? script.benchSteps
    : null;

  // If the script identity ever changes, reset the whole bench so
  // a second practical doesn't inherit the first one's state.
  const scriptId = script && script.id ? script.id : "";
  useEffect(() => {
    setPhase("rack");
    setPickedTube(null);
    setWrongFeedback(null);
    setAnalyserRan(false);
    setStepIdx(0);
  }, [scriptId]);

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
      setWrongFeedback(null);
      setPhase("picked");
    } else {
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

  // "Begin bench steps" — called after a correct tube is picked.
  // If the script provides benchSteps, we walk through them; if
  // it doesn't (as with the placeholder script), we jump straight
  // to the analyser, preserving the simplified Step 3 flow.
  const beginSteps = () => {
    if (phase !== "picked") return;
    if (steps && steps.length > 0) {
      setStepIdx(0);
      setPhase("stepping");
    } else {
      setPhase("run");
    }
  };

  const advanceStep = () => {
    if (phase !== "stepping") return;
    if (stepIdx + 1 < steps.length) {
      setStepIdx(stepIdx + 1);
    } else {
      // Last step done — release the analyser.
      setPhase("run");
    }
  };

  const runAnalyser = () => {
    if (phase !== "run") return;
    setAnalyserRan(true);
  };

  const resetBench = () => {
    setPhase("rack");
    setPickedTube(null);
    setWrongFeedback(null);
    setAnalyserRan(false);
    setStepIdx(0);
  };

  const correct = pickedTube && pickedTube === script.correctTube;

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header strip — patient + request, always visible so the
          student is never guessing what they are being asked to do. */}
      <div
        className="card"
        style={{
          borderColor: "var(--amber)",
          padding: 16,
          background: "var(--bg-2)",
        }}
      >
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

      {/* The worktop — tube rack on the left, picked tube / analyser
          on the right. Stacks on phones. */}
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

          {/* Reference — tappable details of each tube. Kept
              collapsed by default so the rack is the focus. */}
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

        {/* ---- Worktop: picked tube + analyser ---- */}
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

          {pickedTube && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <VitroTubeSvg
                cap={pickedTube}
                filled={phase === "stepping" || phase === "run"}
                size={44}
              />
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
                  {phase === "stepping" || phase === "run"
                    ? "Sample drawn."
                    : "Tube selected — draw the sample."}
                </div>
              </div>
            </div>
          )}

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
                {steps && steps.length > 0
                  ? "Begin bench steps"
                  : "Draw the sample"}
              </button>
            </>
          )}

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

          {phase === "run" && (
            <div style={{ marginTop: 4 }}>
              <div
                className="eyebrow"
                style={{ marginBottom: 8 }}
              >
                {script.analyser.label}
              </div>
              {!analyserRan && (
                <>
                  <div
                    style={{
                      color: "var(--text-2)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      marginBottom: 10,
                    }}
                  >
                    {script.analyser.action}
                  </div>
                  <button
                    className="btn btn-a btn-sm"
                    onClick={runAnalyser}
                  >
                    Run the analyser
                  </button>
                </>
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

          {phase === "stepping" && steps && steps[stepIdx] && (
            <div>
              <div
                className="eyebrow"
                style={{ marginBottom: 8 }}
              >
                Bench step {stepIdx + 1} of {steps.length}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 6,
                }}
              >
                {steps[stepIdx].label}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {steps[stepIdx].instruction}
              </div>
              <button
                className="btn btn-a btn-sm"
                onClick={advanceStep}
              >
                {stepIdx + 1 < steps.length
                  ? "Done — next step"
                  : "Done — ready to spin"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Outcome strip — what Step 5 will replace with the scored
          results screen. For now, this is a plain readout that
          states the result and, for PCV, the interpretation. */}
      {analyserRan && script.outcome && (
        <div
          className="card"
          style={{
            marginTop: 12,
            borderColor: "var(--amber-2)",
            background: "var(--amber-dim)",
            padding: 14,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "var(--amber-2)", marginBottom: 6 }}
          >
            Interpretation
          </div>
          <div
            style={{
              color: "var(--text)",
              fontSize: 13.5,
              lineHeight: 1.6,
            }}
          >
            {script.outcome}
          </div>
        </div>
      )}

      {/* Back — always available, so a student who has finished or
          wants out isn't trapped on the bench. */}
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
  const sessionKey = "ascend_vitro_donned";
  const [donned, setDonned] = useState(() => {
    try {
      return sessionStorage.getItem(sessionKey) === "1";
    } catch {
      return false;
    }
  });

  const passDonning = () => {
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {}
    setDonned(true);
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

  if (!donned) {
    return (
      <VitroDonning
        onPass={passDonning}
        avatarConfig={app && app.progress ? app.progress.avatar : null}
      />
    );
  }

  // Real script lookup. Keyed by `${courseId}:${topicIndex}` so a
  // script survives a topic being inserted above it in the
  // TOPICS array — same discipline as Atlas's DIAGRAMS map.
  //
  // If there is no script for this practical yet, the value is
  // undefined and the placeholder below renders the "Bench in
  // build" card, exactly as before. Adding a practical is a
  // one-entry edit to VITRO_SCRIPTS; nothing else here changes.
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