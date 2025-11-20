// src/features/schedule/logic/appointmentRange.ts

export function getWeekRangeForApi(date: Date) {
  const start = new Date(date);
  const diff = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}
