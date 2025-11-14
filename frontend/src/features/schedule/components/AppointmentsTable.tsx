// frontend/src/features/schedule/components/AppointmentsTable.tsx
import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import Pin from "lucide-react/dist/esm/icons/pin";
import Info from "lucide-react/dist/esm/icons/info";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";

import { Appointment, appointmentsApi } from "../services/appointmentsApi";

interface AppointmentsTableProps {
  appointments: Appointment[];
  date: Date;
  loading: boolean;
  loadAppointments: () => void;
}

/** Status & intake types */

type StatusKey =
  | "pending"
  | "arrived"
  | "in_room"
  | "no_show"
  | "cancelled"
  | "in_lobby"
  | "seen"
  | "tentative";

const STATUS_OPTIONS: {
  key: StatusKey;
  label: string;
  dotClass: string; // Tailwind bg class
}[] = [
  { key: "pending", label: "Pending arrival", dotClass: "bg-green-500" },
  { key: "arrived", label: "Arrived", dotClass: "bg-yellow-200" },
  { key: "in_room", label: "In room", dotClass: "bg-orange-500" },
  { key: "no_show", label: "No show", dotClass: "bg-red-500" },
  { key: "cancelled", label: "Cancelled", dotClass: "bg-red-900" },
  { key: "in_lobby", label: "In lobby", dotClass: "bg-yellow-500" },
  { key: "seen", label: "Seen", dotClass: "bg-gray-300" },
  { key: "tentative", label: "Tentative", dotClass: "bg-gray-600" },
];

type IntakeStatus = "not_submitted" | "submitted";

const INTAKE_OPTIONS: {
  key: IntakeStatus;
  label: string;
  dotClass: string;
}[] = [
  { key: "not_submitted", label: "Not Submitted", dotClass: "bg-orange-500" },
  { key: "submitted", label: "Submitted", dotClass: "bg-green-500" },
];

interface RowState {
  note: string;
  status: StatusKey;
  room?: string;
  intakeStatus: IntakeStatus;
}

const MAX_ROOM_LEN = 6;

/** Helpers */

