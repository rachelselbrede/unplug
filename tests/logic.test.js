import { test } from "node:test";
import assert from "node:assert/strict";
import { DEVICES, ROOMS, FACTORS, PRESETS } from "../js/data.js";
import { STATES, kgCo2PerKwhFor, priceFor } from "../js/states.js";
import { yearlyKwh, yearlyCost, yearlyCo2Kg, milesEquivalent, summarize, planStrips, scaleUp, breakdown, parsePrice, clampCount } from "../js/logic.js";

test("1 W all year is 8.76 kWh", () => {
  assert.equal(yearlyKwh(1), 8.76);
  assert.equal(yearlyKwh(1, 2), 17.52);
});

test("cost and CO2 follow the published factors", () => {
  assert.ok(Math.abs(yearlyCost(100, 18.31) - 18.31) < 1e-9);
  assert.ok(Math.abs(yearlyCo2Kg(100) - 34.8) < 1e-9);
  assert.ok(Math.abs(yearlyCo2Kg(100, 0.5) - 50) < 1e-9);
  assert.ok(Math.abs(milesEquivalent(40) - 100) < 1e-9);
});

test("CO2 factor matches eGRID 2023 (767.209 lb/MWh)", () => {
  const kgPerLb = 0.45359237;
  assert.ok(Math.abs(FACTORS.kgCo2PerKwh - (767.209 * kgPerLb) / 1000) < 0.001);
  assert.ok(Math.abs(kgCo2PerKwhFor("US") - FACTORS.kgCo2PerKwh) < 0.001);
});

test("every state has a price and a grid factor", () => {
  const codes = Object.keys(STATES);
  assert.equal(codes.length, 52, "50 states + DC + US average");
  for (const c of codes) {
    const s = STATES[c];
    assert.ok(s.name, `${c} has no name`);
    assert.ok(s.price > 5 && s.price < 60, `${c} price looks wrong: ${s.price}`);
    assert.ok(s.co2 > 0 && s.co2 < 2500, `${c} co2 looks wrong: ${s.co2}`);
  }
  assert.equal(priceFor("TX"), 15.88);
  assert.equal(priceFor("nope"), STATES.US.price);
  assert.ok(kgCo2PerKwhFor("VT") < kgCo2PerKwhFor("WV"));
});

test("summarize ranks unpluggable devices first, then by watts", () => {
  const devices = [
    { id: "a", w: 10, plug: "easy" },
    { id: "b", w: 50, plug: "keep" },
    { id: "c", w: 5, plug: "strip" },
  ];
  const { rows, total, saved, possible } = summarize(devices, { a: 1, b: 2, c: 1 }, 10, new Set(["c"]));
  assert.deepEqual(rows.map((r) => r.device.id), ["a", "c", "b"]);
  assert.equal(total.watts, 115);
  assert.equal(possible.watts, 15);
  assert.equal(saved.watts, 5);
  assert.equal(rows[2].canUnplug, false);
  assert.ok(Math.abs(total.cost - (115 * 8.76 * 10) / 100) < 1e-9);
});

test("summarize uses the state CO2 factor when given", () => {
  const devices = [{ id: "a", w: 100, plug: "easy" }];
  const base = summarize(devices, { a: 1 }, 10, new Set(), 0.348);
  const dirty = summarize(devices, { a: 1 }, 10, new Set(), 0.886);
  assert.ok(dirty.total.co2 > base.total.co2 * 2.5);
  assert.equal(dirty.total.kwh, base.total.kwh);
});

test("devices with zero count are skipped", () => {
  const { rows } = summarize(DEVICES, { tv: 0, settop: 1 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].device.id, "settop");
});

