import { DEVICES, ROOMS, FACTORS, PRESETS } from "./data.js";
import { STATES, kgCo2PerKwhFor, priceFor } from "./states.js";
import { summarize, planStrips, scaleUp, breakdown, parsePrice, clampCount } from "./logic.js";
import { drawCard } from "./card.js";

const STORAGE_KEY = "unplug.v2";

const state = load() ?? { counts: {}, unplugged: [], region: "US", price: null, room: "living" };
let unplugged = new Set(state.unplugged);

const $ = (sel) => document.querySelector(sel);
const rooms = $("#rooms");
const grid = $("#grid");
const priceInput = $("#price");
const priceError = $("#price-error");
const regionSelect = $("#region");

// ---------- Persistence ----------
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object" || typeof s.counts !== "object" || s.counts === null) return null;
    if (!STATES[s.region]) s.region = "US";
    if (s.price !== null && parsePrice(s.price) === null) s.price = null;
    if (!Array.isArray(s.unplugged)) s.unplugged = [];
    return s;
  } catch {
    return null;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, unplugged: [...unplugged] }));
  } catch {
    /* private mode or full storage: fine, the page still works */
  }
}

// ---------- Helpers ----------
function fmt(n, digits = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function money(n) {
  return "$" + fmt(n, n < 10 ? 2 : 0);
}
function currentPrice() {
  return state.price ?? priceFor(state.region);
}
function currentCo2() {
  return kgCo2PerKwhFor(state.region);
}
function compute() {
  return summarize(DEVICES, state.counts, currentPrice(), unplugged, currentCo2());
}
function rerender() {
  renderRooms();
  renderGrid();
  renderSummary();
}

// ---------- Region ----------
function renderRegion() {
  if (!regionSelect.options.length) {
    const codes = Object.keys(STATES).filter((c) => c !== "US").sort((a, b) => STATES[a].name.localeCompare(STATES[b].name));
    for (const code of ["US", ...codes]) {
      const o = document.createElement("option");
      o.value = code;
      o.textContent = STATES[code].name;
      regionSelect.appendChild(o);
    }
  }
  regionSelect.value = state.region;
  const s = STATES[state.region];
  $("#region-note").textContent = `${s.name}: ${fmt(s.price, 2)} ¢/kWh (EIA, July 2026), grid ${fmt(s.co2)} lb CO₂ per MWh (EPA eGRID 2023).`;
  priceInput.value = fmt(currentPrice(), 2).replace(/,/g, "");
  $("#price-reset").hidden = state.price === null;
}

regionSelect.addEventListener("change", () => {
  state.region = regionSelect.value;
  state.price = null;
  priceError.textContent = "";
  priceInput.removeAttribute("aria-invalid");
  save();
  renderRegion();
  renderSummary();
});

// ---------- Room tabs ----------
function renderRooms() {
  rooms.innerHTML = "";
  for (const r of ROOMS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "room" + (r.id === state.room ? " active" : "");
    b.setAttribute("aria-pressed", r.id === state.room);
    const n = DEVICES.filter((d) => d.room === r.id && state.counts[d.id] > 0).length;
    b.innerHTML = `<span>${r.emoji}</span> ${r.name}${n ? ` <b class="pill">${n}</b>` : ""}`;
    b.addEventListener("click", () => {
      state.room = r.id;
      save();
      renderRooms();
      renderGrid();
    });
    rooms.appendChild(b);
  }
}

// ---------- Device grid ----------
function renderGrid() {
  grid.innerHTML = "";
  for (const d of DEVICES.filter((x) => x.room === state.room)) {
    const count = state.counts[d.id] | 0;
    const card = document.createElement("div");
    card.className = "device" + (count ? " on" : "");
    card.innerHTML = `
      <div class="emoji" aria-hidden="true">${d.emoji}</div>
      <div class="body">
        <div class="name">${d.name}</div>
        <div class="meta">${fmt(d.w, d.w < 1 ? 2 : 1)} W idle · ${fmt(d.w * 8.76, 0)} kWh/yr each</div>
      </div>
      <div class="stepper" role="group" aria-label="How many ${d.name}">
        <button type="button" class="minus" aria-label="Remove one ${d.name}" ${count ? "" : "disabled"}>−</button>
        <output>${count}</output>
        <button type="button" class="plus" aria-label="Add one ${d.name}">+</button>
      </div>`;
    card.querySelector(".plus").addEventListener("click", () => setCount(d.id, count + 1));
    card.querySelector(".minus").addEventListener("click", () => setCount(d.id, count - 1));
    grid.appendChild(card);
  }
}

function setCount(id, n) {
  n = clampCount(n);
  if (n === 0) {
    delete state.counts[id];
    unplugged.delete(id);
  } else {
    state.counts[id] = n;
  }
  save();
  rerender();
}

// ---------- Summary ----------
const PALETTE = ["#c2410c", "#f59e0b", "#2f8f5b", "#0e7490", "#7c3aed", "#db2777", "#8a8f8a"];

function renderSummary() {
  const { rows, total, saved, possible } = compute();
  const empty = rows.length === 0;
  $("#empty").hidden = !empty;
  $("#results").hidden = empty;
  if (empty) return;

  $("#t-watts").textContent = fmt(total.watts, 1);
  $("#t-kwh").textContent = fmt(total.kwh);
  $("#t-cost").textContent = money(total.cost);
  $("#t-co2").textContent = fmt(total.co2);
  $("#t-miles").textContent = fmt(total.miles);

  const share = total.kwh > 0 ? possible.kwh / total.kwh : 0;
  $("#possible").textContent = `${money(possible.cost)} of that is unpluggable (${fmt(share * 100)}%).`;

  renderChart(rows);

  const bar = $("#saved-bar");
  bar.style.width = total.cost > 0 ? `${(saved.cost / total.cost) * 100}%` : "0%";
  $("#saved-text").textContent = unplugged.size
    ? `You'd save ${money(saved.cost)} and ${fmt(saved.co2)} kg CO₂ a year. That's ${fmt(saved.miles)} miles of driving.`
    : "Check a device below to see what unplugging it saves.";

  renderStrips(rows);
  renderList(rows);
  renderScale(saved, possible);
}

function renderChart(rows) {
  const parts = breakdown(rows);
  const bar = $("#chart");
  const legend = $("#legend");
  bar.innerHTML = "";
  legend.innerHTML = "";
  parts.forEach((p, i) => {
    const seg = document.createElement("div");
    seg.style.width = `${p.share * 100}%`;
    seg.style.background = PALETTE[i % PALETTE.length];
    seg.title = `${p.label}: ${money(p.cost)} per year`;
    bar.appendChild(seg);
    const li = document.createElement("li");
    li.innerHTML = `<i style="background:${PALETTE[i % PALETTE.length]}"></i>${p.emoji} ${p.label} <b>${fmt(p.share * 100)}%</b>`;
    legend.appendChild(li);
  });
}

function renderStrips(rows) {
  const strips = planStrips(rows);
  const box = $("#strips");
  const list = $("#strip-list");
  box.hidden = strips.length === 0;
  list.innerHTML = "";
  const roomName = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
  const stripName = { living: "TV & entertainment strip", office: "Desk strip" };
  for (const g of strips) {
    const li = document.createElement("li");
    const pay = Number.isFinite(g.paybackMonths) ? (g.paybackMonths < 1 ? "under a month" : `about ${fmt(g.paybackMonths)} month${g.paybackMonths >= 1.5 ? "s" : ""}`) : "never";
    li.innerHTML = `
      <div class="strip-head">
        <span>${roomName[g.room].emoji} ${stripName[g.room] ?? roomName[g.room].name + " strip"}</span>
        <b>${money(g.cost)}/yr</b>
      </div>
      <div class="strip-devs">${g.rows.map((r) => `${r.device.emoji} ${r.device.name}${r.count > 1 ? ` ×${r.count}` : ""}`).join(" · ")}</div>
      <div class="strip-pay">${g.rows.length} device${g.rows.length === 1 ? "" : "s"} on one switched strip. A $${FACTORS.smartStripCost} strip pays for itself in ${pay}, then saves ${fmt(g.co2)} kg CO₂ a year.</div>
      <button type="button" class="btn small">${g.allUnplugged ? "Added ✓" : "I'll do this strip"}</button>`;
    const btn = li.querySelector("button");
    btn.disabled = g.allUnplugged;
    btn.addEventListener("click", () => {
      for (const r of g.rows) unplugged.add(r.device.id);
      save();
      renderSummary();
    });
    list.appendChild(li);
  }
}

function renderList(rows) {
  const list = $("#list");
  list.innerHTML = "";
  rows.forEach((r, i) => {
    const li = document.createElement("li");
    li.className = "row" + (r.unplugged ? " done" : "") + (r.canUnplug ? "" : " keep");
    const label = r.device.plug === "strip" ? "Put on a switched power strip" : r.device.plug === "easy" ? "Unplug it" : "Leave it plugged in";
    li.innerHTML = `
      <label class="check">
        <input type="checkbox" ${r.unplugged ? "checked" : ""} ${r.canUnplug ? "" : "disabled"} aria-label="I'll unplug ${r.device.name}">
        <span class="rank">${i + 1}</span>
      </label>
      <div class="info">
        <div class="title">${r.device.emoji} ${r.device.name}${r.count > 1 ? ` <span class="x">×${r.count}</span>` : ""}</div>
        <div class="sub"><b>${label}.</b> ${r.device.tip}</div>
        <div class="src">Median of ${r.device.n} measured unit${r.device.n === 1 ? "" : "s"}, range ${fmt(r.device.min, 2)}–${fmt(r.device.max, 1)} W. <a href="https://standby.lbl.gov/standby-power-data-metering" target="_blank" rel="noopener">LBNL</a></div>
      </div>
      <div class="nums">
        <div class="cost">${money(r.cost)}<small>/yr</small></div>
        <div class="kwh">${fmt(r.kwh)} kWh · ${fmt(r.co2)} kg CO₂</div>
      </div>`;
    li.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) unplugged.add(r.device.id);
      else unplugged.delete(r.device.id);
      save();
      renderSummary();
    });
    list.appendChild(li);
  });
}

