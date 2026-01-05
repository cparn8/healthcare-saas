import React from "react";
import X from "lucide-react/dist/esm/icons/x";
import { Appointment } from "../../services";
import { parseHHMM, format12Hour } from "../grid/logic/timeFormatting";

interface MultiSlotModalProps {
  appointments: Appointment[];
  onClose: () => void;
  onEditAppointment: (appt: Appointment) => void;
}

const MultiSlotModal: React.FC<MultiSlotModalProps> = ({
  appointments,
  onClose,
  onEditAppointment,
}) => {
  if (!appointments || appointments.length === 0) return null;

  // ---- Group appointments by office ----
  const grouped = appointments.reduce<Record<string, Appointment[]>>(
    (acc, appt) => {
      const key = appt.office ?? "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(appt);
      return acc;
    },
    {}
  );

  const formatTimeRange = (appt: Appointment) => {
    if (!appt.start_time || !appt.end_time) return "";

    const startMins = parseHHMM(appt.start_time);
    const endMins = parseHHMM(appt.end_time);

    const startH = Math.floor(startMins / 60);
    const startM = startMins % 60;

    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;

    return `${format12Hour(startH, startM)} – ${format12Hour(endH, endM)}`;
  };

  const isBlock = (appt: Appointment) =>
    appt.is_block === true ||
    (appt.appointment_type || "").toLowerCase() === "block time";

  const OFFICE_LABEL = {
    north: "North Office",
    south: "South Office",
  } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
            {appointments.length} appointments in this slot
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkPrimary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(grouped).map(([office, list]) => (
            <div key={office} className="space-y-2">
              <div className="text-sm font-semibold text-text-primary dark:text-text-darkPrimary">
                {OFFICE_LABEL[office as keyof typeof OFFICE_LABEL] ??
                  office.toUpperCase()}
              </div>

              {list.map((appt) => {
                const timeRange = formatTimeRange(appt);

                return (
                  <button
                    key={
                      appt.id ??
                      `${appt.date}-${appt.start_time}-${appt.provider}`
                    }
                    onClick={() => {
                      onEditAppointment(appt);
                      onClose();
                    }}
                    className="w-full text-left border border-bg dark:border-bg-dark rounded-md px-3 py-2 flex flex-col gap-0.5 hover:bg-gray-50 transition"
                    style={{
                      backgroundColor:
                        appt.appointment_type === "Block Time"
                          ? "#737373"
                          : appt.color_code || "#3B82F6",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-darkPrimary">
                        {timeRange || appt.date}
                      </span>
                    </div>

                    {isBlock(appt) ? (
                      <>
                        <div className="text-sm font-semibold text-text-darkPrimary">
                          {appt.appointment_type || "Block Time"}
                        </div>

                        <div className="text-xs text-text-darkPrimary opacity-90">
                          {appt.provider_name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-text-darkPrimary">
                          {appt.patient_name || "(No Patient)"}
                        </div>
                        <div>
                          <span className="text-xs text-text-darkPrimary opacity-90">
                            {appt.appointment_type}{" "}
                            <span className="pr-3"></span> Provider:{" "}
                            {appt.provider_name}
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-bg dark:border-bg-dark flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default MultiSlotModal;
