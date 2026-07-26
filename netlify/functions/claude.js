/*
 * ASCEND AI proxy  ->  Google Gemini (free tier, no credit card)
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * The browser cannot call Gemini directly (the key would be exposed, and the
 * provider blocks direct browser calls). So the browser calls THIS function,
 * which runs on Netlify's server, holds the key safely, forwards to Gemini, and
 * returns the answer in the shape the app already understands.
 *
 * GET A FREE KEY (no credit card, no phone):
 *   1. Go to  https://aistudio.google.com
 *   2. Sign in with a Google account.
 *   3. Left menu -> "Get API Key" -> Create API key. Copy it.
 *
 * DEPLOY
 *   1. This file goes at:  netlify/functions/claude.js
 *      (The app calls /.netlify/functions/claude - the filename must be claude.js.)
 *   2. Netlify -> Configuration -> Environment variables, add:
 *         GEMINI_API_KEY = your key from AI Studio
 *   3. Commit, push. Netlify builds the function automatically.
 *
 * The app sends { system, messages, max_tokens }.
 * This function converts that to Gemini's format, then converts Gemini's reply
 * back into { choices:[{message:{content}}] }, which the app already reads.
 */

const MODEL = "gemini-2.5-flash"; // free tier, fast, large context

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "GEMINI_API_KEY is not set in Netlify environment variables." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "Bad request body" }) };
  }

  const { system, messages, max_tokens } = payload;

  // Convert the app's messages into Gemini "contents".
  // Gemini uses roles "user" and "model" (not "assistant"), and takes the
  // system prompt separately as systemInstruction.
  const contents = [];
  if (Array.isArray(messages)) {
    for (const m of messages) {
      let text = m.content;
      if (Array.isArray(text)) {
        text = text.map((b) => (typeof b === "string" ? b : b.text || "")).join("\n");
      }
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(text || "") }],
      });
    }
  }

  const bodyOut = {
    contents,
    generationConfig: { maxOutputTokens: max_tokens || 1024, temperature: 0.7 },
  };
  if (system) {
    bodyOut.systemInstruction = { parts: [{ text: String(system) }] };
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + key;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyOut),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : "Gemini request failed";
      return { statusCode: res.status, headers: { ...cors(), "Content-Type": "application/json" }, body: JSON.stringify({ error: msg }) };
    }

    // Pull the text out of Gemini's response shape.
    let text = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)) {
      text = data.candidates[0].content.parts.map((p) => p.text || "").join("");
    }

    // Return it in the OpenAI/DeepSeek shape the app already parses.
    return {
      statusCode: 200,
      headers: { ...cors(), "Content-Type": "application/json" },
      body: JSON.stringify({ choices: [{ message: { content: text } }] }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors(),
      body: JSON.stringify({ error: "Could not reach Gemini: " + (err && err.message ? err.message : String(err)) }),
    };
  }
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
