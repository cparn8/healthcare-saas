// frontend/dateDriftTest.ts
export function parseLocalDate(ymd: string): Date {
  if (!ymd) return new Date(NaN);
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function testDrift(label: string, ymd: string) {
  const local = parseLocalDate(ymd);
  const naive = new Date(ymd); // what React components usually do
  console.log(`\n📅 ${label}`);
  console.log("parseLocalDate →", local.toString());
  console.log("new Date()     →", naive.toString());
  console.log("getDay()       →", naive.getDay(), "(0=Sun)");
  console.log("TZ =", Intl.DateTimeFormat().resolvedOptions().timeZone);
}

testDrift("Expected Monday", "2025-11-17");
