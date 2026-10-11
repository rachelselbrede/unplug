// Pure math. No DOM here, so it can be tested with Node.
import { FACTORS } from "./data.js";

export function yearlyKwh(watts, count = 1) {
  return (watts * count * FACTORS.hoursPerYear) / 1000;
}

export function yearlyCost(kwh, priceCentsPerKwh = FACTORS.priceCentsPerKwh) {
  return (kwh * priceCentsPerKwh) / 100;
}

export function yearlyCo2Kg(kwh) {
  return kwh * FACTORS.kgCo2PerKwh;
}

export function milesEquivalent(co2Kg) {
  return co2Kg / FACTORS.kgCo2PerMile;
}

// counts: { deviceId: number }. Returns one row per selected device plus totals.
export function summarize(devices, counts, priceCentsPerKwh = FACTORS.priceCentsPerKwh, unplugged = new Set()) {
  const rows = [];
  for (const d of devices) {
    const count = counts[d.id] | 0;
    if (count <= 0) continue;
    const watts = d.w * count;
    const kwh = yearlyKwh(d.w, count);
    const cost = yearlyCost(kwh, priceCentsPerKwh);
    const co2 = yearlyCo2Kg(kwh);
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
