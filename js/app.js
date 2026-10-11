import { DEVICES, ROOMS, FACTORS, TYPICAL_HOME } from "./data.js";
import { summarize, parsePrice, clampCount } from "./logic.js";

const STORAGE_KEY = "unplug.v1";

const state = load() ?? { counts: {}, unplugged: [], price: FACTORS.priceCentsPerKwh, room: "living" };
let unplugged = new Set(state.unplugged);

const $ = (sel) => document.querySelector(sel);
const rooms = $("#rooms");
const grid = $("#grid");
const priceInput = $("#price");
const priceError = $("#price-error");

priceInput.value = state.price;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object" || typeof s.counts !== "object") return null;
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

function fmt(n, digits = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function money(n) {
  return "$" + fmt(n, n < 10 ? 2 : 0);
}

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
  renderRooms();
  renderGrid();
  renderSummary();
}

// ---------- Summary ----------
function renderSummary() {
  const { rows, total, saved, possible } = summarize(DEVICES, state.counts, state.price, unplugged);
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

  const bar = $("#saved-bar");
  bar.style.width = total.cost > 0 ? `${(saved.cost / total.cost) * 100}%` : "0%";
  $("#saved-text").textContent = unplugged.size
    ? `You'd save ${money(saved.cost)} and ${fmt(saved.co2)} kg CO₂ a year. That's ${fmt(saved.miles)} miles of driving.`
    : "Check a device below to see what unplugging it saves.";

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

// ---------- Controls ----------
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
  save();
  renderSummary();
});

$("#fill").addEventListener("click", () => {
  state.counts = { ...TYPICAL_HOME };
  unplugged = new Set();
  save();
  renderRooms();
  renderGrid();
  renderSummary();
  $("#summary").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#clear").addEventListener("click", () => {
  state.counts = {};
  unplugged = new Set();
  save();
  renderRooms();
  renderGrid();
  renderSummary();
});

$("#unplug-all").addEventListener("click", () => {
  for (const d of DEVICES) if (state.counts[d.id] > 0 && d.plug !== "keep") unplugged.add(d.id);
  save();
  renderSummary();
});

renderRooms();
renderGrid();
renderSummary();
