// repeatTest.ts
import { safeDate, formatYMDLocal } from "./src/utils";
export {};
type RepeatConfig = {
  startDate: string;
  repeatDays: string[];
  intervalWeeks: number;
  maxOccurrences: number;
  endDate?: string;
};

function generateRepeatDates({
  startDate,
  repeatDays,
  intervalWeeks,
  maxOccurrences,
  endDate,
}: RepeatConfig): string[] {
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const start = safeDate(startDate);
  const targets = repeatDays.map((d) => dayMap[d]);
  const result: string[] = [];

  // Anchor to the Monday of the start date’s week instead of Sunday
  const baseWeekStart = new Date(start);
  const day = baseWeekStart.getDay(); // 0–6 (Sun–Sat)
  const diffToMonday = (day + 6) % 7; // shift Sunday→Monday base
  baseWeekStart.setDate(baseWeekStart.getDate() - diffToMonday);

  let weekOffset = 0;
  while (result.length < maxOccurrences - 1) {
    const blockStart = new Date(baseWeekStart);
    blockStart.setDate(
      baseWeekStart.getDate() + weekOffset * intervalWeeks * 7
    );

    for (let i = 0; i < 7 && result.length < maxOccurrences - 1; i++) {
      const next = new Date(blockStart);
      next.setDate(blockStart.getDate() + i);

      if (endDate && next > safeDate(endDate)) break;

      if (next > start && targets.includes(next.getDay())) {
        result.push(formatYMDLocal(next));
      }
    }

    weekOffset++;
  }

  return result;
}

function runTest(name: string, config: RepeatConfig, expected: string[]) {
  const result = generateRepeatDates(config);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(
    `${pass ? "✅" : "❌"} ${name}\n   → Expected: ${expected.join(
      ", "
    )}\n   → Got:      ${result.join(", ")}`
  );
}

// --- TEST CASES ---
runTest(
  "Weekly Mondays ×4",
  {
    startDate: "2025-11-10",
    repeatDays: ["Mon"],
    intervalWeeks: 1,
    maxOccurrences: 4,
  },
  ["2025-11-17", "2025-11-24", "2025-12-01"]
);

runTest(
  "Every 2 weeks Tue & Thu ×3",
  {
    startDate: "2025-11-04",
    repeatDays: ["Tue", "Thu"],
    intervalWeeks: 2,
    maxOccurrences: 4,
  },
  ["2025-11-06", "2025-11-18", "2025-11-20"]
);

console.log("\nAll tests complete.");