function renderScale(saved, possible) {
  const basis = unplugged.size ? saved : possible;
  const verb = unplugged.size ? "did what you just did" : "unplugged what you could";
  const s = scaleUp(basis.kwh, basis.co2);
  const box = $("#scale");
  box.hidden = basis.kwh <= 0;
  if (basis.kwh <= 0) return;
  $("#scale-text").innerHTML = `If 1 in 10 US households (${fmt(s.homes / 1e6, 1)} million homes) ${verb}, that's <b>${fmt(s.gwh)} GWh</b> a year and <b>${fmt(s.tons)} metric tons of CO₂</b>, the same as taking <b>${fmt(s.cars)} cars</b> off the road.`;
}

// ---------- Price ----------
priceInput.addEventListener("input", () => {
  const p = parsePrice(priceInput.value);
  if (p === null) {
    priceError.textContent = "Enter a price between 0 and 200 ¢/kWh.";
    priceInput.setAttribute("aria-invalid", "true");
    return;
  }
  priceError.textContent = "";
  priceInput.removeAttribute("aria-invalid");
  state.price = p;
  $("#price-reset").hidden = false;
  save();
  renderSummary();
});

$("#price-reset").addEventListener("click", () => {
  state.price = null;
  priceError.textContent = "";
  priceInput.removeAttribute("aria-invalid");
  save();
  renderRegion();
  renderSummary();
});

