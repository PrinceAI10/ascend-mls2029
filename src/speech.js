// speech.js
// ------------------------------------------------------------
// One shared speech engine for the whole app.
//
// Three files used to each carry their own copy of this code:
//   App.js        — the podcast reader (ascendPickVoice, ascendGetVoices,
//                    and the speakChunk engine inside TopicView)
//   AtlasView.jsx — the diagram narrator (pickVoice, getVoices, speakStep)
//   VitroView.jsx — the VITRO bench narrator (vitroSpeak and friends)
//
// They converged on the same three or four underlying bugs:
//   1. no keep-alive on Chrome, so long lines cut off mid-sentence
//      after ~15 seconds
//   2. watchdogs sized too tight, so they fired before speech had
//      actually started
//   3. the watchdog racing onstart, so it advanced the step twice
//
// This module is the union of the three implementations, with
// those bugs closed once. Two shapes are exposed, because the
// callers genuinely need two different contracts:
//
//   speak(text, opts)       — cancel anything current, speak this,
//                             call back when done. App.js and
//                             AtlasView.jsx both want this.
//
//   speakQueued(text, opts) — if something is speaking, wait your
//                             turn; then speak. VitroView.jsx
//                             wants this, because its script reads
//                             lines in order and cutting one off
//                             to start the next mid-script would
//                             break the reading.
// ------------------------------------------------------------

const FEMALE_HINTS = [
  "female", "zira", "samantha", "victoria", "susan", "karen", "moira",
  "tessa", "fiona", "google us english", "google uk english female",
  "aria", "jenny", "sonia", "libby", "hazel", "salli", "joanna", "amy",
];

const MALE_HINTS = [
  "male", "david", "mark", "daniel", "alex", "fred",
  "google uk english male", "guy", "ryan", "tom", "matthew",
  "brian", "arthur", "george",
];

// Voice list is expensive to fetch and arrives asynchronously
// (voiceschanged). Cache it once and reuse forever.
let voicesCache = null;

function getVoices() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length) {
      voicesCache = existing;
      resolve(existing);
      return;
    }
    if (voicesCache) {
      resolve(voicesCache);
      return;
    }
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

// Rank the available English voices for the requested gender and
// return the best one. Order of preference:
//   1. A voice explicitly tagged "Enhanced" or "Premium"
//      (this is how iOS labels its good user-downloaded voices,
//      and it's the single biggest quality win on mobile).
//   2. A local (installed, not cloud) voice matching the hints.
//   3. Any voice matching the hints.
//   4. The first English voice, as a last resort.
async function pickVoice(gender) {
  let g = gender;
  if (g == null) {
    try {
      g = localStorage.getItem("ascend_voice_gender") || "female";
    } catch {
      g = "female";
    }
  }
  const voices = await getVoices();
  if (!voices.length) return null;

  const english = voices.filter((v) => /^en/i.test(v.lang));
  const pool = english.length ? english : voices;
  const hints = g === "male" ? MALE_HINTS : FEMALE_HINTS;
  const nameMatches = (v) =>
    hints.some((h) => v.name.toLowerCase().includes(h));

  const enhanced = pool.find(
    (v) => nameMatches(v) && /enhanced|premium/i.test(v.name)
  );
  if (enhanced) return enhanced;

  const local = pool.find(
    (v) => nameMatches(v) && v.localService === true
  );
  if (local) return local;

  const named = pool.find(nameMatches);
  if (named) return named;

  return pool[0] || null;
}

// Read the current gender preference from the same localStorage
// key every existing copy of this code already uses.
function readGender() {
  try {
    return localStorage.getItem("ascend_voice_gender") || "female";
  } catch {
    return "female";
  }
}

// ------------------------------------------------------------
// Chrome keep-alive.
//
// Chromium's speech engine silently cuts off any utterance longer
// than ~15 seconds unless something nudges the queue. A pause()
// immediately followed by resume() every few seconds prevents
// that, without the listener noticing any gap.
//
// This interval is a singleton at module scope so two callers
// (e.g. App.js and AtlasView.jsx mounted at once) can't fight
// each other with two competing keep-alives.
// ------------------------------------------------------------
const keepAlive = { timer: null };

function startKeepAlive() {
  if (keepAlive.timer) return;
  keepAlive.timer = setInterval(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.speechSynthesis &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    } catch {}
  }, 3000);
}

function stopKeepAlive() {
  if (keepAlive.timer) {
    clearInterval(keepAlive.timer);
    keepAlive.timer = null;
  }
}

// ------------------------------------------------------------
// Pause/resume on tab visibility.
//
// speechSynthesis keeps talking even when the tab is backgrounded.
// Without this, the narrator keeps reading into an empty tab.
// We pause (not cancel - cancelling would lose the line) and
// resume from the same point when the tab comes back.
//
// Known limitation: desktop Chrome will sometimes fail to resume
// a line paused longer than ~15s. If resume doesn't actually
// produce audio, we restart the same line from its beginning
// rather than leaving the student on a silent narrator.
//
// Installed once, on first speak() call.
// ------------------------------------------------------------
const visibility = {
  installed: false,
  pausedByUs: false,
  currentText: null,
};

