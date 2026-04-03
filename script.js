const API_PATH = "/api/decision";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function collectPriorities() {
  const keys = ["price", "mileage", "power", "features", "safety", "reliability", "resale"];
  const priorities = {};
  for (const key of keys) {
    const row = document.querySelector(`.slider-row[data-key="${key}"]`);
    const input = row?.querySelector('input[type="range"]');
    priorities[key] = input ? Number(input.value) : 5;
  }
  return priorities;
}

function collectCars() {
  const c1 = $("#car1")?.value.trim();
  const c2 = $("#car2")?.value.trim();
  const c3 = $("#car3")?.value.trim();
  const cars = [c1, c2].filter(Boolean);
  if (c3) cars.push(c3);
  return cars;
}

function setSliderLabels() {
  document.querySelectorAll(".slider-row").forEach((row) => {
    const key = row.getAttribute("data-key");
    const input = row.querySelector('input[type="range"]');
    const label = row.querySelector(`[data-value-for="${key}"]`);
    if (input && label) {
      label.textContent = input.value;
      input.addEventListener("input", () => {
        label.textContent = input.value;
      });
    }
  });
}

function showError(msg) {
  const el = $("#form-error");
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

function setLoading(on) {
  const loading = $("#loading");
  const btn = $("#analyze-btn");
  if (loading) loading.hidden = !on;
  if (btn) btn.disabled = on;
}

function pctFromConfidence(c) {
  const n = typeof c === "number" && !Number.isNaN(c) ? c : 0;
  return Math.round(Math.min(1, Math.max(0, n)) * 100);
}

function animateConfidenceBar(pct) {
  const fill = $("#confidence-fill");
  const wrap = $("#confidence-bar-wrap");
  if (!fill || !wrap) return;
  requestAnimationFrame(() => {
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      fill.style.width = `${pct}%`;
      wrap.setAttribute("aria-valuenow", String(pct));
    });
  });
}

function renderListItems(ul, items) {
  ul.innerHTML = "";
  const list = Array.isArray(items) ? items : [];
  list.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = String(text ?? "");
    ul.appendChild(li);
  });
}

function renderTags(container, items, className) {
  container.innerHTML = "";
  const list = Array.isArray(items) ? items : [];
  list.forEach((text) => {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = String(text ?? "");
    container.appendChild(span);
  });
}

function renderMatrix(scores) {
  const matrix = $("#matrix");
  if (!matrix) return;
  matrix.innerHTML = "";

  const rows = Array.isArray(scores) ? scores : [];
  const miniKeys = [
    { key: "price", label: "Price" },
    { key: "mileage", label: "Mileage" },
    { key: "power", label: "Power" },
    { key: "safety", label: "Safety" },
  ];

  rows.forEach((row, idx) => {
    const card = document.createElement("article");
    card.className = "glass card matrix-card";
    card.style.animationDelay = `${0.08 * idx}s`;

    const title = document.createElement("h4");
    title.className = "matrix-card__title";
    title.textContent = row.car ?? "—";

    const overallWrap = document.createElement("div");
    overallWrap.className = "matrix-card__overall";
    const num = document.createElement("span");
    num.className = "matrix-card__overall-num";
    num.textContent = String(row.overall ?? 0);
    const lab = document.createElement("span");
    lab.className = "matrix-card__overall-label";
    lab.textContent = "Overall";
    overallWrap.append(num, lab);

    const bars = document.createElement("div");
    bars.className = "mini-bars";

    miniKeys.forEach(({ key, label }) => {
      const val = Number(row[key]);
      const safe = Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0;

      const rowEl = document.createElement("div");
      rowEl.className = "mini-bar";

      const l = document.createElement("span");
      l.className = "mini-bar__label";
      l.textContent = label;

      const track = document.createElement("div");
      track.className = "mini-bar__track";
      const fill = document.createElement("div");
      fill.className = "mini-bar__fill";
      track.appendChild(fill);

      const v = document.createElement("span");
      v.className = "mini-bar__val";
      v.textContent = String(Math.round(safe));

      rowEl.append(l, track, v);
      bars.appendChild(rowEl);

      requestAnimationFrame(() => {
        fill.style.width = `${safe}%`;
      });
    });

    card.append(title, overallWrap, bars);
    matrix.appendChild(card);
  });
}

function displayResults(data) {
  const results = $("#results");
  if (!results) return;

  $("#best-car").textContent = data.best_car ?? "—";
  const pct = pctFromConfidence(data.confidence);
  $("#confidence-pct").textContent = `${pct}%`;
  animateConfidenceBar(pct);

  $("#reason").textContent = data.reason ?? "";

  renderListItems($("#why-wins"), data.why_this_wins);
  $("#tradeoffs").textContent = data.tradeoffs ?? "";

  renderTags($("#best-for"), data.best_for, "tag");
  renderTags($("#not-ideal"), data.not_ideal_for, "tag");

  renderMatrix(data.scores);

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });

  const inner = results.querySelector(".results-animate");
  if (inner) {
    inner.classList.remove("results-animate");
    void inner.offsetWidth;
    inner.classList.add("results-animate");
  }
}

async function analyze() {
  showError("");
  const cars = collectCars();
  if (cars.length < 2) {
    showError("Enter at least two vehicles to compare.");
    return;
  }

  setLoading(true);
  const results = $("#results");
  if (results) results.hidden = true;

  const body = {
    cars,
    priorities: collectPriorities(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (!res.ok) {
      throw new Error(json?.error || "Something went wrong. Try again.");
    }

    if (!json || typeof json !== "object") {
      throw new Error("Empty response.");
    }

    displayResults(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error. Check your connection.";
    showError(msg);
  } finally {
    setLoading(false);
  }
}

function init() {
  setSliderLabels();
  $("#analyze-btn")?.addEventListener("click", analyze);

  document.querySelectorAll(".field__input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") analyze();
    });
  });
}

init();