function parseTimeToMinutes(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime12h(t?: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${mStr} ${suffix}`;
}

function truncateWithEllipsis(value: string, maxVisible: number) {
  if (value.length <= maxVisible) return value;
  return value.slice(0, maxVisible) + "...";
}

/**
 * AppointmentsTable
 * Renders the per-day, per-row detail table (Appointments tab).
 */
const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  date,
  loading,
  loadAppointments,
}) => {
  const [timeSortAsc, setTimeSortAsc] = useState(true);

  const [rowState, setRowState] = useState<Record<number, RowState>>({});
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");

  const [roomEditorId, setRoomEditorId] = useState<number | null>(null);
  const [roomDraft, setRoomDraft] = useState<string>("");

  const dayStr = useMemo(() => date.toISOString().split("T")[0], [date]);

  // Filter to current day
  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === dayStr),
    [appointments, dayStr]
  );

  // Initialize/refresh row state when appointments change
  // (hydrate from backend: notes, status, room, intake_status)
  useEffect(() => {
    setRowState((prev) => {
      const next: Record<number, RowState> = { ...prev };

      for (const appt of dayAppointments) {
        const anyAppt = appt as any;
        const existing = next[appt.id];

        next[appt.id] = {
          note:
            existing?.note ??
            (typeof anyAppt.notes === "string" ? anyAppt.notes : ""),
          status:
            existing?.status ??
            ((anyAppt.status as StatusKey) || ("pending" as StatusKey)),
          room: existing?.room ?? (anyAppt.room || ""),
          intakeStatus:
            existing?.intakeStatus ??
            ((anyAppt.intake_status as IntakeStatus) || "not_submitted"),
        };
      }

      return next;
    });
  }, [dayAppointments]);

  // Sorting by time (then patient name)
  const sortedAppointments = useMemo(() => {
    const list = [...dayAppointments];

    list.sort((a, b) => {
      const ta = parseTimeToMinutes(a.start_time);
      const tb = parseTimeToMinutes(b.start_time);

      if (ta !== tb) {
        return timeSortAsc ? ta - tb : tb - ta;
      }

      // Tie-break by patient name A-Z (last name then first, best-effort)
      const nameA = (a.patient_name || "").toLowerCase();
      const nameB = (b.patient_name || "").toLowerCase();
      if (nameA && nameB && nameA !== nameB) {
        return nameA < nameB ? -1 : 1;
      }

      // final tie-break: id
      return a.id - b.id;
    });

    return list;
  }, [dayAppointments, timeSortAsc]);

  const toggleTimeSort = () => setTimeSortAsc((prev) => !prev);

  /* ---------------- Status change (with persistence) ---------------- */

  const handleStatusChange = (id: number, status: StatusKey) => {
    setRowState((prev) => {
      const existing = prev[id] || {
        note: "",
        status: "pending" as StatusKey,
        room: "",
        intakeStatus: "not_submitted" as IntakeStatus,
      };
      return {
        ...prev,
        [id]: {
          ...existing,
          status,
          room: status === "seen" ? "" : existing.room,
        },
      };
    });

    if (status === "in_room") {
      const currentRoom = rowState[id]?.room || "";
      setRoomEditorId(id);
      setRoomDraft(currentRoom);
    } else {
      setRoomEditorId(null);
      setRoomDraft("");
    }

    // ---- Persist to backend ----
    const appt = appointments.find((a) => a.id === id);
    if (appt) {
      appointmentsApi
        .update(id, {
          ...appt,
          status,
          room: status === "seen" ? "" : rowState[id]?.room || "",
        })
        .then(() => loadAppointments?.())
        .catch((err) => console.error("Failed to update status:", err));
    }
  };

  /* ---------------- Intake change (with persistence) ---------------- */

  const handleIntakeChange = (id: number, intake: IntakeStatus) => {
    setRowState((prev) => {
      const existing = prev[id] || {
        note: "",
        status: "pending" as StatusKey,
        room: "",
        intakeStatus: "not_submitted" as IntakeStatus,
      };
      return {
        ...prev,
        [id]: {
          ...existing,
          intakeStatus: intake,
        },
      };
    });

    // ---- Persist to backend ----
    const appt = appointments.find((a) => a.id === id);
    if (appt) {
      appointmentsApi
        .update(id, { ...appt, intake_status: intake })
        .then(() => loadAppointments?.())
        .catch((err) => console.error("Failed to update intake status:", err));
    }
  };

  /* ---------------- Notes (with persistence) ---------------- */

  const handleNoteSave = async (id: number, noteText: string) => {
    // 1. Update UI immediately for smooth UX
    setRowState((prev) => {
      const existing = prev[id] || {
        note: "",
        status: "pending" as StatusKey,
        room: "",
        intakeStatus: "not_submitted" as IntakeStatus,
      };
      return {
        ...prev,
        [id]: {
          ...existing,
          note: noteText,
        },
      };
    });

    setEditingNoteId(null);

    // 2. Persist to backend
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    try {
      // Assuming appointmentsApi.update accepts partial payloads
      await appointmentsApi.update(id, {
        ...appt,
        provider: appt.provider,
        notes: noteText,
      });

      loadAppointments?.();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  /* ---------------- Room modal save / cancel ---------------- */

  const openRoomModal = (id: number) => {
    const currentRoom = rowState[id]?.room || "";
    setRoomEditorId(id);
    setRoomDraft(currentRoom);
  };

  const handleRoomSave = () => {
    if (roomEditorId == null) return;

    const trimmed = roomDraft.trim().slice(0, MAX_ROOM_LEN);

    setRowState((prev) => {
      const existing = prev[roomEditorId] || {
        note: "",
        status: "pending" as StatusKey,
        room: "",
        intakeStatus: "not_submitted" as IntakeStatus,
      };
      return {
        ...prev,
        [roomEditorId]: {
          ...existing,
          status: "in_room",
          room: trimmed,
        },
      };
    });

    // ---- Persist to backend ----
    const appt = appointments.find((a) => a.id === roomEditorId);
    if (appt) {
      appointmentsApi
        .update(roomEditorId, {
          ...appt,
          room: trimmed,
          status: "in_room",
        })
        .then(() => loadAppointments?.())
        .catch((err) => console.error("Failed to update room:", err));
    }

    setRoomEditorId(null);
    setRoomDraft("");
  };

  const handleRoomCancel = () => {
    setRoomEditorId(null);
    setRoomDraft("");
  };

  /* ---------------- Render helpers ---------------- */

  const renderPatientInfo = (appt: Appointment) => {
    // These are optional; backend can add them later.
    const anyAppt = appt as any;
    const dob: string | undefined = anyAppt.patient_dob;
    const genderRaw: string | undefined = anyAppt.patient_gender;
    const phone: string | undefined = anyAppt.patient_phone;

    const genderMap = (value?: string) => {
      if (!value) return "";
      const v = value.toLowerCase();
      if (v.startsWith("m")) return "M";
      if (v.startsWith("f")) return "F";
      if (v.startsWith("non")) return "NB";
      if (v.startsWith("other")) return "O";
      if (v.includes("prefer")) return "NA";
      return value.toUpperCase().slice(0, 2);
    };

    const genderAbbr = genderMap(genderRaw);

    return (
      <div className="flex flex-col">
        <div className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">
          {appt.patient_name || "(No Patient)"}
        </div>
        <div className="text-xs text-gray-600 flex flex-wrap gap-1">
          {dob && <span>{dob}</span>}
          {genderAbbr && <span>• {genderAbbr}</span>}
          {phone && <span>• {phone}</span>}
        </div>
      </div>
    );
  };

  const renderStatusLabel = (id: number, state: RowState) => {
    const base = STATUS_OPTIONS.find((o) => o.key === state.status);
    if (!base) return null;

    let label = base.label;
    if (state.status === "in_room" && state.room) {
      label = `${base.label} ${state.room}`;
    }
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${base.dotClass}`}
        />
        <span>{label}</span>
      </div>
    );
  };

  /* ---------------- Main render ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 italic">
        Loading appointments…
      </div>
    );
  }

  if (!sortedAppointments.length) {
    return (
      <div className="p-6 text-center text-gray-500 italic">
        No appointments for {format(date, "MMM d, yyyy")}.
      </div>
    );
  }

  return (
    <div className="relative">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr className="border-b">
            <th className="px-2 py-2 text-left w-10">Note</th>
            <th className="px-2 py-2 text-left w-40">Status</th>
            <th className="px-2 py-2 text-left">Patient</th>
            <th className="px-2 py-2 text-left w-32">
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-blue-600"
                onClick={toggleTimeSort}
              >
                Time
                {timeSortAsc ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            </th>
            <th className="px-2 py-2 text-left w-40">Provider</th>
            <th className="px-2 py-2 text-left w-40">Type</th>
            <th className="px-2 py-2 text-left">Chief Complaint</th>
            <th className="px-2 py-2 text-left w-40">Intake Form</th>
          </tr>
        </thead>
        <tbody>
          {sortedAppointments.map((appt) => {
            const state = rowState[appt.id] || {
              note: "",
              status: "pending" as StatusKey,
              room: "",
              intakeStatus: "not_submitted" as IntakeStatus,
            };

            const fullComplaint = appt.chief_complaint || "";
            const shortComplaint =
              fullComplaint.length > 15
                ? truncateWithEllipsis(fullComplaint, 12)
                : fullComplaint;

            const isSeen = state.status === "seen";

            return (
              <tr
                key={appt.id}
                className={`border-b ${
                  isSeen ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                {/* Note cell */}
                <td className="px-2 py-2 align-top">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-100 group"
                      onClick={() => {
                        if (editingNoteId === appt.id) {
                          setEditingNoteId(null);
                          return;
                        }
                        setNoteDraft(state.note);
                        setEditingNoteId(appt.id);
                      }}
                    >
                      <Pin size={14} className="text-gray-600" />
                      {state.note && (
                        <span className="ml-1 inline-block h-2 w-2 rounded-full bg-orange-500" />
                      )}

                      {/* Hover preview */}
                      {state.note && (
                        <div className="absolute left-6 top-0 z-20 hidden min-w-[200px] max-w-xs rounded border bg-white p-2 text-xs text-gray-800 shadow-md group-hover:block">
                          {state.note}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Inline note editor */}
                  {editingNoteId === appt.id && (
                    <div className="mt-2 rounded border bg-white p-2 shadow-md text-xs z-20 relative">
                      <textarea
                        className="w-full border rounded p-1 text-xs"
                        rows={3}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                      />

                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          className="px-2 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </button>

                        <button
                          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          type="button"
                          onClick={() => {
                            handleNoteSave(appt.id, noteDraft.trim());
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </td>

                {/* Status cell */}
                <td className="px-2 py-2 align-top relative">
                  <StatusDropdown
                    value={state.status}
                    onChange={(status) => handleStatusChange(appt.id, status)}
                    onRequestRoom={() => openRoomModal(appt.id)}
                    display={renderStatusLabel(appt.id, state)}
                  />

                  {/* Room mini-modal */}
                  {roomEditorId === appt.id && (
                    <div className="absolute z-30 mt-1 w-56 rounded-lg border bg-white p-3 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-blue-500" />
                        <span className="text-xs font-semibold">
                          Which room?
                        </span>
                      </div>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-xs"
                        maxLength={MAX_ROOM_LEN}
                        value={roomDraft}
                        onChange={(e) => setRoomDraft(e.target.value)}
                        placeholder="e.g. 2 or 309B"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                          onClick={handleRoomCancel}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={handleRoomSave}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </td>

                {/* Patient */}
                <td className="px-2 py-2 align-top">
                  {renderPatientInfo(appt)}
                </td>

                {/* Time */}
                <td className="px-2 py-2 align-top whitespace-nowrap">
                  {formatTime12h(appt.start_time)}
                </td>

                {/* Provider */}
                <td className="px-2 py-2 align-top">
                  {appt.provider_name || ""}
                </td>

                {/* Type */}
                <td className="px-2 py-2 align-top">{appt.appointment_type}</td>

                {/* Chief Complaint */}
                <td className="px-2 py-2 align-top">
                  {fullComplaint ? (
                    <div className="relative group inline-block max-w-xs">
                      <span className="truncate inline-block max-w-full align-top">
                        {shortComplaint}
                      </span>
                      {fullComplaint.length > 15 && (
                        <div className="absolute z-20 hidden max-w-xs rounded border bg-white p-2 text-xs text-gray-800 shadow-md group-hover:block">
                          {fullComplaint}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      (No chief complaint)
                    </span>
                  )}
                </td>

                {/* Intake form */}
                <td className="px-2 py-2 align-top">
                  <IntakeDropdown
                    value={state.intakeStatus}
                    onChange={(val) => handleIntakeChange(appt.id, val)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;

/* ------------------------------------------------------------------ */
/* Subcomponents: StatusDropdown & IntakeDropdown                     */
/* ------------------------------------------------------------------ */

interface StatusDropdownProps {
  value: StatusKey;
  display: React.ReactNode;
  onChange: (status: StatusKey) => void;
  onRequestRoom: () => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  display,
  onChange,
  onRequestRoom,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (key: StatusKey) => {
    setOpen(false);
    onChange(key);
    if (key === "in_room") {
      onRequestRoom();
    }
  };

  return (
    <div className="relative inline-block text-xs">
      <button
        type="button"
        className="flex items-center gap-1 rounded border px-2 py-1 bg-white hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        {display}
        <ChevronDown size={12} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-44 rounded border bg-white shadow-lg">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-gray-100 ${
                value === opt.key ? "bg-gray-50" : ""
              }`}
              onClick={() => handleSelect(opt.key)}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${opt.dotClass}`}
              />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface IntakeDropdownProps {
  value: IntakeStatus;
  onChange: (status: IntakeStatus) => void;
}

const IntakeDropdown: React.FC<IntakeDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const current = INTAKE_OPTIONS.find((o) => o.key === value);

  return (
    <div className="relative inline-block text-xs">
      <button
        type="button"
        className="flex items-center gap-2 rounded border px-2 py-1 bg-white hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        {current && (
          <>
            <span
              className={`inline-block h-2 w-2 rounded-full ${current.dotClass}`}
            />
            <span>{current.label}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-40 rounded border bg-white shadow-lg">
          {INTAKE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-gray-100 ${
                value === opt.key ? "bg-gray-50" : ""
              }`}
              onClick={() => {
                setOpen(false);
                onChange(opt.key);
              }}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${opt.dotClass}`}
              />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