function installVisibilityHandler() {
  if (visibility.installed) return;
  if (typeof document === "undefined") return;
  visibility.installed = true;

  document.addEventListener("visibilitychange", () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (document.visibilityState === "hidden") {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        try { window.speechSynthesis.pause(); } catch {}
        visibility.pausedByUs = true;
      }
      return;
    }

    if (!visibility.pausedByUs) return;
    visibility.pausedByUs = false;
    const resumeText = visibility.currentText;
    try { window.speechSynthesis.resume(); } catch {}
    setTimeout(() => {
      if (window.speechSynthesis.paused && resumeText) {
        try { window.speechSynthesis.cancel(); } catch {}
        visibility.currentText = null;
        speak(resumeText, {});
      }
    }, 400);
  });
}

// ------------------------------------------------------------
// speak(text, { onStart, onEnd, rate, gender })
//
// Cancel anything currently speaking, then speak this line.
// Call onStart when speech actually begins (after the browser's
// onstart fires, NOT when we call speak() - speak() doesn't
// throw on autoplay block, it silently drops the utterance, so
// onstart is the only reliable "it's really playing" signal).
// Call onEnd when it finishes, or when the fallback watchdog
// decides it has been running long enough to be considered done.
//
// Watchdog strategy:
//   - Finish watchdog sized generously (2 words/second, which is
//     slower than any real TTS voice, plus 3 seconds of slack).
//     This only fires if onend genuinely never comes.
//   - Startup watchdog (4.5s) for the case where the browser
//     silently drops the speak() call. Cleared the moment onstart
//     fires, so it can never race onend into a double-advance.
// ------------------------------------------------------------
function speak(text, { onStart, onEnd, rate = 1, gender = null } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }
  const clean = String(text || "").trim();
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  installVisibilityHandler();

  // Cancel anything in flight.
  try { window.speechSynthesis.cancel(); } catch {}

  const words = clean.split(/\s+/).length;
  const finishMs = Math.max(6000, (words / 2.0) * 1000 * 1.6 + 3000) / rate;
  const STARTUP_MS = 4500;

  let finished = false;
  let started = false;
  let finishTimer = null;
  let startupTimer = null;

  const clearTimers = () => {
    if (startupTimer) { clearTimeout(startupTimer); startupTimer = null; }
    if (finishTimer) { clearTimeout(finishTimer); finishTimer = null; }
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimers();
    stopKeepAlive();
    visibility.currentText = null;
    if (onEnd) onEnd();
  };

  // If speech never actually starts, we still need to finish.
  // Otherwise a diagram/reader would freeze waiting on a
  // dropped utterance.
  startupTimer = setTimeout(() => {
    startupTimer = null;
    if (!started) finish();
  }, STARTUP_MS);

  (async () => {
    const g = gender || readGender();
    const voice = await pickVoice(g);

    const utter = new SpeechSynthesisUtterance(clean);
    if (voice) utter.voice = voice;
    // Gender-tinted pitch/rate, same values every copy of the
    // code used. A male voice gets a deeper, slightly slower read.
    if (g === "male") {
      utter.pitch = 0.85;
      utter.rate = 0.80 * rate;
    } else {
      utter.pitch = 1.1;
      utter.rate = 0.82 * rate;
    }

    utter.onstart = () => {
      started = true;
      // Speech is genuinely playing. Clear the startup watchdog
      // and arm the generous finish watchdog instead.
      if (startupTimer) { clearTimeout(startupTimer); startupTimer = null; }
      finishTimer = setTimeout(finish, finishMs);
      startKeepAlive();
      visibility.currentText = clean;
      if (onStart) onStart();
    };
    utter.onend = finish;
    utter.onerror = finish;

    try {
      window.speechSynthesis.speak(utter);
    } catch {
      finish();
    }
  })();
}

// ------------------------------------------------------------
// speakQueued(text, { onEnd, rate, gender })
//
// VITRO's shape. If something is currently speaking, queue this
// line to play when the current one finishes. If nothing is
// speaking, speak it now.
//
// A second call while a line is queued replaces the queued line
// (it does NOT stack). This matches the behaviour every existing
// copy of the VITRO engine already has.
//
// A ticker runs every 400ms while active. It enforces a 30s
// maximum on any single utterance, because a few mobile speech
// engines occasionally fail to fire onend, and without a cap
// the queue would deadlock.
// ------------------------------------------------------------
const queue = {
  currentUtter: null,
  currentStartedAt: 0,
  currentOnEnd: null,
  currentOnStart: null,
  currentText: null,
  queuedText: null,
  queuedOnEnd: null,
  queuedOnStart: null,
  ticker: null,
  idleTicks: 0,
};

const MAX_QUEUED_UTTER_MS = 30000;
const QUEUE_BEAT_MS = 350;

