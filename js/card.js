// Draws a 1200×630 shareable summary card onto a canvas.

function fmt(n, digits = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function money(n) {
  return "$" + fmt(n, n < 10 ? 2 : 0);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawCard(canvas, { rows, total, saved, unpluggedCount, region }) {
  const W = 1200, H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  try {
    await document.fonts.load("700 64px Fredoka");
    await document.fonts.load("600 28px Nunito");
  } catch {
    /* fall back to system fonts */
  }
  const head = "Fredoka, system-ui, sans-serif";
  const body = "Nunito, system-ui, sans-serif";

  // Background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#fbf7ef");
  g.addColorStop(1, "#e2f3e8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = "#2f8f5b";
  ctx.font = `700 34px ${head}`;
  ctx.fillText("🔌 Unplug", 60, 80);
  ctx.fillStyle = "#1f2a1f";
  ctx.font = `600 44px ${head}`;
  ctx.fillText("My home's standby bill", 60, 140);
  ctx.fillStyle = "#5f6b5f";
  ctx.font = `600 24px ${body}`;
  ctx.fillText(`${rows.length} devices sipping power while "off" · ${region} prices and grid`, 60, 180);

  // Big number
  roundRect(ctx, 60, 215, 520, 200, 24);
  ctx.fillStyle = "#fdebd9";
  ctx.fill();
  ctx.fillStyle = "#c2410c";
  ctx.font = `700 96px ${head}`;
  ctx.fillText(money(total.cost), 90, 325);
  ctx.fillStyle = "#5f6b5f";
  ctx.font = `600 26px ${body}`;
  ctx.fillText("a year, doing nothing", 90, 370);
  ctx.fillText(`${fmt(total.kwh)} kWh · ${fmt(total.co2)} kg CO₂ · ${fmt(total.miles)} miles of driving`, 90, 400);

  // Top vampires
  ctx.fillStyle = "#1f2a1f";
  ctx.font = `600 30px ${head}`;
  ctx.fillText("Biggest vampires", 640, 250);
  ctx.font = `600 26px ${body}`;
  rows.slice(0, 4).forEach((r, i) => {
    const y = 300 + i * 42;
    ctx.fillStyle = "#1f2a1f";
    ctx.fillText(`${i + 1}. ${r.device.emoji} ${r.device.name}${r.count > 1 ? ` ×${r.count}` : ""}`, 640, y);
    ctx.fillStyle = "#c2410c";
    ctx.textAlign = "right";
    ctx.fillText(`${money(r.cost)}/yr`, 1140, y);
    ctx.textAlign = "left";
  });

  // Savings banner
  roundRect(ctx, 60, 450, 1080, 110, 24);
  ctx.fillStyle = unpluggedCount ? "#2f8f5b" : "#ffffff";
  ctx.fill();
  ctx.fillStyle = unpluggedCount ? "#ffffff" : "#1f2a1f";
  ctx.font = `600 36px ${head}`;
  const line = unpluggedCount
    ? `I'm unplugging ${unpluggedCount} thing${unpluggedCount === 1 ? "" : "s"} to save ${money(saved.cost)} and ${fmt(saved.co2)} kg CO₂ a year.`
    : "Find yours. Most homes can cut this by more than half.";
  ctx.fillText(line, 90, 517);

  // Footer
  ctx.fillStyle = "#5f6b5f";
  ctx.font = `600 22px ${body}`;
  ctx.fillText("rachelselbrede.github.io/unplug · measured data from LBNL, prices from EIA, grid CO₂ from EPA eGRID", 60, 600);
}
