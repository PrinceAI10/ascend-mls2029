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
import React from "react";

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
// Five items, one correct order: hand hygiene, gown, mask,
// eyewear, gloves. Tapping out of order marks the character with
// a contamination spot, names the wrong step, and explains why
// the correct order is what it is. Passing the sequence stores a
// flag in sessionStorage for the rest of this session, so a
// student entering bench after bench only does it once per
// sitting — but a fresh session re-gates, because muscle memory
// is the point.
//
// The 2D figure and the supply icons are plain SVG drawn by
// React, matching the rest of ASCEND: no sprite art, no PNGs,
// one shared palette.
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
    label: "Gown",
    short: "Gown",
    why: "The gown goes on before the mask and eyewear so that when you tie it behind your head, you are not reaching up past a clean face with potentially contaminated sleeves.",
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
  gown: { shouldBe: "wash", why: "Gloves and gown both come after hand hygiene. Wash your hands first — the gown only protects the uniform underneath, it does not protect you from what is already on your hands." },
  mask: { shouldBe: "wash", why: "Wash your hands before fitting a mask. Otherwise you have just moved whatever is on your hands straight onto the mask surface — and the mask then sits against your face for the rest of the shift." },
  eye: { shouldBe: "wash", why: "Eyewear comes after the mask and gown. Start with hand hygiene, then gown, then mask, then eyewear." },
  gloves: { shouldBe: "wash", why: "Gloves are last, always. If you put them on now, you will have to touch the gown ties, the mask seal and the eyewear with dirty gloves — the exact contamination the sequence exists to prevent." },
  wash: null, // wash is the first step, so it can never be too early
};

function VitroDonning({ onPass }) {
  const [placed, setPlaced] = useState([]); // ids placed so far, in correct order
  const [error, setError] = useState(null); // { id, message } — cleared on next correct tap

  const nextStep = DONNING_STEPS[placed.length] || null;
  const done = placed.length === DONNING_STEPS.length;

  const tap = (id) => {
    // Already placed? Ignore. Prevents double-counting on fast taps.
    if (placed.includes(id)) return;
    // Correct next item: accept, clear any lingering error.
    if (nextStep && id === nextStep.id) {
      const nextPlaced = [...placed, id];
      setPlaced(nextPlaced);
      setError(null);
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
          Put on your PPE in the correct order. Tap each item on the
          cart below — if you get the order wrong, the app will tell
          you exactly which step went wrong and why, and you retry
          that step.
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
          <svg
            viewBox="0 0 120 220"
            width="100%"
            height="auto"
            style={{ maxWidth: 180 }}
            role="img"
            aria-label={
              done
                ? "Figure fully dressed in PPE"
                : "Figure being dressed in PPE"
            }
          >
            {/* Head */}
            <circle cx="60" cy="34" r="18" fill="#C68642" />
            {/* Torso (as lab coat or shirt, depending on gown step) */}
            <path
              d="M32,60 Q60,50 88,60 L92,150 L28,150 Z"
              fill={placed.includes("gown") ? "#F4F6FA" : "#3B4A63"}
              stroke="#1B283F"
              strokeWidth="1"
            />
            {/* Legs */}
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

            {/* Gloves — a thin, visible cuff over each hand */}
            {placed.includes("gloves") && (
              <>
                <circle cx="28" cy="152" r="7" fill="#5B8DEF" />
                <circle cx="92" cy="152" r="7" fill="#5B8DEF" />
              </>
            )}

            {/* Hand hygiene — a subtle sparkle on each hand, hinting clean */}
            {placed.includes("wash") && !placed.includes("gloves") && (
              <g fill="none" stroke="#54D08A" strokeWidth="1.6" strokeLinecap="round">
                <path d="M26 148 l0 -4 M24 150 l-4 -2 M28 150 l4 -2" />
                <path d="M94 148 l0 -4 M92 150 l-4 -2 M96 150 l4 -2" />
              </g>
            )}

            {/* Contamination spot when an out-of-order tap happens.
                Positioned at the shoulder and cleared the moment the
                student taps the correct next item. */}
            {error && (
              <g>
                <circle cx="88" cy="66" r="5" fill="#F0776A" opacity="0.9" />
                <circle cx="90" cy="68" r="2" fill="#F0776A" opacity="0.6" />
              </g>
            )}
          </svg>
        </div>

        {/* ---- The cart ---- */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))",
              gap: 8,
            }}
          >
            {DONNING_STEPS.map((s) => {
              const isPlaced = placed.includes(s.id);
              const isNext = nextStep && nextStep.id === s.id;
              const wasErrored = error && error.id === s.id;
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
                      : isNext
                      ? "1.5px solid var(--amber)"
                      : isPlaced
                      ? "1px solid var(--line)"
                      : "1px solid var(--line-2)",
                    background: isPlaced
                      ? "var(--bg-2)"
                      : wasErrored
                      ? "var(--bad-dim)"
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
                      background: isPlaced ? "var(--good-dim)" : "var(--bg-2)",
                      color: isPlaced ? "var(--good)" : "var(--text-3)",
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
                Donning complete
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                }}
              >
                You will not see this check again for the rest of this
                session. Next time you open the app, it re-gates — the
                point is the muscle memory, not a one-off.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// VitroPracticalPlaceholder — shown when VITRO is opened from a
// specific practical topic card.
//
// If the student has not yet passed the donning check this
// session, they see VitroDonning. Once passed, sessionStorage
// carries a flag for the rest of the session and this renders the
// "Bench in build" placeholder instead.
//
// Once the first bench exists, this component will be replaced by
// a route into that bench. Until then, this is what a student sees
// after donning, when the practical's bench hasn't been built yet.
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
    return <VitroDonning onPass={passDonning} />;
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