test("strip planner groups strip devices by room with payback", () => {
  const devices = [
    { id: "tv", w: 5, plug: "strip", room: "living" },
    { id: "box", w: 10, plug: "strip", room: "living" },
    { id: "pc", w: 3, plug: "strip", room: "office" },
    { id: "lamp", w: 1, plug: "easy", room: "office" },
    { id: "alarm", w: 1, plug: "keep", room: "home" },
  ];
  const { rows } = summarize(devices, { tv: 1, box: 1, pc: 1, lamp: 1, alarm: 1 }, 20, new Set(["tv", "box"]));
  const strips = planStrips(rows, 24);
  assert.deepEqual(strips.map((s) => s.room), ["living", "office"]);
  assert.equal(strips[0].rows.length, 2);
  assert.equal(strips[0].watts, 15);
  assert.equal(strips[0].allUnplugged, true);
  assert.equal(strips[1].allUnplugged, false);
  // 15 W → 131.4 kWh → $26.28/yr at 20¢ → $24 strip pays back in ~11 months
  assert.ok(Math.abs(strips[0].paybackMonths - 24 / (26.28 / 12)) < 1e-9);
});

test("scale-up math", () => {
  const s = scaleUp(100, 34.8, 0.1, 133e6);
  assert.equal(s.homes, 13.3e6);
  assert.ok(Math.abs(s.gwh - 1330) < 1e-6);
  assert.ok(Math.abs(s.tons - 462840) < 1e-3);
  assert.ok(Math.abs(s.cars - 462840 / 4.6) < 1e-3);
});

test("breakdown keeps the top N and lumps the rest", () => {
  const devices = Array.from({ length: 9 }, (_, i) => ({ id: "d" + i, w: i + 1, plug: "easy", name: "D" + i, emoji: "x" }));
  const counts = Object.fromEntries(devices.map((d) => [d.id, 1]));
  const { rows } = summarize(devices, counts, 10);
  const parts = breakdown(rows, 6);
  assert.equal(parts.length, 7);
  assert.equal(parts[0].label, "D8");
  assert.equal(parts[6].label, "Everything else");
  assert.ok(Math.abs(parts.reduce((s, p) => s + p.share, 0) - 1) < 1e-9);
  assert.deepEqual(breakdown([]), []);
});

test("price parsing rejects garbage", () => {
  assert.equal(parsePrice("18.31"), 18.31);
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice("-3"), null);
  assert.equal(parsePrice("0"), null);
  assert.equal(parsePrice("999"), null);
});

test("counts clamp to 0..20", () => {
  assert.equal(clampCount(-1), 0);
  assert.equal(clampCount(3.7), 3);
  assert.equal(clampCount(99), 20);
  assert.equal(clampCount("x"), 0);
});

test("every device has sane, sourced data", () => {
  const roomIds = new Set(ROOMS.map((r) => r.id));
  const ids = new Set();
  for (const d of DEVICES) {
    assert.ok(!ids.has(d.id), `duplicate id ${d.id}`);
    ids.add(d.id);
    assert.ok(roomIds.has(d.room), `${d.id} has unknown room ${d.room}`);
    assert.ok(d.w > 0, `${d.id} has no standby watts`);
    assert.ok(d.min <= d.w && d.w <= d.max, `${d.id} median outside its range`);
    assert.ok(Number.isInteger(d.n) && d.n >= 1, `${d.id} has no data points`);
    assert.ok(["easy", "strip", "keep"].includes(d.plug), `${d.id} has bad plug advice`);
    assert.ok(d.tip && d.name && d.emoji, `${d.id} is missing text`);
  }
});

test("every preset only names real devices", () => {
  const ids = new Set(DEVICES.map((d) => d.id));
  for (const [key, p] of Object.entries(PRESETS)) {
    assert.ok(p.name && p.emoji, `${key} preset is missing text`);
    for (const [id, n] of Object.entries(p.counts)) {
      assert.ok(ids.has(id), `${key} preset names unknown device ${id}`);
      assert.ok(Number.isInteger(n) && n > 0 && n <= 20, `${key} preset has bad count for ${id}`);
    }
  }
});
