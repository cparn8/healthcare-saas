// repeatIsolate.ts
function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function formatYMDLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateRepeats(
  startDateStr: string,
  repeatDays: string[],
  intervalWeeks: number,
  maxOccurrences: number
): string[] {
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const targetDays = repeatDays.map((d) => dayMap[d]);
  const startDate = parseLocalDate(startDateStr);
  const generated: string[] = [];

  console.log("Start date", startDate, "Start weekday", startDate.getDay());

  for (let count = 0; count < maxOccurrences - 1; count++) {
    const base = new Date(startDate);
    base.setDate(startDate.getDate() + 7 * intervalWeeks * count);
    console.log("Week base", count, "→", base.toDateString());

    for (const targetDow of targetDays) {
      const next = new Date(base);
      const baseDow = next.getDay();
      let diff = targetDow - baseDow;
      if (diff <= 0) diff += 7;
      next.setDate(base.getDate() + diff);
      console.log(
        `   Checking target ${targetDow}: baseDow=${baseDow}, diff=${diff}, => ${next.toDateString()}`
      );
      if (next > startDate) generated.push(formatYMDLocal(next));
    }
  }
  return Array.from(new Set(generated)).sort();
}

// Run test cases
const test1 = generateRepeats("2025-11-10", ["Mon"], 1, 4);
console.log("Test 1 →", test1);
const test2 = generateRepeats("2025-11-10", ["Tue", "Thu"], 2, 3);
console.log("Test 2 →", test2);
