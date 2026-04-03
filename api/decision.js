const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 8000;

function buildSystemPrompt() {
  return `You are an automotive analyst. Output ONLY valid JSON with no markdown, no code fences, no commentary before or after. The JSON must match this exact schema and key names:
{
  "best_car": string (full car name from the comparison),
  "confidence": number between 0 and 1,
  "reason": string (2-4 sentences, decisive),
  "why_this_wins": [string, string] (2 concise bullets),
  "tradeoffs": string (1-2 sentences on downsides of the winner),
  "best_for": [string, string] (2 short use cases),
  "not_ideal_for": [string, string] (2 short caveats),
  "scores": [
    {
      "car": string,
      "overall": number 0-100,
      "price": number 0-100,
      "mileage": number 0-100,
      "power": number 0-100,
      "features": number 0-100,
      "safety": number 0-100,
      "reliability": number 0-100,
      "resale": number 0-100
    }
  ]
}
Scores must reflect the user's stated priorities (higher weight = scores should align more with that dimension). Use realistic relative comparisons; do not invent specific trim prices—use qualitative judgment. Include one scores object per car in the same order as listed.`;
}

function buildUserMessage(cars, priorities) {
  const list = cars.filter(Boolean).join(" vs ");
  return `Compare these vehicles for a buyer with these priority weights (1=low, 10=high):

Cars: ${list}

Priorities:
- Price sensitivity: ${priorities.price}/10
- Mileage importance: ${priorities.mileage}/10
- Power/performance: ${priorities.power}/10
- Features & comfort: ${priorities.features}/10
- Safety: ${priorities.safety}/10
- Reliability: ${priorities.reliability}/10
- Resale value: ${priorities.resale}/10

Pick the single best overall choice for this buyer. Fill every field.`;
}

function fallbackResponse(cars) {
  const clean = cars.filter(Boolean);
  const primary = clean[0] || "Vehicle A";
  const scores = clean.map((car, i) => ({
    car,
    overall: i === 0 ? 72 : 68,
    price: 70 - i * 5,
    mileage: 65 + i * 3,
    power: 68,
    features: 66,
    safety: 72,
    reliability: 70,
    resale: 67,
  }));
  return {
    best_car: primary,
    confidence: 0.42,
    reason:
      "We could not reach the AI service in time. This is a neutral placeholder—add your GROQ_API_KEY and retry for a full analysis tailored to your priorities.",
    why_this_wins: [
      "Placeholder ranking while offline",
      "Scores are illustrative only",
    ],
    tradeoffs:
      "Without live AI, trade-offs are not personalized. Compare test drives and ownership costs for your region.",
    best_for: ["Re-running analysis when the API is available", "Manual research with your priorities"],
    not_ideal_for: ["Relying on placeholder scores alone", "Final purchase decisions without verification"],
    scores,
  };
}

function safeParseJson(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = trimmed.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function validatePayload(data, cars) {
  if (!data || typeof data !== "object") return false;
  const keys = [
    "best_car",
    "confidence",
    "reason",
    "why_this_wins",
    "tradeoffs",
    "best_for",
    "not_ideal_for",
    "scores",
  ];
  for (const k of keys) {
    if (!(k in data)) return false;
  }
  if (!Array.isArray(data.scores) || data.scores.length !== cars.length) return false;
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    let raw = {};
    try {
      raw = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch {
      raw = {};
    }
    const cars = Array.isArray(raw?.cars) ? raw.cars.map(String).filter(Boolean) : [];
    return res.status(200).json(fallbackResponse(cars.length ? cars : ["Car 1", "Car 2"]));
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const cars = Array.isArray(body?.cars)
    ? body.cars.map((c) => String(c).trim()).filter(Boolean).slice(0, 3)
    : [];

  if (cars.length < 2) {
    return res.status(400).json({ error: "Provide at least two cars" });
  }

  const p = body.priorities || {};
  const priorities = {
    price: Math.min(10, Math.max(1, Number(p.price) || 5)),
    mileage: Math.min(10, Math.max(1, Number(p.mileage) || 5)),
    power: Math.min(10, Math.max(1, Number(p.power) || 5)),
    features: Math.min(10, Math.max(1, Number(p.features) || 5)),
    safety: Math.min(10, Math.max(1, Number(p.safety) || 5)),
    reliability: Math.min(10, Math.max(1, Number(p.reliability) || 5)),
    resale: Math.min(10, Math.max(1, Number(p.resale) || 5)),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserMessage(cars, priorities) },
        ],
      }),
      signal: controller.signal,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.error("Groq error:", groqRes.status, errText);
      clearTimeout(timeout);
      return res.status(200).json(fallbackResponse(cars));
    }

    const groqJson = await groqRes.json();
    clearTimeout(timeout);
    const content =
      groqJson?.choices?.[0]?.message?.content ||
      groqJson?.choices?.[0]?.message?.reasoning ||
      "";

    const parsed = safeParseJson(content);
    if (!parsed || !validatePayload(parsed, cars)) {
      console.error("Parse/validate failed:", content?.slice?.(0, 500));
      return res.status(200).json(fallbackResponse(cars));
    }

    return res.status(200).json(parsed);
  } catch (e) {
    clearTimeout(timeout);
    if (e?.name === "AbortError") {
      console.error("Groq request timed out");
    } else {
      console.error(e);
    }
    return res.status(200).json(fallbackResponse(cars));
  }
}