// ---------- Presets and bulk actions ----------
for (const btn of document.querySelectorAll("[data-preset]")) {
  const p = PRESETS[btn.dataset.preset];
  btn.innerHTML = `${p.emoji} ${p.name}`;
  btn.addEventListener("click", () => {
    state.counts = { ...p.counts };
    unplugged = new Set();
    save();
    rerender();
    $("#summary").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

$("#clear").addEventListener("click", () => {
  state.counts = {};
  unplugged = new Set();
  save();
  rerender();
});

$("#unplug-all").addEventListener("click", () => {
  for (const d of DEVICES) if (state.counts[d.id] > 0 && d.plug !== "keep") unplugged.add(d.id);
  save();
  renderSummary();
});

// ---------- Share card ----------
$("#share").addEventListener("click", async () => {
  const { rows, total, saved } = compute();
  const canvas = $("#card");
  await drawCard(canvas, { rows, total, saved, unpluggedCount: unplugged.size, region: STATES[state.region].name });
  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  const file = new File([blob], "unplug-card.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My standby bill", text: `My home leaks ${money(total.cost)} a year doing nothing. Find your energy vampires at unplug.` });
      return;
    } catch {
      /* user cancelled or share failed: fall through to download */
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "unplug-card.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $("#share-note").textContent = "Saved unplug-card.png. Post it, or text it to whoever pays the bill.";
});

// ---------- Offline ----------
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

renderRegion();
rerender();
