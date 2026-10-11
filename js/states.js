// Per-state electricity price and grid carbon intensity.
// price: average residential retail price, cents per kWh, July 2026.
//   Source: EIA Electric Power Monthly, Table 5.6.A,
//   https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a
// co2: state output emission rate, lb CO2 per MWh, eGRID 2023 (rev. June 2025), Table 3.
//   Source: EPA eGRID summary tables, https://www.epa.gov/egrid/summary-data

export const STATES = {
  US: { name: "US average", price: 18.31, co2: 767.209 },
  AK: { name: "Alaska", price: 28.83, co2: 809.824 },
  AL: { name: "Alabama", price: 16.4, co2: 710.988 },
  AR: { name: "Arkansas", price: 14.33, co2: 993.413 },
  AZ: { name: "Arizona", price: 15.38, co2: 686.688 },
  CA: { name: "California", price: 33.61, co2: 393.486 },
  CO: { name: "Colorado", price: 17.0, co2: 1085.021 },
  CT: { name: "Connecticut", price: 24.16, co2: 538.266 },
  DC: { name: "District of Columbia", price: 25.21, co2: 394.099 },
  DE: { name: "Delaware", price: 18.48, co2: 703.194 },
  FL: { name: "Florida", price: 15.03, co2: 786.645 },
  GA: { name: "Georgia", price: 16.27, co2: 713.831 },
  HI: { name: "Hawaii", price: 48.0, co2: 1385.131 },
  IA: { name: "Iowa", price: 15.99, co2: 630.187 },
  ID: { name: "Idaho", price: 13.73, co2: 313.292 },
  IL: { name: "Illinois", price: 19.22, co2: 471.705 },
  IN: { name: "Indiana", price: 16.73, co2: 1457.19 },
  KS: { name: "Kansas", price: 15.27, co2: 728.16 },
  KY: { name: "Kentucky", price: 13.81, co2: 1735.009 },
  LA: { name: "Louisiana", price: 12.72, co2: 761.404 },
  MA: { name: "Massachusetts", price: 30.49, co2: 822.39 },
  MD: { name: "Maryland", price: 21.41, co2: 520.022 },
  ME: { name: "Maine", price: 32.41, co2: 311.824 },
  MI: { name: "Michigan", price: 23.05, co2: 793.171 },
  MN: { name: "Minnesota", price: 17.45, co2: 747.545 },
  MO: { name: "Missouri", price: 16.09, co2: 1444.137 },
  MS: { name: "Mississippi", price: 14.54, co2: 826.335 },
  MT: { name: "Montana", price: 14.99, co2: 1056.167 },
  NC: { name: "North Carolina", price: 15.16, co2: 623.958 },
  ND: { name: "North Dakota", price: 13.41, co2: 1288.364 },
  NE: { name: "Nebraska", price: 13.78, co2: 1018.154 },
  NH: { name: "New Hampshire", price: 26.6, co2: 272.854 },
  NJ: { name: "New Jersey", price: 25.19, co2: 468.31 },
  NM: { name: "New Mexico", price: 16.09, co2: 770.214 },
  NV: { name: "Nevada", price: 12.77, co2: 642.37 },
  NY: { name: "New York", price: 29.9, co2: 465.136 },
  OH: { name: "Ohio", price: 19.45, co2: 1063.843 },
  OK: { name: "Oklahoma", price: 14.35, co2: 647.207 },
  OR: { name: "Oregon", price: 15.97, co2: 364.162 },
  PA: { name: "Pennsylvania", price: 21.72, co2: 645.773 },
  RI: { name: "Rhode Island", price: 28.29, co2: 839.136 },
  SC: { name: "South Carolina", price: 15.47, co2: 557.173 },
  SD: { name: "South Dakota", price: 15.37, co2: 334.032 },
  TN: { name: "Tennessee", price: 13.71, co2: 657.267 },
  TX: { name: "Texas", price: 15.88, co2: 768.317 },
  UT: { name: "Utah", price: 13.12, co2: 1413.019 },
  VA: { name: "Virginia", price: 17.55, co2: 536.851 },
  VT: { name: "Vermont", price: 23.75, co2: 42.981 },
  WA: { name: "Washington", price: 14.71, co2: 265.119 },
  WI: { name: "Wisconsin", price: 19.06, co2: 1156.996 },
  WV: { name: "West Virginia", price: 15.78, co2: 1954.383 },
  WY: { name: "Wyoming", price: 14.36, co2: 1820.318 },
};

const KG_PER_LB = 0.45359237;

// kg CO2 per kWh for a state code; falls back to the US average.
export function kgCo2PerKwhFor(code) {
  const s = STATES[code] ?? STATES.US;
  return (s.co2 * KG_PER_LB) / 1000;
}

export function priceFor(code) {
  return (STATES[code] ?? STATES.US).price;
}
