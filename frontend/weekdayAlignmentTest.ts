import { DAY_MAP, WEEKDAY_ORDER } from "./src/utils/weekdays.js";

const base = new Date("2025-11-10T00:00:00-06:00"); // Monday CST
console.log("📆 Base date:", base.toString(), "getDay() =", base.getDay());

for (const name of WEEKDAY_ORDER) {
  console.log(`${name}:`, DAY_MAP[name]);
}
