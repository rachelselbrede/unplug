import { test } from "node:test";
import assert from "node:assert/strict";
import { DEVICES, ROOMS, FACTORS } from "../js/data.js";
import { yearlyKwh, yearlyCost, yearlyCo2Kg, milesEquivalent, summarize, parsePrice, clampCount } from "../js/logic.js";

test("1 W all year is 8.76 kWh", () => {
  assert.equal(yearlyKwh(1), 8.76);
  assert.equal(yearlyKwh(1, 2), 17.52);
});

test("cost and CO2 follow the published factors", () => {
  assert.ok(Math.abs(yearlyCost(100, 18.31) - 18.31) < 1e-9);
  assert.ok(Math.abs(yearlyCo2Kg(100) - 34.8) < 1e-9);
  assert.ok(Math.abs(milesEquivalent(40) - 100) < 1e-9);
});

test("CO2 factor matches eGRID 2023 (767.209 lb/MWh)", () => {
  const kgPerLb = 0.45359237;
  assert.ok(Math.abs(FACTORS.kgCo2PerKwh - (767.209 * kgPerLb) / 1000) < 0.001);
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

test("devices with zero count are skipped", () => {
  const { rows } = summarize(DEVICES, { tv: 0, settop: 1 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].device.id, "settop");
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
