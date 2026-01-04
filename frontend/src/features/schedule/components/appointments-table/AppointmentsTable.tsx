import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import Pin from "lucide-react/dist/esm/icons/pin";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";

import { Appointment, appointmentsApi } from "../../services";

import {
  StatusKey,
  IntakeStatus,
  STATUS_OPTIONS,
  BLOCK_STATUS_OPTIONS,
  MAX_ROOM_LEN,
} from "../../logic";

import {
  StatusDropdown,
  IntakeDropdown,
  NoteModal,
  RoomModal,
} from "./_components";

/* -------------------------------------------------------------------------- */
/* Types & props                                                              */
/* -------------------------------------------------------------------------- */

interface AppointmentsTableProps {
  appointments: Appointment[];
  date: Date;
  loading: boolean;
  loadAppointments: () => void;
  selectedOffices: string[];
}

interface RowState {
  note: string;
  status: StatusKey;
  room?: string;
  intakeStatus: IntakeStatus;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
  return value.substring(0, maxVisible) + "...";
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  date,
  loading,
  loadAppointments,
  selectedOffices,
}) => {
  const [timeSortAsc, setTimeSortAsc] = useState(true);

  const [rowState, setRowState] = useState<Record<number, RowState>>({});
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [roomEditorId, setRoomEditorId] = useState<number | null>(null);
  const [roomDraft, setRoomDraft] = useState("");
  const [refreshQueued, setRefreshQueued] = useState(false);

  const noteModalRef = React.useRef<HTMLDivElement | null>(null);
  const roomModalRef = React.useRef<HTMLDivElement | null>(null);
  const noteInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const roomInputRef = React.useRef<HTMLInputElement | null>(null);

  const dayStr = useMemo(() => date.toISOString().split("T")[0], [date]);
  const safeRefresh = () => setRefreshQueued(true);
  const showLocationColumn = selectedOffices.length > 1;

  /* ---------------------------------------------------------------------- */
  /* NOTE SAVING                                                            */
  /* ---------------------------------------------------------------------- */

  const handleNoteSave = async (id: number, note: string) => {
    setRowState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        note,
      },
    }));

    setEditingNoteId(null);

    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    try {
      await appointmentsApi.update(id, { ...appt, notes: note });
      safeRefresh();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* ROOM SAVING                                                            */
  /* ---------------------------------------------------------------------- */

  const handleRoomSave = () => {
    if (!roomEditorId) return;

    const trimmed = roomDraft.trim().slice(0, MAX_ROOM_LEN);

    const existing = rowState[roomEditorId] || {
      note: "",
      status: "pending" as StatusKey,
      room: "",
      intakeStatus: "not_submitted" as IntakeStatus,
    };

    setRowState((prev) => ({
      ...prev,
      [roomEditorId]: {
        ...existing,
        status: "in_room",
        room: trimmed,
      },
    }));

    const appt = appointments.find((a) => a.id === roomEditorId);

    if (appt) {
      appointmentsApi
        .update(roomEditorId, { ...appt, room: trimmed, status: "in_room" })
        .then(() => safeRefresh())
        .catch((err) => console.error("Failed to update room:", err));
    }

    setRoomEditorId(null);
    setRoomDraft("");
  };

  const handleRoomCancel = () => {
    setRoomEditorId(null);
    setRoomDraft("");
  };

  /* ---------------------------------------------------------------------- */
  /* AUTOSAVE HOOKS                                                         */
  /* ---------------------------------------------------------------------- */

  const noteSaveRef = React.useRef(handleNoteSave);
  const roomSaveRef = React.useRef(handleRoomSave);

  useEffect(() => {
    noteSaveRef.current = handleNoteSave;
    roomSaveRef.current = handleRoomSave;
  });

  /* Autofocus note modal */
  useEffect(() => {
    if (editingNoteId !== null && noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.select();
    }
  }, [editingNoteId]);

  /* Autofocus room modal */
  useEffect(() => {
    if (roomEditorId === null) return;

    requestAnimationFrame(() => {
      if (roomInputRef.current) {
        roomInputRef.current.focus();
        roomInputRef.current.select();
      }
    });
  }, [roomEditorId]);

  /* Refresh once modals close */
  useEffect(() => {
    const modalOpen = editingNoteId !== null || roomEditorId !== null;

    if (!modalOpen && refreshQueued) {
      setRefreshQueued(false);
      loadAppointments?.();
    }
  }, [editingNoteId, roomEditorId, refreshQueued, loadAppointments]);

  /* Global keyboard + click-outside handlers */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Note
      if (editingNoteId !== null) {
        if (e.key === "Escape") setEditingNoteId(null);
        if (e.key === "Enter" && e.ctrlKey) {
          noteSaveRef.current(editingNoteId, noteDraft.trim());
        }
      }

      // Room
      if (roomEditorId !== null) {
        if (e.key === "Escape") handleRoomCancel();
        if (e.key === "Enter") roomSaveRef.current();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        editingNoteId !== null &&
        noteModalRef.current &&
        !noteModalRef.current.contains(e.target as Node)
      ) {
        setEditingNoteId(null);
      }
      if (
        roomEditorId !== null &&
        roomModalRef.current &&
        !roomModalRef.current.contains(e.target as Node)
      ) {
        handleRoomCancel();
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingNoteId, roomEditorId, noteDraft]);

  /* ---------------------------------------------------------------------- */
  /* FILTER TO CURRENT DAY                                                  */
  /* ---------------------------------------------------------------------- */

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === dayStr),
    [appointments, dayStr]
  );

  /* ---------------------------------------------------------------------- */
  /* INITIALIZE LOCAL ROW STATE                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const modalOpen = editingNoteId !== null || roomEditorId !== null;
    if (modalOpen) return;

    setRowState((prev) => {
      const next: Record<number, RowState> = { ...prev };

      for (const appt of dayAppointments) {
        const anyAppt = appt as any;

        const isBlock = !!anyAppt.is_block;
        const backendStatus = anyAppt.status || "pending";

        let derivedStatus: StatusKey;

        if (isBlock) {
          derivedStatus =
            backendStatus === "in_room" ? "in_room" : ("na" as StatusKey);
        } else {
          derivedStatus = backendStatus as StatusKey;
        }

        next[appt.id] = {
          note:
            prev[appt.id]?.note ??
            (typeof anyAppt.notes === "string" ? anyAppt.notes : ""),
          status: prev[appt.id]?.status ?? derivedStatus,
          room: prev[appt.id]?.room ?? (anyAppt.room || ""),
          intakeStatus:
            prev[appt.id]?.intakeStatus ??
            ((anyAppt.intake_status as IntakeStatus) || "not_submitted"),
        };
      }

      return next;
    });
  }, [dayAppointments, editingNoteId, roomEditorId]);

  /* ---------------------------------------------------------------------- */
  /* SORTING                                                                */
  /* ---------------------------------------------------------------------- */

  const sortedAppointments = useMemo(() => {
    const list = [...dayAppointments];

    list.sort((a, b) => {
      const ta = parseTimeToMinutes(a.start_time);
      const tb = parseTimeToMinutes(b.start_time);

      if (ta !== tb) {
        return timeSortAsc ? ta - tb : tb - ta;
      }

      const nameA = (a.patient_name || "").toLowerCase();
      const nameB = (b.patient_name || "").toLowerCase();

      if (nameA !== nameB) return nameA < nameB ? -1 : 1;

      return a.id - b.id;
    });

    return list;
  }, [dayAppointments, timeSortAsc]);

  const toggleTimeSort = () => setTimeSortAsc((p) => !p);

  /* ---------------------------------------------------------------------- */
  /* STATUS CHANGES                                                          */
  /* ---------------------------------------------------------------------- */

  const handleStatusChange = (id: number, status: StatusKey) => {
    const appt = appointments.find((a) => a.id === id);
    const isBlock = !!(appt as any)?.is_block;

    const existing = rowState[id] || {
      note: "",
      status: "pending" as StatusKey,
      room: "",
      intakeStatus: "not_submitted" as IntakeStatus,
    };

    const shouldClearRoom = status === "seen" || (isBlock && status === "na");

    setRowState((prev) => ({
      ...prev,
      [id]: {
        ...existing,
        status,
        room: shouldClearRoom ? "" : existing.room,
      },
    }));

    if (status === "in_room") {
      setRoomEditorId(id);
      setRoomDraft(existing.room || "");
    } else {
      setRoomEditorId(null);
      setRoomDraft("");
    }

    if (!appt) return;

    let backendStatus: Appointment["status"] =
      status === "na" ? "pending" : status;

    const roomForBackend =
      backendStatus === "seen" || (isBlock && backendStatus === "pending")
        ? ""
        : rowState[id]?.room || "";

    appointmentsApi
      .update(id, { ...appt, status: backendStatus, room: roomForBackend })
      .then(() => safeRefresh())
      .catch((err) => console.error("Failed to update status:", err));
  };

  /* ---------------------------------------------------------------------- */
  /* INTAKE CHANGE                                                           */
  /* ---------------------------------------------------------------------- */

  const handleIntakeChange = (id: number, intake: IntakeStatus) => {
    setRowState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        intakeStatus: intake,
      },
    }));

    const appt = appointments.find((a) => a.id === id);
    if (appt) {
      appointmentsApi
        .update(id, { ...appt, intake_status: intake })
        .then(() => safeRefresh())
        .catch((err) => console.error("Failed to update intake:", err));
    }
  };

  /* ---------------------------------------------------------------------- */
  /* PATIENT INFO RENDER                                                     */
  /* ---------------------------------------------------------------------- */

  const renderPatientMeta = (appt: Appointment) => {
    const anyAppt = appt as any;

    const dobRaw: string | undefined = anyAppt.patient_dob;
    const genderRaw: string | undefined = anyAppt.patient_gender;

    if (!dobRaw && !genderRaw) return null;

    const genderMap = (value?: string) => {
      if (!value) return "";
      const v = value.toLowerCase();
      if (v.startsWith("m")) return "M";
      if (v.startsWith("f")) return "F";
      if (v.startsWith("non")) return "NB";
      return value.slice(0, 1).toUpperCase();
    };

    const gender = genderMap(genderRaw);

    const dobFormatted = dobRaw ? format(new Date(dobRaw), "MM/dd/yyyy") : "";

    return (
      <span className="text-s text-text-primary dark:text-text-darkPrimary">
        {gender} {dobFormatted}
      </span>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* MAIN RENDER                                                            */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="p-6 text-center text-text-secondary dark:text-text-darkSecondary italic">
        Loading appointments…
      </div>
    );
  }

  if (!sortedAppointments.length) {
    return (
      <div className="p-6 text-center text-text-secondary dark:text-text-darkSecondary italic">
        No appointments for {format(date, "MMM d, yyyy")}.
      </div>
    );
  }

  return (
    <div className="relative">
      <table className="w-full text-sm border border-grid-border dark:border-grid-dborder">
        <thead className="bg-grid-top dark:bg-grid-dtop">
          <tr className="border-b border-grid-border dark:border-grid-dborder">
            <th className="px-2 py-2 text-left">Note</th>
            {showLocationColumn && (
              <th className="px-2 py-2 text-left">Location</th>
            )}
            <th className="px-2 py-2 text-left">Status</th>
            <th className="px-2 py-2 text-left">Patient</th>
            <th className="px-2 py-2 text-left">Gender/DOB</th>
            <th className="px-2 py-2 text-left">
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-primary"
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
            <th className="px-2 py-2 text-left">Provider</th>
            <th className="px-2 py-2 text-left">Type</th>
            <th className="px-2 py-2 text-left">Chief Complaint</th>
            <th className="px-2 py-2 text-left">Intake Form</th>
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

            const anyAppt = appt as any;
            const isBlock = !!anyAppt.is_block;

            const fullComplaint = appt.chief_complaint || "";
            const shortComplaint =
              fullComplaint.length > 15
                ? truncateWithEllipsis(fullComplaint, 12)
                : fullComplaint;

            const isSeen = state.status === "seen";
            const baseRowColor = isBlock
              ? "bg-grid-block dark:bg-grid-dblock"
              : isSeen
              ? "bg-grid-top dark:bg-grid-dark"
              : "bg-surface dark:bg-surface-dark";

            const hoverClass = isBlock
              ? ""
              : " hover:bg-bg dark:hover:bg-bg-dark";

            return (
              <tr
                key={appt.id}
                className={`border-b border-grid-border dark:border-grid-dborder ${baseRowColor}${hoverClass} transition-colors`}
              >
                {/* NOTE CELL */}
                <td className="px-2 py-2 align-top">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-grid-slot dark:hover:bg-grid-dslot group"
                      onClick={() => {
                        if (editingNoteId === appt.id) {
                          setEditingNoteId(null);
                          return;
                        }
                        setNoteDraft(state.note);
                        setEditingNoteId(appt.id);
                      }}
                    >
                      <Pin
                        size={14}
                        className="text-text-primary dark:text-text-darkPrimary"
                      />
                      {state.note && (
                        <span className="ml-1 inline-block h-2 w-2 rounded-full bg-orange-500" />
                      )}

                      {state.note && (
                        <div className="absolute left-6 top-0 z-20 hidden min-w-[200px] max-w-xs rounded border border-input-light dark:border-input-dborder bg-input-lighter dark:bg-input-dlight p-2 text-xs text-text-primary dark:text-text-darkPrimary shadow-md group-hover:block">
                          {state.note}
                        </div>
                      )}
                    </button>
                  </div>

                  {editingNoteId === appt.id && (
                    <NoteModal
                      draft={noteDraft}
                      onChange={setNoteDraft}
                      onCancel={() => setEditingNoteId(null)}
                      onSave={() => handleNoteSave(appt.id, noteDraft.trim())}
                      modalRef={noteModalRef}
                      textareaRef={noteInputRef}
                    />
                  )}
                </td>

                {/* LOCATION */}
                {showLocationColumn && (
                  <td className="capitalize px-2 py-2 align-top">
                    {appt.office}
                  </td>
                )}

                {/* STATUS CELL */}
                <td className="px-2 py-2 align-top relative">
                  <StatusDropdown
                    value={state.status}
                    display={(() => {
                      const options = isBlock
                        ? BLOCK_STATUS_OPTIONS
                        : STATUS_OPTIONS;
                      const base = options.find((o) => o.key === state.status);

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
                    })()}
                    onChange={(status) => handleStatusChange(appt.id, status)}
                    isBlock={isBlock}
                  />

                  {roomEditorId === appt.id && (
                    <RoomModal
                      roomDraft={roomDraft}
                      onChange={setRoomDraft}
                      onCancel={handleRoomCancel}
                      onSave={handleRoomSave}
                      modalRef={roomModalRef}
                      inputRef={roomInputRef}
                      maxRoomLength={MAX_ROOM_LEN}
                    />
                  )}
                </td>

                {/* PATIENT NAME */}
                <td className="px-2 py-2 align-top">
                  {isBlock ? (
                    "BLOCK TIME"
                  ) : (
                    <div className="text-sm font-medium text-text-primary dark:text-text-darkPrimary">
                      {appt.patient_name || "(No Patient)"}
                    </div>
                  )}
                </td>

                {/* PATIENT INFO (DOB + GENDER) */}
                <td className="px-2 py-2 align-top whitespace-nowrap">
                  {!isBlock && renderPatientMeta(appt)}
                </td>

                {/* TIME */}
                <td className="px-2 py-2 align-top whitespace-nowrap">
                  {formatTime12h(appt.start_time)}
                </td>

                {/* PROVIDER */}
                <td className="px-2 py-2 align-top">
                  {appt.provider_name || ""}
                </td>

                {/* TYPE */}
                <td className="px-2 py-2 align-top">{appt.appointment_type}</td>

                {/* CC */}
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
                    <span className="text-text-muted dark:text-text-darkMuted italic text-xs">
                      (No chief complaint)
                    </span>
                  )}
                </td>

                {/* INTAKE */}
                <td className="px-2 py-2 align-top">
                  {isBlock ? null : (
                    <IntakeDropdown
                      value={state.intakeStatus}
                      onChange={(val) => handleIntakeChange(appt.id, val)}
                    />
                  )}
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
