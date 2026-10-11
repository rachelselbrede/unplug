# 🔌 Unplug

Find the energy vampires in your home. Tap the devices you leave plugged in, and see what their standby power costs you in dollars and CO₂ every year, using real measured numbers. Then check off what you'll unplug and watch the savings add up.

Built in one evening for **CodeRED: Orion** (October 10–11, 2026), aimed at the Best Environment Hack track. Nothing you enter leaves your browser.

**Try it:** https://rachelselbrede.github.io/unplug/ · **Code:** https://github.com/rachelselbrede/unplug

## What it does

- **Pick what's plugged in.** Devices are grouped by room. Tap + for each one you own, or start from a **Dorm room**, **Apartment**, or **Family house** preset.
- **Your state, your numbers.** Pick where you live and the price and grid CO₂ switch to your state's EIA price and eGRID emission rate. The price stays editable.
- **See the real cost.** Total idle watts, kWh per year, dollars per year, kg of CO₂, the same CO₂ as miles of driving, and a breakdown bar of who's eating the bill.
- **Know what to do.** Every device is ranked, with the ones you can act on first, and labeled **Unplug it**, **Put on a switched power strip**, or **Leave it plugged in** (smoke alarms, routers, and hardwired appliances stay on, but still count so your total is honest).
- **Power strip plan.** Strip-friendly devices are grouped by room into concrete strips, with how many months a $25 strip takes to pay for itself.
- **Check it off.** Tick the devices you'll unplug and see exactly what you'd save. **Unplug everything I can** does it all at once.
- **If everyone did this.** Your savings scaled to 1 in 10 US households, in GWh, metric tons of CO₂, and cars off the road.
- **Share my card.** Renders a PNG summary card you can post or text to whoever pays the bill.
- **Works offline.** Installable as a web app, with a service worker so it keeps working without a connection.
- **Shows its work.** Each device shows the measured range and how many units were tested, with a link to the source.

## Run it

No build step and nothing to install. Serve the folder, then open the page:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening `index.html` directly won't work, because browsers block JavaScript modules on `file://`.

## Test it

```bash
npm test
```

Uses Node's built-in test runner and installs nothing. Covers the kWh, cost, CO₂ and miles math, the ranking, price validation, and a check that every device has a positive standby value inside its measured range, a room, advice, and a data-point count.

## Where the numbers come from

| Number | Value | Source |
|---|---|---|
| Standby watts per device | Median of measured units | [LBNL, Products That Use Standby Power](https://standby.lbl.gov/standby-power-data-metering) (StandbyTable.xlsx, Nov 2022) |
| Yearly kWh | watts × 8,760 h ÷ 1,000 | Assumes the device idles all year, so it's an upper bound for things you use a lot |
| Electricity price | 18.31 ¢/kWh (US residential average, July 2026) | [EIA Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a) |
| CO₂ per kWh | 767.209 lb/MWh = 0.348 kg/kWh (US average, eGRID 2023) | [EPA eGRID summary data](https://www.epa.gov/egrid/summary-data) |
| CO₂ per mile | ~400 g per mile, typical passenger vehicle | [EPA](https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle) |

The per-device advice ("unplug", "power strip", "leave it") is editorial, based on whether the device needs to stay on for safety or connectivity and whether its plug is usually reachable.

## Files

- `index.html`, `styles.css` — the page and its look (light and dark, phone-friendly, reduced-motion aware)
- `js/data.js` — the device table with sources, the conversion factors, and the typical-home preset
- `js/logic.js` — pure math, no DOM
- `js/app.js` — rendering, interaction, and saving your picks in `localStorage`
- `tests/logic.test.js` — unit tests

## License

MIT
