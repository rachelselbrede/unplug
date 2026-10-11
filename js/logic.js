// Pure math. No DOM here, so it can be tested with Node.
import { FACTORS } from "./data.js";

export function yearlyKwh(watts, count = 1) {
  return (watts * count * FACTORS.hoursPerYear) / 1000;
}

export function yearlyCost(kwh, priceCentsPerKwh = FACTORS.priceCentsPerKwh) {
  return (kwh * priceCentsPerKwh) / 100;
}

export function yearlyCo2Kg(kwh, kgCo2PerKwh = FACTORS.kgCo2PerKwh) {
  return kwh * kgCo2PerKwh;
}

export function milesEquivalent(co2Kg) {
  return co2Kg / FACTORS.kgCo2PerMile;
}

// counts: { deviceId: number }. Returns one row per selected device plus totals.
export function summarize(
  devices,
  counts,
  priceCentsPerKwh = FACTORS.priceCentsPerKwh,
  unplugged = new Set(),
  kgCo2PerKwh = FACTORS.kgCo2PerKwh,
) {
  const rows = [];
  for (const d of devices) {
    const count = counts[d.id] | 0;
    if (count <= 0) continue;
    const watts = d.w * count;
    const kwh = yearlyKwh(d.w, count);
    const cost = yearlyCost(kwh, priceCentsPerKwh);
    const co2 = yearlyCo2Kg(kwh, kgCo2PerKwh);
    rows.push({ device: d, count, watts, kwh, cost, co2, canUnplug: d.plug !== "keep", unplugged: unplugged.has(d.id) });
  }
  // Things you can unplug first, biggest first; things to leave on sink to the bottom.
  rows.sort((a, b) => Number(b.canUnplug) - Number(a.canUnplug) || b.watts - a.watts);

  const total = sum(rows);
  const saved = sum(rows.filter((r) => r.unplugged));
  const possible = sum(rows.filter((r) => r.canUnplug));
  return { rows, total, saved, possible };
}

function sum(rows) {
  const t = { watts: 0, kwh: 0, cost: 0, co2: 0 };
  for (const r of rows) {
    t.watts += r.watts;
    t.kwh += r.kwh;
    t.cost += r.cost;
    t.co2 += r.co2;
  }
  t.miles = milesEquivalent(t.co2);
  return t;
}

// Group the "put it on a power strip" devices by room into concrete strips,
// with how long a strip takes to pay for itself.
export function planStrips(rows, stripCost = FACTORS.smartStripCost) {
  const groups = new Map();
  for (const r of rows) {
    if (r.device.plug !== "strip") continue;
    const key = r.device.room;
    if (!groups.has(key)) groups.set(key, { room: key, rows: [], watts: 0, kwh: 0, cost: 0, co2: 0 });
    const g = groups.get(key);
    g.rows.push(r);
    g.watts += r.watts;
    g.kwh += r.kwh;
    g.cost += r.cost;
    g.co2 += r.co2;
  }
  const strips = [...groups.values()];
  for (const g of strips) {
    g.paybackMonths = g.cost > 0 ? stripCost / (g.cost / 12) : Infinity;
    g.allUnplugged = g.rows.every((r) => r.unplugged);
  }
  strips.sort((a, b) => b.cost - a.cost);
  return strips;
}

// What happens if a share of all US households saved the same kWh and CO2.
export function scaleUp(kwhPerHome, co2KgPerHome, share = FACTORS.scaleShare, households = FACTORS.usHouseholds) {
  const homes = households * share;
  const gwh = (kwhPerHome * homes) / 1e6;
  const tons = (co2KgPerHome * homes) / 1000;
  const cars = tons / FACTORS.tonsCo2PerCarYear;
  return { homes, gwh, tons, cars };
}

// Breakdown of cost by device for a chart: top N plus "everything else".
export function breakdown(rows, topN = 6) {
  const byCost = [...rows].sort((a, b) => b.cost - a.cost);
  const total = byCost.reduce((s, r) => s + r.cost, 0);
  if (total <= 0) return [];
  const top = byCost.slice(0, topN).map((r) => ({ label: r.device.name, emoji: r.device.emoji, cost: r.cost, share: r.cost / total }));
  const rest = byCost.slice(topN).reduce((s, r) => s + r.cost, 0);
  if (rest > 0) top.push({ label: "Everything else", emoji: "·", cost: rest, share: rest / total });
  return top;
}

// Validate a price typed by the user. Returns a number or null.
export function parsePrice(text) {
  const n = Number(String(text).trim());
  if (!Number.isFinite(n) || n <= 0 || n > 200) return null;
  return n;
}

export function clampCount(n) {
  n = Number(n) | 0;
  return Math.max(0, Math.min(20, n));
}
