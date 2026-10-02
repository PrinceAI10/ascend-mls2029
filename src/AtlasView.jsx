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
  ATLAS_COURSE_NAMES,
  diagramsForCourse,
  coursesWithDiagrams,
  diagramForTopic,
} from "./diagrams";

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
.atlas-viewer-stage { touch-action: none; cursor: grab; position: relative; }
.atlas-viewer-stage:active { cursor: grabbing; }

/* Play bar - sits above everything, same role as the Listen bar on a
   topic note. */
.atlas-playbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.atlas-dots { display: flex; gap: 5px; margin-top: 10px; }
.atlas-dot { flex: 1; height: 6px; border-radius: 3px; border: none; cursor: pointer; background: var(--line); }
.atlas-dot.on { background: var(--amber); }

/* Diagram + summary row - side by side once there's room, stacked on a
   narrow phone screen; same markup, flex-wrap handles both layouts. */
.atlas-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.atlas-diagram-col { flex: 1 1 340px; min-width: 0; }
.atlas-summary-col { flex: 1 1 280px; min-width: 0; }
/* On phones the two columns stack full-width; min-width:0 above stops the
   flex basis from forcing a phantom horizontal scrollbar on 320px screens. */

/* Zoom controls float on the diagram itself now, instead of taking a
   separate full-width row - the row is busy enough with the summary
   panel beside it. */
.atlas-zoom-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; z-index: 2; }
.atlas-zoom-controls .btn { background: rgba(10,15,26,.65); backdrop-filter: blur(6px); box-shadow: 0 2px 8px rgba(0,0,0,.25); }
/* Slightly larger tap targets on phones; the diagram stage is shorter there
   so a couple more px of button height doesn't crowd it. */