function queueTick() {
  if (!queue.currentUtter) {
    if (queue.queuedText) {
      const next = queue.queuedText;
      const nextCb = queue.queuedOnEnd;
      const nextStart = queue.queuedOnStart;
      queue.queuedText = null;
      queue.queuedOnEnd = null;
      queue.queuedOnStart = null;
      queue.currentOnEnd = nextCb;
      queue.currentOnStart = nextStart;
      setTimeout(() => speakQueuedNow(next), QUEUE_BEAT_MS);
      return;
    }
    // Truly idle. Stop the ticker after a short grace so it isn't
    // running for the rest of the session once the student has
    // left. speakQueued() restarts it next time it's needed.
    queue.idleTicks++;
    if (queue.idleTicks > 3 && queue.ticker) {
      clearInterval(queue.ticker);
      queue.ticker = null;
      queue.idleTicks = 0;
    }
    return;
  }
  queue.idleTicks = 0;
  if (visibility.pausedByUs) return;
  const elapsed = Date.now() - queue.currentStartedAt;
  if (elapsed > MAX_QUEUED_UTTER_MS && queue.queuedText) {
    try { window.speechSynthesis.cancel(); } catch {}
    queue.currentUtter = null;
    const cutCb = queue.currentOnEnd;
    queue.currentOnEnd = null;
    if (cutCb) { try { cutCb(); } catch {} }
    const next = queue.queuedText;
    const nextCb = queue.queuedOnEnd;
    queue.queuedText = null;
    queue.queuedOnEnd = null;
    setTimeout(() => {
      queue.currentOnEnd = nextCb;
      speakQueuedNow(next);
    }, QUEUE_BEAT_MS);
  }
}

function queueStart() {
  if (queue.ticker) return;
  queue.idleTicks = 0;
  queue.ticker = setInterval(queueTick, 400);
}

function speakQueuedNow(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (queue.currentOnEnd) {
      const cb = queue.currentOnEnd;
      queue.currentOnEnd = null;
      try { cb(); } catch {}
    }
    return;
  }
  const clean = String(text || "").trim();
  if (!clean) {
    if (queue.currentOnEnd) {
      const cb = queue.currentOnEnd;
      queue.currentOnEnd = null;
      try { cb(); } catch {}
    }
    return;
  }
  const g = readGender();
  const utter = new SpeechSynthesisUtterance(clean);
  if (g === "male") {
    utter.pitch = 0.85;
    utter.rate = 0.80;
  } else {
    utter.pitch = 1.1;
    utter.rate = 0.82;
  }
  pickVoice(g).then((voice) => {
    if (voice) utter.voice = voice;
  });
  queue.currentUtter = utter;
  queue.currentStartedAt = Date.now();
  queue.currentText = clean;
  utter.onstart = () => {
    const cb = queue.currentOnStart;
    queue.currentOnStart = null;
    if (cb) { try { cb(); } catch {} }
  };
  utter.onend = () => {
    queue.currentUtter = null;
    const cb = queue.currentOnEnd;
    queue.currentOnEnd = null;
    if (cb) { try { cb(); } catch {} }
    if (queue.queuedText) {
      setTimeout(queueTick, QUEUE_BEAT_MS);
    }
  };
  utter.onerror = utter.onend;
  try {
    window.speechSynthesis.speak(utter);
    startKeepAlive();
  } catch {
    queue.currentUtter = null;
    if (queue.currentOnEnd) {
      const cb = queue.currentOnEnd;
      queue.currentOnEnd = null;
      try { cb(); } catch {}
    }
  }
}

function speakQueued(text, { onEnd, onStart, rate = 1, gender = null } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onStart) onStart();
    if (onEnd) onEnd();
    return;
  }
  const clean = String(text || "").trim();
  if (!clean) {
    if (onStart) onStart();
    if (onEnd) onEnd();
    return;
  }

  installVisibilityHandler();
  queueStart();

  if (queue.currentUtter) {
    // Something is already speaking. Queue this line.
    queue.queuedText = clean;
    queue.queuedOnEnd = typeof onEnd === "function" ? onEnd : null;
    queue.queuedOnStart = typeof onStart === "function" ? onStart : null;
    return;
  }

  queue.currentOnEnd = typeof onEnd === "function" ? onEnd : null;
  queue.currentOnStart = typeof onStart === "function" ? onStart : null;
  speakQueuedNow(clean);
}

// ------------------------------------------------------------
// stopSpeaking()
//
// Cancel everything: current utterance, queued utterance, the
// queue ticker, and the keep-alive. Safe to call at any time
// from any file.
// ------------------------------------------------------------
function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  stopKeepAlive();
  // Clear the queue.
  queue.currentUtter = null;
  queue.queuedText = null;
  queue.currentOnEnd = null;
  queue.queuedOnEnd = null;
  queue.currentText = null;
  if (queue.ticker) {
    clearInterval(queue.ticker);
    queue.ticker = null;
  }
  visibility.pausedByUs = false;
  visibility.currentText = null;
}

function isSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try { return window.speechSynthesis.speaking; } catch { return false; }
}

export {
  speak,
  speakQueued,
  stopSpeaking,
  pickVoice,
  getVoices,
  isSpeaking,
};