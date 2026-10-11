# Devpost submission: Unplug

Paste these into the CodeRED: Orion submission form. Fields match the Devpost project page.

**Project name:** Unplug

**Tagline:** Find the energy vampires in your home.

**Track:** Best Environment Hack (also General / Best Overall)

**Try it out:** https://rachelselbrede.github.io/unplug/

**Repository:** https://github.com/rachelselbrede/unplug

**Built with:** HTML, CSS, JavaScript (ES modules), Node test runner, GitHub Pages

---

## Inspiration

Almost everything with a plug keeps drawing power when it's "off." Lawrence Berkeley National Laboratory estimates standby power is 5 to 10 percent of residential electricity use in the US, spread across dozens of devices that each look harmless. The problem is nobody can feel 8 watts. I wanted a tool that turns an invisible, always-on trickle into a number you can act on tonight: dollars, kilograms of CO₂, and a ranked list of what to unplug first.

## What it does

You tap the devices you leave plugged in, grouped by room, and Unplug shows what they cost you while doing nothing: total idle watts, kWh per year, dollars per year, kg of CO₂, and the same CO₂ as miles of driving. Every device is ranked by impact and labeled with what to do: unplug it, put it on a switched power strip, or leave it on (smoke alarms, routers, and hardwired appliances stay on but still count, so the total is honest). Check off what you'll unplug and the savings tally updates. The electricity price is editable so the dollars match your bill. Each device shows the measured range and how many units were tested, with a link to the source. Your picks are saved in your browser and never leave it.

## How we built it

Plain HTML, CSS, and JavaScript modules with no build step, hosted on GitHub Pages. The device table in `js/data.js` is the median standby draw per product from LBNL's Products That Use Standby Power dataset (November 2022), pulled from their published spreadsheet and kept with the min, max, and number of data points for every device. Cost uses the US average residential price from the EIA (18.31 ¢/kWh, July 2026). CO₂ uses the US grid average from EPA eGRID 2023 (767 lb/MWh), and the miles comparison uses the EPA's 400 g/mile figure for a typical passenger vehicle. The math lives in `js/logic.js` with no DOM so it can be unit-tested with Node's built-in test runner. The page works in light and dark mode, on a phone, and respects reduced-motion settings.

## Challenges we ran into

Getting trustworthy numbers. Most standby-power lists online are decade-old guesses copied from each other. The LBNL dataset is measured and recent, but it only ships as a spreadsheet behind a bot check, so I parsed the file in the browser to get the real medians and ranges. The other challenge was honesty: it's tempting to tell people to unplug everything, but a smoke alarm or a router should never go on a power strip. So each device carries advice, and the "unpluggable" share is separated from the total.

## Accomplishments that we're proud of

Every number on the page has a source you can click. The ranking puts things you can actually act on first. The whole thing is small enough to read in one sitting and has tests for the math and for the data itself (every device must have a positive standby value inside its measured range).

## What we learned

The cable box is the biggest vampire in most homes, and a UPS idles at over 25 watts. Modern TVs are frugal unless "quick start" is on. And a typical apartment leaks roughly $60 to $70 a year, which is a smart power strip paid for several times over.

## What's next for Unplug

Regional electricity prices and grid CO₂ factors by state, a "power strip planner" that groups devices by outlet, and a way to share your before-and-after as an image.