@media (max-width: 640px) {
  .atlas-zoom-controls .btn { min-height: 32px; min-width: 32px; padding: 0 8px; }
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
  const [voiceOn, setVoiceOn] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const playTokenRef = useRef(0);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  // Reset local view state whenever a new diagram is opened (drill-down or back)
  useEffect(() => {
    setActiveLabelId(null);
    setActiveStep(0);
    setPlaying(false);
    setPaused(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    playTokenRef.current++;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
  }, [diagramId]);

  useEffect(() => () => { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} }, []);

  const speakStep = useCallback(async (stepIdx) => {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    const myToken = playTokenRef.current;
    const voice = await pickVoice();
    if (myToken !== playTokenRef.current) return;
    const text = diagram.narration[stepIdx];
    if (!text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.rate = speed;
    utter.onend = () => {
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
                  speakStep(0);
                  return 0;
                }
                setPlaying(false);
                return s;
              }
              speakStep(next);
              return next;
            });
          }, 350);
        }
        return isPlaying;
      });
    };
    window.speechSynthesis.speak(utter);
  }, [diagram, voiceOn, speed]);

  const handlePlay = () => {
    if (playing) {
      // Deliberately NOT window.speechSynthesis.pause() - that call is
      // unreliable across browsers (notably mobile Safari), which is the
      // same reason the existing Listen feature in App.js avoids it too.
      // "Pause" here cancels and remembers the current step; "Resume"
      // re-speaks that step from its start rather than mid-sentence - a
      // fine trade-off since each step's narration is only a sentence
      // or two.
      setPlaying(false);
      setPaused(true);
      playTokenRef.current++;
      try { window.speechSynthesis.cancel(); } catch {}
      return;
    }
    // Starting fresh after a full run (one-shot diagram sitting on its
    // final step) restarts from the top rather than re-speaking the end.
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

    /* ---- zoom / pan - center-locked, clamped so the figure can never drift
     fully off-stage ---- */
  const MIN_ZOOM = 0.5, MAX_ZOOM = 3;
  const PAN_LIMIT = 260; // max px the figure may be dragged from center at any zoom

  // Apply a new zoom AND scale pan by the same ratio, so the point currently
  // under the viewer's focus stays visually fixed. Without the pan-scaling
  // step, zooming after a pan would slide the figure away from center.
  const applyZoom = useCallback((nextZoomRaw) => {
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +nextZoomRaw.toFixed(2)));
    setZoom((prevZoom) => {
      if (nextZoom === prevZoom) return prevZoom;
      const k = nextZoom / prevZoom;
      setPan((p) => {
        const nx = p.x * k;
        const ny = p.y * k;
        const len = Math.hypot(nx, ny);
        if (len > PAN_LIMIT) {
          const s = PAN_LIMIT / len;
          return { x: nx * s, y: ny * s };
        }
        return { x: nx, y: ny };
      });
      return nextZoom;
    });
  }, []);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2)));
      if (next === z) return z;
      const k = next / z;
      setPan((p) => {
        const nx = p.x * k, ny = p.y * k;
        const len = Math.hypot(nx, ny);
        if (len > PAN_LIMIT) { const s = PAN_LIMIT / len; return { x: nx * s, y: ny * s }; }
        return { x: nx, y: ny };
      });
      return next;
    });
  };
  const pointers = useRef(new Map());
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointers.current.size === 2) {
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
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current = { x: e.clientX, y: e.clientY };
      // Ignore sub-pixel drift from a normal click or trackpad tap - a click
      // with 1-2px of accidental movement was registering as a pan and
      // leaving the figure permanently nudged off-center.
      if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) return;
      setPan((p) => {
        // Clamp total displacement so the figure can be nudged around but
        // never dragged completely out of the visible stage.
        const nx = p.x + dx, ny = p.y + dy;
        const len = Math.hypot(nx, ny);
        if (len > PAN_LIMIT) {
          const s = PAN_LIMIT / len;
          return { x: nx * s, y: ny * s };
        }
        return { x: nx, y: ny };
      });
    }
  };
    const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) {
      dragRef.current = null;
      // Snap back to exact center if the user's pan ended within a few px of
      // home - so a click or a short drag can never leave the figure nudged
      // slightly off-center and stacking with future zooms.
      setPan((p) => (Math.hypot(p.x, p.y) < 4 ? { x: 0, y: 0 } : p));
    }
  };

  const activeLabel = diagram.labels?.find((l) => l.id === activeLabelId) || null;
  const topTopic = topLevelTopicOf(diagram);

  return (
    <div style={{ marginTop: 16 }}>
      <style>{atlasStyles}</style>

      {/* breadcrumb + back - navigation stays at the very top */}
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
        <button className="btn btn-a btn-sm" onClick={handlePlay}>
          {playing ? "Pause" : paused ? "Resume" : "Play"}
        </button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(-1)} disabled={activeStep === 0}>◀</button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(1)} disabled={!diagram.loop && activeStep === diagram.narration.length - 1}>▶</button>
        <button className="btn btn-g btn-sm mono" onClick={() => setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 0.85 : 1))}>{speed}×</button>
        <button className="btn btn-g btn-sm" onClick={() => setVoiceOn((v) => !v)}>{voiceOn ? "Voice on" : "Voice off"}</button>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>Step {activeStep + 1} / {diagram.narration.length}</span>
      </div>
      <div className="atlas-dots">
        {diagram.narration.map((_, i) => (
          <button key={i} className={"atlas-dot" + (i <= activeStep ? " on" : "")} onClick={() => jumpTo(i)} title={`Step ${i + 1}`} />
        ))}
      </div>
      <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 8, marginBottom: 14, minHeight: 36 }}>{diagram.narration[activeStep]}</div>

      {/* ---- Diagram (left) + topic summary (right) ---- */}
      <div className="atlas-row">
        <div className="atlas-diagram-col">
          <div
            className="card atlas-viewer-stage"
                        style={{ padding: 0, overflow: "hidden", height: "clamp(260px, 42vh, 420px)" }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
                        <div className="atlas-zoom-controls">
              <button className="btn btn-sm" title="Zoom out" onClick={() => applyZoom(zoom - 0.2)}>−</button>
                            <button className="btn btn-sm mono" title="Reset zoom & pan to center" style={{ minWidth: 62 }} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>⤾ {Math.round(zoom * 100)}%</button>
              <button className="btn btn-sm" title="Zoom in" onClick={() => applyZoom(zoom + 0.2)}>+</button>
            </div>
            <div style={{ width: "100%", height: "100%", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: dragRef.current ? "none" : "transform 0.15s ease-out" }}>
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
        <div className="eyebrow">Legend</div>
        <div className="atlas-legend-grid">
          {(diagram.labels || []).map((l) => (
            <button
              key={l.id}
              className="btn btn-sm"
              style={{
                justifyContent: "flex-start", textAlign: "left",
                background: activeLabelId === l.id ? "var(--amber-dim)" : "transparent",
                color: activeLabelId === l.id ? "var(--amber-2)" : "var(--text-2)",
                border: "1px solid " + (activeLabelId === l.id ? "rgba(245,185,63,.35)" : "transparent"),
              }}
              onClick={() => setActiveLabelId(l.id)}
            >
              {l.name}
            </button>
          ))}
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
    if (openedFromCourseId != null && openedFromTopicId != null && breadcrumb.length <= 1) {
      app.go("topic", { courseId: openedFromCourseId, topicId: openedFromTopicId });
      return;
    }
    setScreen(courseId ? "list" : "courses");
  };

  const diagram = diagramId ? DIAGRAMS[diagramId] : null;

  return (
    <div className="view">
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
