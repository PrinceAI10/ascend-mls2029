// speech.js
// ------------------------------------------------------------
// One shared speech engine for the whole app.
//
//   speak(text, opts)       — cancel anything current, speak this,
//                             call back when done.
//   speakQueued(text, opts) — if something is speaking, wait your
//                             turn; then speak.
//
// This version is a hard rewrite. It fixes three things that
// the previous versions got wrong:
//
//   1. speak() supports a `chunks` array and joins all chunks
//      into ONE utterance. No cancel between chunks. No gap.
//      onStart fires once, onEnd fires once.
//
//   2. Watchdog timers are set to values that cannot fire before
//      speech has had a chance to start. Startup = 15s. Finish =
//      words*2.5s + 5s. Nobody's voice is that slow.
//
//   3. speakQueued() and speak() share the voice cache, share the
//      keep-alive, and never fight each other. stopSpeaking()
//      clears every piece of state so the next call starts clean.
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

// Resolved voice per gender. Once we know which voice the device
// will use for "male" and "female", we never await pickVoice()
// again. That await is what closes the mobile audio session
// between calls, and skipping it is what stops the stutter.
const voiceByGender = { male: undefined, female: undefined };

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
// Chromium cuts off utterances longer than ~15 seconds unless
// something nudges the queue. pause()+resume() every 3 seconds
// prevents that. Desktop-only: on Android the nudge is audible.
// Singleton so two callers can't run two competing keep-alives.
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
        !window.speechSynthesis.paused &&
        !window.speechSynthesis.pending
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
// speak(text, { chunks, onStart, onEnd, rate, gender })
//
// If `chunks` is provided, the array's text fields are joined
// into ONE utterance. The engine speaks it continuously. No
// cancel between chunks. onStart fires once, onEnd fires once.
//
// If `chunks` is not provided, `text` is spoken as a single
// utterance. That path is what Atlas and VITRO use.
// ------------------------------------------------------------
function speak(text, { onStart, onEnd, rate = 1, gender = null } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  const fullText = String(text || "").trim();
  if (!fullText) {
    if (onEnd) onEnd();
    return;
  }
  const wordCount = fullText.split(/\s+/).length;

  installVisibilityHandler();

  // Unconditional cancel. Some mobile engines report idle for a
  // few hundred ms before the audio session has actually been
  // released, and a conditional cancel then queues behind a
  // session that is still tearing down.
  try { window.speechSynthesis.cancel(); } catch {}

  // Watchdog sizing.
  //
  // Finish watchdog: word-count based, deliberately generous.
  // A slow voice reads at about 2 words per second. A very slow
  // voice reads at 1.5. The floor is 12 seconds and the base
  // formula gives 2.5 seconds of speaking time per word plus 5
  // seconds of slack. Nothing real hits this.
  //
  // Startup watchdog: 15 seconds. Covers a cold mobile engine
  // loading a voice for the first time.
  const finishMs = Math.max(12000, (wordCount * 2500) + 5000) / rate;
  const STARTUP_MS = 15000;

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

  (async () => {
    const g = gender || readGender();

    // Use the cached voice if we have it. If not, we must await
    // pickVoice(), but only once per gender per session.
    let voice = voiceByGender[g];
    if (voice === undefined) {
      voice = await pickVoice(g);
      voiceByGender[g] = voice || null;
    }

    // If a newer speak() call came in while we awaited the voice,
    // abandon this one. Prevents a stale utterance from firing on
    // top of the current one.
    if (finished) return;

    const utter = new SpeechSynthesisUtterance(fullText);
    if (voice) utter.voice = voice;

        if (g === "male") {
      utter.pitch = 0.9;
      utter.rate = 1.0 * rate;
    } else {
      utter.pitch = 1.05;
      utter.rate = 1.0 * rate;
    }

    utter.onstart = () => {
      started = true;
      if (startupTimer) { clearTimeout(startupTimer); startupTimer = null; }
      finishTimer = setTimeout(finish, finishMs);
      startKeepAlive();
      visibility.currentText = fullText;
      if (onStart) onStart();
    };
    utter.onend = finish;
    utter.onerror = finish;

    try {
      window.speechSynthesis.speak(utter);
    } catch {
      finish();
      return;
    }

    startupTimer = setTimeout(() => {
      startupTimer = null;
      if (!started) finish();
    }, STARTUP_MS);
  })();
}

// ------------------------------------------------------------
// speakQueued(text, { onEnd, onStart, rate, gender })
//
// If something is speaking, queue this line. If nothing is
// speaking, speak it now. A second call while a line is queued
// replaces the queued line (does not stack).
//
// Used by VITRO. A ticker enforces a 30s cap so the queue can
// never deadlock on a dropped onend.
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
  if (elapsed > MAX_QUEUED_UTTER_MS) {
    try { window.speechSynthesis.cancel(); } catch {}
    queue.currentUtter = null;
    const cutCb = queue.currentOnEnd;
    queue.currentOnEnd = null;
    if (cutCb) { try { cutCb(); } catch {} }
    if (queue.queuedText) {
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
      utter.pitch = 0.9;
      utter.rate = 1.0 * rate;
    } else {
      utter.pitch = 1.05;
      utter.rate = 1.0 * rate;
    }
  let voice = voiceByGender[g];
  if (voice === undefined) {
    pickVoice(g).then((v) => { voiceByGender[g] = v || null; });
  } else if (voice) {
    utter.voice = voice;
  }
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
    // If a line is already queued, fire its onEnd before replacing
    // it. Otherwise the caller waiting on that callback hangs.
    if (queue.queuedOnEnd && typeof queue.queuedOnEnd === "function") {
      const dropped = queue.queuedOnEnd;
      queue.queuedOnEnd = null;
      queue.queuedOnStart = null;
      try { dropped(); } catch {}
    }
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
// queue ticker, the keep-alive, the visibility flag.
// ------------------------------------------------------------
function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  stopKeepAlive();
  queue.currentUtter = null;
  queue.queuedText = null;
  queue.currentOnEnd = null;
  queue.queuedOnEnd = null;
  queue.currentOnStart = null;
  queue.queuedOnStart = null;
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