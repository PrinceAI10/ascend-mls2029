// AtlasView.jsx
// ------------------------------------------------------------
// The Atlas tab - hand-drawn, illustrated diagrams and pathway
// builders, one per topic, driven entirely by diagrams.js.
//
// Nothing here is AI-generated and nothing fetches at runtime -
// every visual is a fixed SVG, drawn once in diagrams.js and
// displayed here. No new npm packages: zoom/pan is plain pointer
// events, narration is the browser's own speechSynthesis (same
// engine and the same "ascend_voice_gender" preference the
// existing Listen/podcast feature in App.js already uses),
// drag-and-drop in the pathway builder is native HTML5 DnD with
// a tap-to-place fallback for mobile.
//
// SCREENS (per the Atlas spec):
//   1. Course picker   - which courses have visuals
//   2. Visuals list     - that course's visuals, syllabus order
//   3. Viewer           - the SVG, zoom/pan, tap-a-label, legend,
//                         breadcrumb, drill-downs
//   4. Play             - animated walkthrough synced to narration
//   5. Builder          - drag-and-arrange pathway (Glycolysis first)
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
.atlas-viewer-stage { touch-action: none; cursor: grab; }
.atlas-viewer-stage:active { cursor: grabbing; }
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
/* Screen 3+4 - the diagram viewer, with zoom/pan, labels, legend,  */
/* breadcrumb, drill-downs and the Play walkthrough                 */
/* ---------------------------------------------------------------- */
function DiagramViewer({ diagramId, breadcrumb, onBreadcrumb, onDrill, onExit, app }) {
  const diagram = DIAGRAMS[diagramId];
  const [activeLabelId, setActiveLabelId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
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
              if (next >= diagram.narration.length) { setPlaying(false); return s; }
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
      // pause
      setPlaying(false);
      setPaused(true);
      playTokenRef.current++;
      try { window.speechSynthesis.cancel(); } catch {}
      return;
    }
    setPlaying(true);
    setPaused(false);
    speakStep(activeStep);
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

  /* ---- zoom / pan ---- */
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(3, Math.max(0.5, +(z + delta).toFixed(2))));
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
      setZoom(Math.min(3, Math.max(0.5, +(pinchRef.current.zoom * ratio).toFixed(2))));
    } else if (pointers.current.size === 1 && dragRef.current) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current = { x: e.clientX, y: e.clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
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

      {/* breadcrumb + back */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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

      {/* zoom controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 6 }}>
        <button className="btn btn-sm" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))}>−</button>
        <button className="btn btn-sm mono" style={{ minWidth: 50 }} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>{Math.round(zoom * 100)}%</button>
        <button className="btn btn-sm" onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}>+</button>
      </div>

      {/* the stage */}
      <div
        className="card atlas-viewer-stage"
        style={{ padding: 0, overflow: "hidden", height: 320 }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ width: "100%", height: "100%", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: dragRef.current ? "none" : "transform 0.15s ease-out" }}>
          {diagram.render({ onLabelClick: setActiveLabelId, activeLabelId, activeStep, onOpenDrill: () => {} })}
        </div>
      </div>

      {/* active label description */}
      {activeLabel && (
        <div className="card" style={{ marginTop: 10, borderColor: "rgba(245,185,63,.35)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--amber-2)" }}>{activeLabel.name}</div>
          <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>{activeLabel.desc}</div>
          {activeLabel.drillTo && (
            <button className="btn btn-a btn-sm" style={{ marginTop: 8 }} onClick={() => onDrill(activeLabel.drillTo)}>
              Open {activeLabel.name} <Ic_chevR />
            </button>
          )}
        </div>
      )}

      {/* legend toggle + panel */}
      <button className="btn btn-g btn-sm" style={{ marginTop: 10 }} onClick={() => setShowLegend((s) => !s)}>
        {showLegend ? "Hide legend" : "Show legend"}
      </button>
      {showLegend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {(diagram.labels || []).map((l) => (
            <button
              key={l.id}
              className="btn btn-sm"
              style={{ background: activeLabelId === l.id ? "var(--amber-dim)" : "var(--bg-3)", color: activeLabelId === l.id ? "var(--amber-2)" : "var(--text-2)", border: "1px solid var(--line)" }}
              onClick={() => setActiveLabelId(l.id)}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* play walkthrough */}
      <div className="divider" />
      <div className="eyebrow" style={{ marginBottom: 10 }}>Walk through it</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-a btn-sm" onClick={handlePlay}>
          {playing ? "Pause" : paused ? "Resume" : "Play"}
        </button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(-1)} disabled={activeStep === 0}>◀</button>
        <button className="btn btn-g btn-sm" onClick={() => stepBy(1)} disabled={activeStep === diagram.narration.length - 1}>▶</button>
        <button className="btn btn-g btn-sm mono" onClick={() => setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 0.85 : 1))}>{speed}×</button>
        <button className="btn btn-g btn-sm" onClick={() => setVoiceOn((v) => !v)}>{voiceOn ? "Voice on" : "Voice off"}</button>
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
        {diagram.narration.map((_, i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            style={{ flex: 1, height: 6, borderRadius: 3, border: "none", cursor: "pointer", background: i <= activeStep ? "var(--amber)" : "var(--line)" }}
            title={`Step ${i + 1}`}
          />
        ))}
      </div>
      <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 8, minHeight: 36 }}>{diagram.narration[activeStep]}</div>

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          Pick a course to see the topics with a hand-drawn, interactive diagram or pathway builder.
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
