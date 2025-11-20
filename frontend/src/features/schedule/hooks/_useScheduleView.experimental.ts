// src/features/schedule/hooks/useScheduleView.ts
// import { useState, useRef, useEffect, useMemo } from "react";
// import { useSearchParams } from "react-router-dom";
// import { addDays, startOfWeek } from "date-fns";
// import {
//   parseLocalDate,
//   formatShortDate,
//   formatYMDLocal,
//   safeDate,
// } from "../../../utils/dateUtils";

// import { ScheduleSettings } from "../types/scheduleSettings";

// type TabKey = "appointments" | "day" | "week" | "settings";

// export interface UseScheduleViewOptions {
//   scheduleSettings: ScheduleSettings | null;
//   defaultOffice: string;
// }

// export function useScheduleView({
//   scheduleSettings,
//   defaultOffice,
// }: UseScheduleViewOptions) {
//   /* ---------------------------- URL Sync (tab) ---------------------------- */

//   const [searchParams, setSearchParams] = useSearchParams();

//   const [activeTab, setActiveTab] = useState<TabKey>(
//     (searchParams.get("tab") as TabKey) || "day"
//   );

//   const changeTab = (tab: TabKey) => {
//     setActiveTab(tab);
//     const next = new URLSearchParams(searchParams);
//     next.set("tab", tab);
//     setSearchParams(next, { replace: true });
//   };

//   /* ------------------------------- Date State ------------------------------ */

//   const [cursorDate, setCursorDate] = useState<Date>(
//     safeDate(formatYMDLocal(new Date()))
//   );

//   const goPrev = () => {
//     if (activeTab === "week") {
//       setCursorDate((prev) => addDays(prev, -7));
//     } else {
//       setCursorDate((prev) =>
//         findNextOpenDay(prev, -1, scheduleSettings, defaultOffice)
//       );
//     }
//   };

//   const goNext = () => {
//     if (activeTab === "week") {
//       setCursorDate((prev) => addDays(prev, 7));
//     } else {
//       setCursorDate((prev) =>
//         findNextOpenDay(prev, 1, scheduleSettings, defaultOffice)
//       );
//     }
//   };

//   /* ------------------------------- Slot Size ------------------------------ */

//   const [slotSize, setSlotSize] = useState<15 | 30 | 60>(30);

//   /* ------------------------------ Calendar UI ----------------------------- */

//   const [showCalendar, setShowCalendar] = useState(false);
//   const calendarWrapperRef = useRef<HTMLDivElement | null>(null);
//   const datePickerRef = useRef<HTMLInputElement | null>(null);

//   const toggleCalendar = () => setShowCalendar((prev) => !prev);

//   const handleCalendarSelect = (value: string) => {
//     if (!value) return;

//     const selected = new Date(value + "T00:00");

//     if (activeTab === "week") {
//       const diff = (selected.getDay() + 6) % 7;
//       const monday = new Date(selected);
//       monday.setDate(selected.getDate() - diff);
//       setCursorDate(monday);
//     } else {
//       setCursorDate(selected);
//     }

//     setShowCalendar(false);
//   };

//   /* Outside click close */
//   useEffect(() => {
//     function handleClick(e: MouseEvent) {
//       if (!calendarWrapperRef.current) return;
//       if (!calendarWrapperRef.current.contains(e.target as Node)) {
//         setShowCalendar(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   /* ------------------------------ Filters Sidebar ------------------------------ */

//   const [showFilters, setShowFilters] = useState(false);

//   /* ------------------------------ Office Dropdown ------------------------------ */

//   const [selectedOffices, setSelectedOffices] = useState<string[]>([
//     defaultOffice,
//   ]);

//   /* Ensure primary office = first selection */
//   useEffect(() => {
//     if (selectedOffices.length === 0) return;
//   }, [selectedOffices]);

//   /* ------------------------------ Derived Labels ------------------------------ */

//   const leftLabel = useMemo(() => {
//     if (activeTab === "week") {
//       const start = startOfWeek(cursorDate, { weekStartsOn: 1 });
//       const end = addDays(start, 4);

//       const sameMonth = start.getMonth() === end.getMonth();

//       const startFmt = new Intl.DateTimeFormat("en-US", {
//         month: "short",
//         day: "numeric",
//       }).format(start);

//       const endFmt = new Intl.DateTimeFormat("en-US", {
//         month: sameMonth ? undefined : "short",
//         day: "numeric",
//       }).format(end);

//       return `${startFmt} – ${endFmt}`;
//     }

//     return formatShortDate(cursorDate);
//   }, [activeTab, cursorDate]);

//   /* --------------------------------- OUTPUT --------------------------------- */

//   return {
//     activeTab,
//     changeTab,

//     cursorDate,
//     setCursorDate,
//     goPrev,
//     goNext,

//     slotSize,
//     setSlotSize,

//     showCalendar,
//     toggleCalendar,
//     handleCalendarSelect,
//     calendarWrapperRef,
//     datePickerRef,

//     showFilters,
//     setShowFilters,

//     selectedOffices,
//     setSelectedOffices,

//     leftLabel,
//   };
// }
