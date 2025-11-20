import React from "react";
import X from "lucide-react/dist/esm/icons/x";
import { Appointment } from "../../services";

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
    const start = appt.start_time ?? "";
    const end = appt.end_time ?? "";
    return start && end ? `${start} – ${end}` : start || end || "";
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">
            {appointments.length} appointments in this slot
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(grouped).map(([office, list]) => (
            <div key={office} className="space-y-2">
              <div className="text-sm font-semibold text-gray-600">
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
                    className="w-full text-left border rounded-md px-3 py-2 flex flex-col gap-0.5 hover:bg-gray-50 transition"
                    style={{
                      backgroundColor:
                        appt.appointment_type === "Block Time"
                          ? "#737373"
                          : appt.color_code || "#3B82F6",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900">
                        {timeRange || appt.date}
                      </span>
                    </div>

                    {isBlock(appt) ? (
                      <>
                        <div className="text-sm font-semibold text-white">
                          {appt.appointment_type || "Block Time"}
                        </div>
                        <div className="text-xs text-white opacity-90">
                          {appt.provider_name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-white">
                          {appt.patient_name || "(No Patient)"}
                        </div>
                        <div className="text-xs text-white opacity-90">
                          {appt.appointment_type}
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
        <div className="px-4 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default MultiSlotModal;
