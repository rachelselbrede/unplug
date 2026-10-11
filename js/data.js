// Standby power per device, in watts.
// Source: Lawrence Berkeley National Laboratory, "Products That Use Standby Power"
// (List of Standby Products - StandbyTable.xlsx, Nov 2022), https://standby.lbl.gov/standby-power-data-metering
// `w` is the median across the measured units; `min`/`max` are the measured range; `n` is the number of data points.
// `plug` says what to do about it: "easy" = just unplug it, "strip" = put it on a switchable power strip,
// "keep" = it needs to stay on (safety or comfort), so don't unplug it.

export const ROOMS = [
  { id: "living", name: "Living room", emoji: "🛋️" },
  { id: "kitchen", name: "Kitchen", emoji: "🍳" },
  { id: "office", name: "Office", emoji: "💻" },
  { id: "bedroom", name: "Bedroom & bath", emoji: "🛏️" },
  { id: "home", name: "Whole home", emoji: "🏠" },
];

export const DEVICES = [
  // Living room
  { id: "settop", name: "Cable / satellite box", emoji: "📺", room: "living", w: 8, min: 0, max: 30, n: 21, plug: "strip", tip: "The biggest vampire in most homes. A DVR box keeps its drive spinning all night." },
  { id: "tv", name: "Television", emoji: "🖥️", room: "living", w: 0.95, min: 0, max: 23.8, n: 36, plug: "strip", tip: "New TVs are frugal, but 'quick start' modes can push standby above 20 W. Turn quick start off." },
  { id: "console", name: "Game console", emoji: "🎮", room: "living", w: 1.7, min: 0, max: 24.5, n: 21, plug: "strip", tip: "'Instant-on' mode can draw over 20 W all day. Switch to energy-saving mode in settings." },
  { id: "streaming", name: "Streaming stick / box", emoji: "📡", room: "living", w: 1.9, min: 0.7, max: 2.7, n: 6, plug: "strip", tip: "Never truly off. Fine on the same strip as the TV." },
  { id: "dvd", name: "DVD / Blu-ray player", emoji: "💿", room: "living", w: 1.8, min: 0, max: 13, n: 14, plug: "easy", tip: "If you only use it on movie night, unplug it the rest of the time." },
  { id: "soundbar", name: "Home theater speakers", emoji: "🔊", room: "living", w: 3, min: 0, max: 12, n: 9, plug: "strip", tip: "Soundbars and receivers idle waiting for a signal. Same strip as the TV." },
  { id: "wireless", name: "Wireless speaker", emoji: "🎵", room: "living", w: 2.8, min: 0.45, max: 6.92, n: 13, plug: "easy", tip: "Always listening for a connection. Unplug when you're away." },
  { id: "stereo", name: "Stereo", emoji: "📻", room: "living", w: 4, min: 0, max: 27, n: 11, plug: "easy", tip: "Older stereos are some of the hungriest idle devices measured." },
  { id: "ac", name: "Window air conditioner", emoji: "❄️", room: "living", w: 4, min: 0.58, max: 10, n: 11, plug: "easy", tip: "Unplug it for the whole off-season." },
  { id: "fan", name: "Fan", emoji: "🌀", room: "living", w: 0.22, min: 0, max: 0.56, n: 5, plug: "easy", tip: "Tiny draw, but zero is still better over a winter." },

  // Kitchen
  { id: "microwave", name: "Microwave", emoji: "🍿", room: "kitchen", w: 1.5, min: 0, max: 7, n: 13, plug: "easy", tip: "The clock costs more than the cooking for most people. Unplug if the outlet is reachable." },
  { id: "coffee", name: "Coffee maker", emoji: "☕", room: "kitchen", w: 0.95, min: 0, max: 5.4, n: 9, plug: "easy", tip: "Models with a clock or 'keep warm' draw the most." },
  { id: "toaster", name: "Toaster / toaster oven", emoji: "🍞", room: "kitchen", w: 2, min: 0, max: 8, n: 5, plug: "easy", tip: "Digital toaster ovens idle at a surprising 2 W or more." },
  { id: "kettle", name: "Electric kettle", emoji: "🫖", room: "kitchen", w: 1.31, min: 0, max: 4, n: 10, plug: "easy", tip: "Smart kettles with app control draw the most." },
  { id: "rice", name: "Rice cooker", emoji: "🍚", room: "kitchen", w: 3.7, min: 2, max: 8, n: 7, plug: "easy", tip: "Every unit measured drew at least 2 W doing nothing." },
  { id: "range", name: "Cooking range", emoji: "🔥", room: "kitchen", w: 3.1, min: 0.6, max: 6, n: 6, plug: "keep", tip: "Hardwired. Not worth fighting, but good to know it's there." },
  { id: "dishwasher", name: "Dishwasher", emoji: "🍽️", room: "kitchen", w: 2, min: 1, max: 3, n: 7, plug: "keep", tip: "Usually hardwired or behind cabinets. Skip it." },

  // Office
  { id: "desktop", name: "Desktop computer", emoji: "🖥️", room: "office", w: 2.7, min: 0, max: 15, n: 17, plug: "strip", tip: "Shut down fully, then switch off the strip. Sleep mode is not off." },
  { id: "laptop", name: "Laptop (charger plugged in)", emoji: "💻", room: "office", w: 1.6, min: 0, max: 20, n: 13, plug: "easy", tip: "A charger left in the wall keeps sipping even with the laptop gone." },
  { id: "monitor", name: "Monitor", emoji: "🖼️", room: "office", w: 0.6, min: 0, max: 17.8, n: 15, plug: "strip", tip: "Same strip as the computer." },
  { id: "printer", name: "Printer", emoji: "🖨️", room: "office", w: 2.61, min: 0, max: 9.1, n: 15, plug: "easy", tip: "Printers idle for weeks between jobs. Unplug and it will still print when you need it." },
  { id: "speakers", name: "Computer speakers", emoji: "🔉", room: "office", w: 2.25, min: 1.3, max: 4.2, n: 6, plug: "strip", tip: "Every unit measured drew over 1 W idle." },
  { id: "router", name: "Router / modem", emoji: "🌐", room: "office", w: 3.32, min: 0, max: 8, n: 13, plug: "keep", tip: "Your Wi-Fi needs it. Leave it on, but it counts." },
  { id: "ups", name: "Battery backup (UPS)", emoji: "🔋", room: "office", w: 25.49, min: 24.98, max: 26, n: 2, plug: "keep", tip: "Shockingly thirsty at idle. If you don't need it anymore, retire it." },
  { id: "projector", name: "Projector", emoji: "📽️", room: "office", w: 0.82, min: 0.4, max: 1.24, n: 2, plug: "easy", tip: "Low draw, easy win." },

  // Bedroom & bath
  { id: "phonecharger", name: "Phone / tablet charger (empty)", emoji: "🔌", room: "bedroom", w: 0.52, min: 0.01, max: 1.9, n: 9, plug: "easy", tip: "An empty charger in the wall still draws power. Pull it when the phone comes off." },
  { id: "phone", name: "Cordless phone", emoji: "☎️", room: "bedroom", w: 0.5, min: 0, max: 6, n: 7, plug: "keep", tip: "Needs to stay on to ring." },
  { id: "radio", name: "Clock radio", emoji: "⏰", room: "bedroom", w: 2, min: 0, max: 5, n: 5, plug: "easy", tip: "If your phone is your alarm, this one can go." },
  { id: "humidifier", name: "Humidifier", emoji: "💧", room: "bedroom", w: 1.2, min: 0.41, max: 3.5, n: 3, plug: "easy", tip: "Unplug outside the dry season." },
  { id: "purifier", name: "Air purifier", emoji: "🍃", room: "bedroom", w: 0.7, min: 0.21, max: 1.51, n: 5, plug: "easy", tip: "Small draw. Unplug when you travel." },
  { id: "bidet", name: "Electric bidet seat", emoji: "🚽", room: "bedroom", w: 2.15, min: 1.1, max: 3.3, n: 4, plug: "keep", tip: "Heated seats idle around 2 W. Use its eco mode." },
  { id: "robovac", name: "Robot vacuum dock", emoji: "🤖", room: "bedroom", w: 0.29, min: 0.12, max: 3, n: 4, plug: "keep", tip: "Low draw and it needs to charge. Leave it." },
  { id: "ebike", name: "E-bike / scooter charger (empty)", emoji: "🛴", room: "bedroom", w: 0.47, min: 0.29, max: 1.17, n: 4, plug: "easy", tip: "Unplug the brick when the battery is off it." },

  // Whole home
  { id: "washer", name: "Washing machine", emoji: "🧺", room: "home", w: 2.35, min: 0.89, max: 8, n: 10, plug: "easy", tip: "Many have a reachable plug. Unplug between loads if it's easy." },
  { id: "dryer", name: "Dryer", emoji: "👕", room: "home", w: 2.46, min: 2, max: 2.6, n: 3, plug: "keep", tip: "Usually on a dedicated outlet behind the machine. Skip it." },
  { id: "waterheater", name: "Water heater (controls)", emoji: "🚿", room: "home", w: 7.8, min: 4, max: 12, n: 3, plug: "keep", tip: "The controls idle at nearly 8 W. Leave it on; just know it counts." },
  { id: "furnace", name: "Furnace (controls)", emoji: "🌡️", room: "home", w: 4, min: 1, max: 6.7, n: 4, plug: "keep", tip: "Needs to stay on. Counted so your total is honest." },
  { id: "camera", name: "Security camera", emoji: "📷", room: "home", w: 3.5, min: 1.84, max: 9.4, n: 17, plug: "keep", tip: "Keep it, but every camera is about 30 kWh a year." },
  { id: "security", name: "Security system", emoji: "🚨", room: "home", w: 6.57, min: 1.8, max: 8.2, n: 3, plug: "keep", tip: "Stays on. Counted for honesty." },
  { id: "hub", name: "Smart home hub", emoji: "🏡", room: "home", w: 1.44, min: 0.17, max: 7.36, n: 8, plug: "keep", tip: "Runs your smart devices. Leave it." },
  { id: "smartbulb", name: "Smart bulb (off)", emoji: "💡", room: "home", w: 0.4, min: 0.09, max: 1.12, n: 32, plug: "keep", tip: "Each bulb listens for commands even when 'off'. Ten bulbs is 35 kWh a year." },
  { id: "smartplug", name: "Smart plug", emoji: "🔌", room: "home", w: 0.25, min: 0.16, max: 1.43, n: 5, plug: "keep", tip: "Tiny, and it can switch off bigger vampires for you." },
  { id: "doorbell", name: "Video doorbell", emoji: "🔔", room: "home", w: 1.88, min: 1.88, max: 1.88, n: 1, plug: "keep", tip: "Stays on." },
  { id: "smoke", name: "Smoke / CO alarm (wired)", emoji: "🧯", room: "home", w: 0.74, min: 0.31, max: 1.23, n: 17, plug: "keep", tip: "Never unplug this one." },
  { id: "battcharger", name: "Battery charger (empty)", emoji: "🔋", room: "home", w: 0.44, min: 0.21, max: 2.36, n: 12, plug: "easy", tip: "Tool and camera chargers left on the bench." },
];

// Conversion factors with sources.
export const FACTORS = {
  // US average residential electricity price, July 2026, cents per kWh.
  // Source: EIA Electric Power Monthly, Table 5.6.A, https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a
  priceCentsPerKwh: 18.31,
  // US national average CO2 output emission rate, eGRID 2023: 767.209 lb/MWh = 0.348 kg/kWh.
  // Source: EPA eGRID summary data, https://www.epa.gov/egrid/summary-data
  kgCo2PerKwh: 0.348,
  // A typical passenger vehicle emits about 400 grams of CO2 per mile.
  // Source: EPA, "Greenhouse Gas Emissions from a Typical Passenger Vehicle",
  // https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle
  kgCo2PerMile: 0.4,
  hoursPerYear: 8760,
};

// A quick-fill preset for the demo: a typical apartment.
export const TYPICAL_HOME = {
  settop: 1, tv: 1, console: 1, streaming: 1, soundbar: 1,
  microwave: 1, coffee: 1, toaster: 1,
  desktop: 1, monitor: 1, printer: 1, router: 1, laptop: 1,
  phonecharger: 2, radio: 1,
  washer: 1, dryer: 1, smartbulb: 4, smoke: 2,
};
