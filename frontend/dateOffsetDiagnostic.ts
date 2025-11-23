import { parseLocalDate, formatYMDLocal } from "./src/utils";

console.log("TZ =", Intl.DateTimeFormat().resolvedOptions().timeZone);

const sample = "2025-11-17";
const native = new Date(sample);
const local = parseLocalDate(sample);

console.log("\nNative new Date('YYYY-MM-DD') =>", native.toString());
console.log("Local parseLocalDate('YYYY-MM-DD') =>", local.toString());

console.log("\nNative.getDay() =", native.getDay(), "(0=Sun)");
console.log("Local.getDay()  =", local.getDay(), "(0=Sun)");

console.log(
  "\nDiff (local - native) hours:",
  (local.getTime() - native.getTime()) / (1000 * 60 * 60)
);

console.log("\nFormatYMDLocal(native):", formatYMDLocal(native));
console.log("FormatYMDLocal(local):", formatYMDLocal(local));
